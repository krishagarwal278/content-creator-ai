import * as React from "react";
import { ModelSelector } from "@/components/ui/model-selector";
import { ContentTypeSelector } from "@/components/ui/content-type-selector";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, ChevronRight, Video, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateProject, useUpdateProject, type Project } from "@/hooks/useProjects";
import { toast } from "sonner";
import type { PexelsVideo } from "@/hooks/usePexelsVideos";
import { storageService } from "@/services/storage-service";
import type { UploadedFile } from "@/components/ui/file-upload-zone";

interface GenerationPanelProps {
  selectedVideo?: PexelsVideo | null;
  existingProject?: Project | null;
}

export function GenerationPanel({ selectedVideo, existingProject }: GenerationPanelProps) {
  const [selectedModel, setSelectedModel] = React.useState("gpt-4o");
  const [contentType, setContentType] = React.useState<"reel" | "short" | "vfx_movie" | "presentation">("reel");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [duration, setDuration] = React.useState([30]);
  const [voiceover, setVoiceover] = React.useState(true);
  const [captions, setCaptions] = React.useState(true);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

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
          const mappedFiles: UploadedFile[] = projectFiles.map(f => ({
            id: f.id,
            name: f.file_name,
            size: f.file_size,
            type: f.file_type,
            file_url: f.file_url
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

    // 2. If we have an existing project, auto-upload the new files
    if (existingProject) {
      const filesToUpload = newFiles.filter(f => f.file && !f.file_url); // Check for file object and no URL yet

      if (filesToUpload.length > 0) {
        setIsUploading(true);
        try {
          let uploadedCount = 0;
          await Promise.all(filesToUpload.map(async (f) => {
            if (f.file) {
              try {
                await storageService.uploadFile(existingProject.id, f.file);
                uploadedCount++;
              } catch (err) {
                console.error("Failed to upload file", f.name, err);
                toast.error(`Failed to upload ${f.name}`);
              }
            }
          }));

          if (uploadedCount > 0) {
            toast.success(`Uploaded ${uploadedCount} file(s)`);
            // Refresh from server to get clean state (real IDs, URLs)
            const projectFiles = await storageService.getProjectFiles(existingProject.id);
            setFiles(projectFiles.map(pf => ({
              id: pf.id,
              name: pf.file_name,
              size: pf.file_size,
              type: pf.file_type,
              file_url: pf.file_url
            })));
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
    // If we have files to upload, we need a project ID.
    // If no existing project, we must create one first.

    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setIsGenerating(true);

    try {
      let projectId = existingProject?.id;

      if (existingProject) {
        await updateProject.mutateAsync({
          id: existingProject.id,
          updates: {
            content_type: contentType,
            target_duration: duration[0],
            model: selectedModel,
            voiceover_enabled: voiceover,
            captions_enabled: captions,
          }
        });
        toast.success("Project updated!");
      } else {
        // Create the project in the database
        const newProject = await createProject.mutateAsync({
          name: files[0]?.name?.split(".")[0] || "Untitled Project",
          content_type: contentType,
          target_duration: duration[0],
          model: selectedModel,
          voiceover_enabled: voiceover,
          captions_enabled: captions,
        });
        projectId = newProject.id;
        toast.success("Project created!");
      }

      // Handle File Uploads (for new projects mainly)
      if (projectId) {
        const params = { projectId }; // capture for closure if needed, mostly for clarity

        // Filter for new files (ones that have the raw File object)
        const filesToUpload = files.filter(f => f.file);

        if (filesToUpload.length > 0) {
          toast.info(`Uploading ${filesToUpload.length} file(s)...`);

          await Promise.all(filesToUpload.map(async (f) => {
            if (f.file) {
              await storageService.uploadFile(params.projectId, f.file);
            }
          }));

          toast.success("Files uploaded successfully");

          // Refresh file list from server to get clean state (ids, urls, etc)
          const updatedFiles = await storageService.getProjectFiles(projectId);
          setFiles(updatedFiles.map(f => ({
            id: f.id,
            name: f.file_name,
            size: f.file_size,
            type: f.file_type,
            file_url: f.file_url
          })));
        }
      }

      // Simulate generation process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Generation started...");

    } catch (error) {
      console.error(error);
      toast.error(existingProject ? "Failed to update project" : "Failed to create project");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = files.length > 0;

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="font-semibold">Upload Content</h2>
          {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
        </div>
        <FileUploadZone files={files} onFilesChange={handleFilesChange} />
      </section>

      {/* Selected Background Video */}
      {selectedVideo && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Selected Background</span>
          </div>
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0">
              <img
                src={selectedVideo.image}
                alt="Selected video"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                By {selectedVideo.user}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedVideo.duration}s • {selectedVideo.width}x{selectedVideo.height}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Content Type */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h2 className="font-semibold">Choose Format</h2>
        </div>
        <ContentTypeSelector value={contentType} onValueChange={(v) => setContentType(v as typeof contentType)} />
      </section>

      {/* Model Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h2 className="font-semibold">AI Model</h2>
        </div>
        <ModelSelector value={selectedModel} onValueChange={setSelectedModel} />
      </section>

      {/* Settings */}
      <section className="glass rounded-xl p-4 space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Generation Settings
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="duration" className="text-sm">
              Target Duration
            </Label>
            <span className="text-sm font-mono text-primary">{duration[0]}s</span>
          </div>
          <Slider
            id="duration"
            value={duration}
            onValueChange={setDuration}
            min={15}
            max={180}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="voiceover" className="text-sm cursor-pointer">
              AI Voiceover
            </Label>
            <p className="text-xs text-muted-foreground">
              Generate natural narration
            </p>
          </div>
          <Switch
            id="voiceover"
            checked={voiceover}
            onCheckedChange={setVoiceover}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="captions" className="text-sm cursor-pointer">
              Auto Captions
            </Label>
            <p className="text-xs text-muted-foreground">
              Add synchronized subtitles
            </p>
          </div>
          <Switch
            id="captions"
            checked={captions}
            onCheckedChange={setCaptions}
          />
        </div>
      </section>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 text-primary-foreground transition-all hover:shadow-[0_0_30px_hsl(174_72%_56%/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            Generate Video
            <ChevronRight className="h-5 w-5 ml-auto" />
          </>
        )}
      </Button>
    </div>
  );
}
