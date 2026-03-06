import { useState, useEffect } from "react";
import {
  Wand2,
  Loader2,
  ChevronRight,
  Video,
  FileText,
  Play,
  Presentation,
  Grid3X3,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import { ModelSelector, VideoModelSelector } from "@/components/ui/model-selector";
import { ContentTypeSelector } from "@/components/ui/content-type-selector";
import { FileUploadZone, type UploadedFile } from "@/components/ui/file-upload-zone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SlideshowPreview, SlideshowGrid } from "@/components/ui/slideshow-preview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/common/hooks/useProjects";
import type { PexelsVideo } from "@/common/hooks/usePexelsVideos";
import { storageService } from "@/api/storage-service";
import { generateVideo, type VideoFormat, type Screenplay } from "@/api/video-generation-service";
import { supabase } from "@/api/client";
import { parseDocuments, type ParsedDocument } from "@/common/utils/document-parser";
import {
  generateSlideshow,
  exportSlideshow,
  type SlideData,
  type SlideshowStyle,
  type ContentAiModel,
} from "@/api/slideshow-service";

async function extractTextFromFiles(files: UploadedFile[]): Promise<{
  text: string;
  documents: ParsedDocument[];
}> {
  const filesToParse = files.filter((f) => f.file).map((f) => f.file!);

  if (filesToParse.length === 0) {
    return { text: "", documents: [] };
  }

  const result = await parseDocuments(filesToParse);

  if (result.errors.length > 0) {
    console.warn("Document parsing errors:", result.errors);
  }

  return {
    text: result.combinedText,
    documents: result.documents,
  };
}

interface GenerationPanelProps {
  selectedVideo?: PexelsVideo | null;
  existingProject?: Project | null;
  onScreenplayGenerated?: (screenplay: Screenplay, projectId: string) => void;
  onAiModelChange?: (model: string) => void;
  onFormatChange?: (format: VideoFormat) => void;
}

export function GenerationPanel({
  selectedVideo,
  existingProject,
  onScreenplayGenerated,
  onAiModelChange,
  onFormatChange,
}: GenerationPanelProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedVideoModel, setSelectedVideoModel] = useState("fal-ai/ovi");
  const [contentType, setContentType] = useState<"reel" | "short" | "vfx_movie" | "presentation">(
    "reel",
  );
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState([30]);
  const [voiceover, setVoiceover] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [topic, setTopic] = useState("");
  const [extractedContent, setExtractedContent] = useState<{
    text: string;
    documents: ParsedDocument[];
  } | null>(null);

  // Slideshow state
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState(false);
  const [slideshowSlides, setSlideshowSlides] = useState<SlideData[] | null>(null);
  const [slideshowStyle, setSlideshowStyle] = useState<SlideshowStyle>("modern");
  const [slideshowView, setSlideshowView] = useState<"carousel" | "grid">("carousel");
  const [contentAiModel, setContentAiModel] = useState<ContentAiModel>("openai");
  const [isExportingSlideshow, setIsExportingSlideshow] = useState<"pptx" | "pdf" | null>(null);

  const formatMap: Record<string, VideoFormat> = {
    reel: "reel",
    short: "short_video",
    vfx_movie: "vfx_movie",
    presentation: "presentation",
  };

  useEffect(() => {
    onAiModelChange?.(selectedModel);
  }, [selectedModel, onAiModelChange]);

  useEffect(() => {
    onFormatChange?.(formatMap[contentType] || "reel");
  }, [contentType, onFormatChange]);

  // Load existing project data
  useEffect(() => {
    const loadProjectData = async () => {
      if (existingProject) {
        setSelectedModel(existingProject.model || "gpt-4o");
        setContentType((existingProject.content_type as any) || "reel");
        setDuration([existingProject.target_duration || 30]);
        setVoiceover(existingProject.voiceover_enabled ?? true);
        setCaptions(existingProject.captions_enabled ?? true);

        // Fetch project files
        try {
          const projectFiles = await storageService.getProjectFiles(existingProject.id);
          const mappedFiles: UploadedFile[] = projectFiles.map((f) => ({
            id: f.id,
            name: f.file_name,
            size: f.file_size,
            type: f.file_type,
            file_url: f.file_url,
            // No 'file' object because it's remote
          }));
          setFiles(mappedFiles);
        } catch (err) {
          console.error("Failed to load project files", err);
        }
      } else {
        // Reset if no project (navigate back to home or new project)
        setFiles([]);
        // Don't reset other settings necessarily if we want to keep user preferences,
        // but for now let's keep it simple.
      }
    };
    loadProjectData();
  }, [existingProject]);

  const handleFilesChange = async (newFiles: UploadedFile[]) => {
    // 1. Update local state first to show them in UI
    setFiles(newFiles);

    // 2. Extract text content from new files
    if (newFiles.length > 0) {
      const filesToExtract = newFiles.filter((f) => f.file);
      if (filesToExtract.length > 0) {
        toast.info("Extracting content from documents...");
        try {
          const extracted = await extractTextFromFiles(newFiles);
          setExtractedContent(extracted);
          if (extracted.text) {
            toast.success(
              `Extracted ${extracted.documents.length} document(s) - ${extracted.text.length} characters`,
            );
          }
        } catch (err) {
          console.error("Failed to extract content:", err);
          toast.error("Failed to extract document content");
        }
      }
    } else {
      setExtractedContent(null);
    }

    // 3. If we have an existing project, auto-upload the new files
    if (existingProject) {
      const filesToUpload = newFiles.filter((f) => f.file && !f.file_url);

      if (filesToUpload.length > 0) {
        setIsUploading(true);
        try {
          let uploadedCount = 0;
          await Promise.all(
            filesToUpload.map(async (f) => {
              if (f.file) {
                try {
                  await storageService.uploadFile(existingProject.id, f.file);
                  uploadedCount++;
                } catch (err) {
                  console.error("Failed to upload file", f.name, err);
                  toast.error(`Failed to upload ${f.name}`);
                }
              }
            }),
          );

          if (uploadedCount > 0) {
            toast.success(`Uploaded ${uploadedCount} file(s)`);
            const projectFiles = await storageService.getProjectFiles(existingProject.id);
            setFiles(
              projectFiles.map((pf) => ({
                id: pf.id,
                name: pf.file_name,
                size: pf.file_size,
                type: pf.file_type,
                file_url: pf.file_url,
              })),
            );
          }
        } catch (error) {
          console.error("Auto-upload error:", error);
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please describe what this course module should cover");
      return;
    }

    setIsGenerating(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to generate videos");
        return;
      }

      const projectName =
        files[0]?.name?.split(".")[0] || topic.slice(0, 30) || "Untitled Course Module";

      // Prepare background video if selected
      const backgroundVideo = selectedVideo
        ? {
            id: String(selectedVideo.id),
            url: selectedVideo.videoFiles?.[0]?.link || selectedVideo.url,
            thumbnailUrl: selectedVideo.image,
          }
        : undefined;

      // Use already extracted content or extract now
      const documentContent = extractedContent?.text || (await extractTextFromFiles(files)).text;

      toast.info("Generating screenplay...");

      // Call backend API
      const result = await generateVideo({
        projectName,
        format: formatMap[contentType] || "reel",
        targetDuration: duration[0],
        topic,
        aiModel: selectedModel,
        enableVoiceover: voiceover,
        enableCaptions: captions,
        userId: user.id,
        backgroundVideo,
        documentContent: documentContent || undefined,
      });

      console.log("API Response:", result);
      console.log("Screenplay generated:", result.screenplay);
      console.log("Project ID:", result.projectId);

      if (!result.screenplay) {
        console.error("No screenplay in response. Full result:", JSON.stringify(result, null, 2));
        toast.error("Screenplay generation failed - no screenplay returned");
        return;
      }

      toast.success(result.message || "Screenplay generated! Review and refine it in the chat.");

      if (onScreenplayGenerated) {
        onScreenplayGenerated(result.screenplay, result.projectId);
      }

      // Handle file uploads if we have files
      if (result.projectId && files.length > 0) {
        const filesToUpload = files.filter((f) => f.file);

        if (filesToUpload.length > 0) {
          toast.info(`Uploading ${filesToUpload.length} file(s)...`);

          await Promise.all(
            filesToUpload.map(async (f) => {
              if (f.file) {
                await storageService.uploadFile(result.projectId, f.file);
              }
            }),
          );

          toast.success("Files uploaded successfully");
        }
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to generate video: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = topic.trim().length > 0;

  // Full slideshow generation
  const handleFullSlideshow = async () => {
    if (!extractedContent?.text && !topic.trim()) {
      toast.error("Please add a topic or upload a document first");
      return;
    }

    setIsGeneratingSlideshow(true);
    setSlideshowSlides(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const content = extractedContent?.text || topic;
      const title = extractedContent?.documents[0]?.title || topic.slice(0, 50);
      const maxSlides = Math.round(duration[0] / 6); // Calculate from slider

      toast.info(`Generating slideshow (up to ${maxSlides} slides)...`);

      const result = await generateSlideshow({
        content,
        title,
        maxSlides,
        style: slideshowStyle,
        userId: user?.id,
        contentAiModel,
      });

      if (result.success && result.slides) {
        setSlideshowSlides(result.slides);
        toast.success(`Generated ${result.slideCount} slides!`);
      } else {
        toast.error(result.error || "Failed to generate slideshow");
      }
    } catch (error) {
      console.error("Slideshow generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate slideshow");
    } finally {
      setIsGeneratingSlideshow(false);
    }
  };

  const slideshowTitle = extractedContent?.documents[0]?.title || topic.slice(0, 50) || "Slideshow";

  const handleExportSlideshow = async (format: "pptx" | "pdf") => {
    if (!slideshowSlides?.length) {
      return;
    }
    setIsExportingSlideshow(format);
    try {
      const result = await exportSlideshow({
        slides: slideshowSlides,
        title: slideshowTitle,
        format,
      });
      if (result.success) {
        toast.success(`Downloaded as ${format.toUpperCase()}`);
      } else {
        toast.error(result.error || "Export failed");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExportingSlideshow(null);
    }
  };

  // Download slideshow as JSON (can be used to recreate or export)
  const handleDownloadSlideshow = () => {
    if (!slideshowSlides) {
      return;
    }

    const slideshowData = {
      title: slideshowTitle,
      style: slideshowStyle,
      slides: slideshowSlides,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(slideshowData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slideshow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Slideshow data downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Topic Input */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            1
          </span>
          <h2 className="font-semibold">Describe Your Course Module</h2>
        </div>
        <Textarea
          placeholder="What should this module cover? E.g., 'Introduction to Python variables and data types' or 'Explain the concept of object-oriented programming with examples'"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </section>

      {/* File Upload */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            2
          </span>
          <h2 className="font-semibold">
            Upload Course Materials{" "}
            <span className="font-normal text-muted-foreground">(PDF, PPTX, DOCX)</span>
          </h2>
          {isUploading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <FileUploadZone files={files} onFilesChange={handleFilesChange} />

        {/* Extracted Content Preview */}
        {extractedContent && extractedContent.text && (
          <div className="mt-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Extracted Content Preview</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {extractedContent.documents.length} doc(s) •{" "}
                {extractedContent.text.length.toLocaleString()} chars
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
              <pre className="whitespace-pre-wrap font-mono">
                {extractedContent.text.substring(0, 1000)}
                {extractedContent.text.length > 1000 && "..."}
              </pre>
            </div>
          </div>
        )}

        {/* Slideshow Preview - Full Width */}
        {slideshowSlides && slideshowSlides.length > 0 && (
          <div className="-mx-4 mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 md:-mx-6 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold text-primary">
                  Slideshow Generated ({slideshowSlides.length} slides)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                  <button
                    onClick={() => setSlideshowView("carousel")}
                    className={`rounded px-2 py-1.5 text-xs transition-colors ${
                      slideshowView === "carousel"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Carousel view"
                  >
                    <Play className="mr-1 inline h-3 w-3" />
                    Present
                  </button>
                  <button
                    onClick={() => setSlideshowView("grid")}
                    className={`rounded px-2 py-1.5 text-xs transition-colors ${
                      slideshowView === "grid"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="mr-1 inline h-3 w-3" />
                    Grid
                  </button>
                </div>
                {/* Download as PPT / PDF */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => handleExportSlideshow("pptx")}
                  disabled={!!isExportingSlideshow}
                >
                  {isExportingSlideshow === "pptx" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download as PPT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => handleExportSlideshow("pdf")}
                  disabled={!!isExportingSlideshow}
                >
                  {isExportingSlideshow === "pdf" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download as PDF
                </Button>
              </div>
            </div>

            {slideshowView === "carousel" ? (
              <SlideshowPreview
                slides={slideshowSlides}
                autoPlay={false}
                onDownload={handleDownloadSlideshow}
              />
            ) : (
              <SlideshowGrid
                slides={slideshowSlides}
                onSlideClick={() => {
                  setSlideshowView("carousel");
                }}
              />
            )}
          </div>
        )}
      </section>

      {/* Selected Background Video */}
      {selectedVideo && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Selected Background</span>
          </div>
          <div className="glass flex items-center gap-3 rounded-xl p-3">
            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
              <img
                src={selectedVideo.image}
                alt="Selected video"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">By {selectedVideo.user}</p>
              <p className="text-xs text-muted-foreground">
                {selectedVideo.duration}s • {selectedVideo.width}x{selectedVideo.height}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Content Type */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            3
          </span>
          <h2 className="font-semibold">Choose Format</h2>
        </div>
        <ContentTypeSelector
          value={contentType}
          onValueChange={(v) => setContentType(v as typeof contentType)}
        />
      </section>

      {/* Model Selection */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            4
          </span>
          <h2 className="font-semibold">
            {contentType === "presentation" ? "AI & Style Settings" : "AI Models"}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Screenplay/Content AI Model */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">
                {contentType === "presentation"
                  ? "Choose Model for Slideshows"
                  : "Choose Model for Screenplay Generation"}
              </span>
              <span className="text-xs text-muted-foreground">
                {contentType === "presentation"
                  ? "Slide content & narration"
                  : "Script & narration generation"}
              </span>
            </div>
            <ModelSelector value={selectedModel} onValueChange={setSelectedModel} />
          </div>

          {/* Video Generation Model OR Slideshow Style */}
          {contentType === "presentation" ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium">Slideshow Style</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["modern", "minimal", "corporate", "creative"] as SlideshowStyle[]).map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => setSlideshowStyle(style)}
                      className={`rounded-lg px-4 py-2 text-sm capitalize transition-all ${
                        slideshowStyle === style
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {style}
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium">Video Generation</span>
                <span className="text-xs text-muted-foreground">Text-to-video rendering</span>
              </div>
              <VideoModelSelector
                value={selectedVideoModel}
                onValueChange={setSelectedVideoModel}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Supports speech tags, ambient audio, and vertical/horizontal/square formats
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Settings */}
      <section className="glass space-y-4 rounded-xl p-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {contentType === "presentation" ? "Slideshow Settings" : "Generation Settings"}
        </h3>

        {contentType === "presentation" ? (
          <>
            {/* Max Slides for Presentation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxSlides" className="text-sm">
                  Maximum Slides
                </Label>
                <span className="font-mono text-sm text-primary">
                  {Math.round(duration[0] / 6)}
                </span>
              </div>
              <Slider
                id="maxSlides"
                value={duration}
                onValueChange={setDuration}
                min={24}
                max={90}
                step={6}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Each slide is ~30 seconds with narration
              </p>
            </div>

            {/* Content AI model for slideshow generation */}
            <div className="space-y-2">
              <Label className="text-sm">Choose Model for Screenplay Generation</Label>
              <Select
                value={contentAiModel}
                onValueChange={(v) => setContentAiModel(v as ContentAiModel)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">GPT-4o</SelectItem>
                  <SelectItem value="kimi">Kimi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="voiceover" className="cursor-pointer text-sm">
                  Include Speaker Notes
                </Label>
              </div>
              <Switch id="voiceover" checked={voiceover} onCheckedChange={setVoiceover} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="captions" className="cursor-pointer text-sm">
                  AI Background Images (per slide)
                </Label>
              </div>
              <Switch id="captions" checked={captions} onCheckedChange={setCaptions} />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="duration" className="text-sm">
                  Target Duration
                </Label>
                <span className="font-mono text-sm text-primary">{duration[0]}s</span>
              </div>
              <Slider
                id="duration"
                value={duration}
                onValueChange={setDuration}
                min={15}
                max={90}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="voiceover" className="cursor-pointer text-sm">
                  AI Voiceover
                </Label>
                <p className="text-xs text-muted-foreground">Generate natural narration</p>
              </div>
              <Switch id="voiceover" checked={voiceover} onCheckedChange={setVoiceover} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="captions" className="cursor-pointer text-sm">
                  Auto Captions
                </Label>
                <p className="text-xs text-muted-foreground">Add synchronized subtitles</p>
              </div>
              <Switch id="captions" checked={captions} onCheckedChange={setCaptions} />
            </div>
          </>
        )}
      </section>

      {/* Generate Button */}
      {contentType === "presentation" ? (
        <div className="space-y-3">
          <Button
            onClick={handleFullSlideshow}
            disabled={!canGenerate || isGeneratingSlideshow}
            className="h-14 w-full rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent text-lg font-semibold text-primary-foreground transition-all hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 hover:shadow-[0_0_30px_hsl(174_72%_56%/0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGeneratingSlideshow ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Slideshow...
              </>
            ) : (
              <>
                <Presentation className="mr-2 h-5 w-5" />
                Generate Slideshow
                <ChevronRight className="ml-auto h-5 w-5" />
              </>
            )}
          </Button>

          {/* Quick Actions */}
          {/* <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSlideshowPreview}
              disabled={!canGenerate || isGeneratingSlideshow}
              className="flex-1 gap-2"
            >
              <Presentation className="h-3.5 w-3.5" />
              Quick Preview (4 slides)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestVideo}
              disabled={!canGenerate || isTestingVideo}
              className="gap-2"
            >
              {isTestingVideo ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              AI Video
            </Button>
          </div> */}
        </div>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="h-14 w-full rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent text-lg font-semibold text-primary-foreground transition-all hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 hover:shadow-[0_0_30px_hsl(174_72%_56%/0.4)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Screenplay...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Screenplay
              <ChevronRight className="ml-auto h-5 w-5" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
