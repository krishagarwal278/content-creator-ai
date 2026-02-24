import * as React from "react";
import { Wand2, Loader2, ChevronRight, Video, FileText, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  ModelSelector,
  VideoModelSelector,
  ContentTypeSelector,
  FileUploadZone,
  Button,
  Slider,
  Label,
  Switch,
  Textarea,
  type UploadedFile,
} from "@/components/ui";
import type { Project } from "@/common/hooks/useProjects";
import type { PexelsVideo } from "@/common/hooks/usePexelsVideos";
import { storageService, generateVideo, supabase, type VideoFormat, type Screenplay } from "@/api";
import { parseDocuments, type ParsedDocument } from "@/common/utils/document-parser";
import { generateTextToVideo } from "@/api/fal-video-service";

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
  const [selectedModel, setSelectedModel] = React.useState("gpt-4o");
  const [selectedVideoModel, setSelectedVideoModel] = React.useState("fal-ai/ovi");
  const [contentType, setContentType] = React.useState<
    "reel" | "short" | "vfx_movie" | "presentation"
  >("reel");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isTestingVideo, setIsTestingVideo] = React.useState(false);
  const [duration, setDuration] = React.useState([30]);
  const [voiceover, setVoiceover] = React.useState(true);
  const [captions, setCaptions] = React.useState(true);
  const [topic, setTopic] = React.useState("");
  const [extractedContent, setExtractedContent] = React.useState<{
    text: string;
    documents: ParsedDocument[];
  } | null>(null);
  const [testVideoUrl, setTestVideoUrl] = React.useState<string | null>(null);

  const formatMap: Record<string, VideoFormat> = {
    reel: "reel",
    short: "short_video",
    vfx_movie: "vfx_movie",
    presentation: "presentation",
  };

  React.useEffect(() => {
    onAiModelChange?.(selectedModel);
  }, [selectedModel, onAiModelChange]);

  React.useEffect(() => {
    onFormatChange?.(formatMap[contentType] || "reel");
  }, [contentType, onFormatChange]);

  // Load existing project data
  React.useEffect(() => {
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

  // Quick test video generation using fal.ai (via backend)
  const handleTestVideo = async () => {
    if (!extractedContent?.text && !topic.trim()) {
      toast.error("Please add a topic or upload a document first");
      return;
    }

    setIsTestingVideo(true);
    setTestVideoUrl(null);

    try {
      // Get current user for the request
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Create a prompt from the extracted content or topic
      const contentSummary = extractedContent?.text
        ? extractedContent.text.substring(0, 500)
        : topic;

      const videoPrompt = `Educational course video about: ${contentSummary}. 
Professional presentation style with clear visuals, smooth transitions, and engaging graphics. 
Academic and informative tone suitable for online learning platforms.`;

      toast.info("Generating test video via backend (this may take 1-2 minutes)...");

      const result = await generateTextToVideo({
        prompt: videoPrompt,
        duration: 5,
        aspectRatio: "16:9",
        model: "minimax",
        userId: user?.id,
      });

      if (result.success && result.videoUrl) {
        setTestVideoUrl(result.videoUrl);
        toast.success("Test video generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate test video");
      }
    } catch (error) {
      console.error("Test video error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate test video");
    } finally {
      setIsTestingVideo(false);
    }
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

            {/* Quick Test Video Button */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestVideo}
                disabled={isTestingVideo}
                className="gap-2"
              >
                {isTestingVideo ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating Test Video...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate Quick Test Video
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Uses fal.ai MiniMax (~$0.10, 5s video)
              </span>
            </div>
          </div>
        )}

        {/* Test Video Preview */}
        {testVideoUrl && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Test Video Generated!</span>
            </div>
            <video
              src={testVideoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: "300px" }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This is a quick 5-second preview. Full course videos will be longer and more detailed.
            </p>
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
          <h2 className="font-semibold">AI Models</h2>
        </div>

        <div className="space-y-4">
          {/* Screenplay AI Model */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Screenplay AI</span>
              <span className="text-xs text-muted-foreground">Script & narration generation</span>
            </div>
            <ModelSelector value={selectedModel} onValueChange={setSelectedModel} />
          </div>

          {/* Video Generation Model */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Video Generation</span>
              <span className="text-xs text-muted-foreground">Text-to-video rendering</span>
            </div>
            <VideoModelSelector value={selectedVideoModel} onValueChange={setSelectedVideoModel} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Supports speech tags, ambient audio, and vertical/horizontal/square formats
            </p>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="glass space-y-4 rounded-xl p-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Generation Settings
        </h3>

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
      </section>

      {/* Generate Button */}
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
    </div>
  );
}
