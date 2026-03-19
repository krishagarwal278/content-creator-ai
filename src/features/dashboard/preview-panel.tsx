import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import {
  Play,
  Download,
  Share2,
  Maximize2,
  Volume2,
  Search,
  FileText,
  Video,
  Loader2,
  Pause,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { VideoPreviewGrid } from "./video-preview-grid";
import { ProjectHistory } from "./project-history";
import { ScreenplayPreview } from "./screenplay-preview";
import type { PexelsVideo } from "@/common/hooks/usePexelsVideos";
import { videoGenerationService, type Screenplay } from "@/api/video-generation-service";

interface PreviewPanelProps {
  onSelectVideo?: (video: PexelsVideo) => void;
  screenplay?: Screenplay | null;
  projectId?: string | null;
  onClearScreenplay?: () => void;
  userId?: string;
  initialVideoUrl?: string | null;
  initialVideoId?: string | null;
}

export function PreviewPanel({
  onSelectVideo,
  screenplay,
  projectId,
  onClearScreenplay,
  userId,
  initialVideoUrl,
  initialVideoId,
}: PreviewPanelProps) {
  const [videoQuery, setVideoQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMainTab, setActiveMainTab] = useState<string>("video");

  // Video generation state
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  // Auto-switch to screenplay tab when a new screenplay is generated
  useEffect(() => {
    if (screenplay) {
      setActiveMainTab("screenplay");
    }
  }, [screenplay]);

  // Handle initial video URL from generation
  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
      setActiveMainTab("video");
    }
  }, [initialVideoUrl]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(videoQuery);
  };

  const pollVideoStatus = useCallback(
    async (videoId: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const status = await videoGenerationService.getVideoStatus(videoId);
          setVideoProgress(status.progress);

          if (status.status === "completed" && status.videoUrl) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
            }
            setVideoUrl(status.videoUrl);
            setIsGeneratingVideo(false);
            setActiveMainTab("video");
            toast({
              title: "Video ready!",
              description: "Your video has been generated successfully.",
            });
          } else if (status.status === "failed") {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
            }
            setVideoError(status.error || "Video generation failed");
            setIsGeneratingVideo(false);
            toast({
              title: "Generation failed",
              description: status.error || "Video generation failed",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error polling video status:", error);
        }
      }, 3000); // Poll every 3 seconds
    },
    [toast],
  );

  // Handle initial video ID - start polling
  useEffect(() => {
    if (initialVideoId) {
      setIsGeneratingVideo(true);
      pollVideoStatus(initialVideoId);
    }
  }, [initialVideoId, pollVideoStatus]);

  const handleGenerateVideo = async () => {
    if (!screenplay || !projectId) {
      toast({
        title: "Missing data",
        description: "Screenplay and project ID are required",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoProgress(0);
    setVideoUrl(null); // Clear existing video to show progress

    try {
      const result = await videoGenerationService.generateActualVideo({
        projectId,
        screenplay,
        userId: userId || "anonymous",
      });

      if (result.success && result.videoUrl) {
        // Video is ready immediately
        setVideoUrl(result.videoUrl);
        setIsGeneratingVideo(false);
        setActiveMainTab("video");
        toast({
          title: "Video ready!",
          description: "Your video has been generated successfully.",
        });
      } else if (result.videoId) {
        // Poll for completion
        toast({ title: "Processing video", description: "Your video is being generated..." });
        pollVideoStatus(result.videoId);
      } else {
        throw new Error(result.message || "Unknown error");
      }
    } catch (error) {
      setIsGeneratingVideo(false);
      const message = error instanceof Error ? error.message : "Failed to generate video";
      setVideoError(message);
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Main Tabs - Video Preview vs Screenplay */}
      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="mb-4 flex items-center justify-between">
          <TabsList className="glass rounded-xl">
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="screenplay" className="gap-2" disabled={!screenplay}>
              <FileText className="h-4 w-4" />
              Screenplay
              {screenplay && (
                <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-primary" />
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {screenplay && projectId && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                title="Regenerate video"
              >
                <RefreshCw className={`h-4 w-4 ${isGeneratingVideo ? "animate-spin" : ""}`} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Screenplay Tab Content */}
        <TabsContent value="screenplay" className="mt-0 flex-1 overflow-hidden">
          {screenplay ? (
            <div className="h-full overflow-y-auto">
              <ScreenplayPreview screenplay={screenplay} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>No screenplay generated yet</p>
            </div>
          )}
        </TabsContent>

        {/* Video Tab Content */}
        <TabsContent value="video" className="mt-0 flex flex-1 flex-col overflow-hidden">
          {/* Video Preview */}
          <div className="glass group relative h-[280px] flex-shrink-0 overflow-hidden rounded-2xl">
            {videoUrl ? (
              // Actual Video Player
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlayPause}
                />
                {/* Regenerate Button (top right) */}
                {screenplay && projectId && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-3 top-3 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    title="Regenerate video"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Play className="h-5 w-5 text-primary-foreground" />
                      )}
                    </Button>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 rounded-full bg-primary" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">0:00 / 0:30</span>
                  </div>
                </div>
              </>
            ) : isGeneratingVideo ? (
              // Video Generation Progress
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card via-card/80 to-secondary/50">
                <div className="relative z-10 w-full max-w-sm p-8 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Generating Video</h3>
                  <p className="mb-4 text-sm text-muted-foreground">This may take a minute...</p>
                  <Progress value={videoProgress} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{videoProgress}% complete</p>
                </div>
              </div>
            ) : (
              // Placeholder Content
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card via-card/80 to-secondary/50">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="animate-pulse-slow absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
                  <div
                    className="animate-pulse-slow absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/30 blur-3xl"
                    style={{ animationDelay: "1s" }}
                  />
                </div>

                <div className="relative z-10 p-8 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/80 transition-transform group-hover:scale-110">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {videoError ? "Generation Failed" : "No video yet"}
                  </h3>
                  <p className="mx-auto mb-4 max-w-xs text-sm text-muted-foreground">
                    {videoError
                      ? videoError
                      : screenplay
                        ? "Screenplay ready! Click below to generate your video."
                        : "Upload your content and click generate to create your video"}
                  </p>
                  {screenplay && projectId && (
                    <Button
                      disabled
                      className="cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video
                      <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        Coming Soon
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-shrink-0 gap-3">
            <Button
              variant="outline"
              className="glass h-11 flex-1 rounded-xl border-border/50 hover:border-primary/50"
              disabled={!videoUrl}
              onClick={() => videoUrl && window.open(videoUrl, "_blank")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="glass h-11 flex-1 rounded-xl border-border/50 hover:border-primary/50"
              disabled={!videoUrl}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Tabs for Background Videos & History */}
          <div className="mt-4 min-h-0 flex-1 overflow-hidden">
            <Tabs defaultValue="videos" className="flex h-full flex-col">
              <TabsList className="glass mb-3 w-full flex-shrink-0 rounded-xl">
                <TabsTrigger value="videos" className="flex-1">
                  Background Videos
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  Recent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="flex-1 space-y-3 overflow-y-auto">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={videoQuery}
                      onChange={(e) => setVideoQuery(e.target.value)}
                      placeholder="Search Pexels videos..."
                      className="glass rounded-xl border-border/50 pl-9"
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="rounded-xl">
                    Search
                  </Button>
                </form>
                <VideoPreviewGrid searchQuery={searchQuery} onSelectVideo={onSelectVideo} />
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-y-auto">
                <ProjectHistory />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
