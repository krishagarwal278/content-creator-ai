import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Film,
  PlayCircle,
  Calendar,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Hourglass,
  Sparkles,
  Video,
  Coins,
  TrendingUp,
  Play,
  Presentation,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/common/contexts/AuthContext";
import { SlideshowPreview } from "@/common/components/ui/slideshow-preview";
import { exportSlideshow } from "@/api/slideshow-service";
import type { SlideData } from "@/api/slideshow-service";
import { toast } from "sonner";
import {
  videoGenerationService,
  type GenerationHistoryEntry,
  type GenerationStats,
  type VideoFormat,
  type GenerationType,
  type GenerationStatus,
  type StoredSlideshow,
} from "@/api/video-generation-service";

const formatLabels: Record<VideoFormat, string> = {
  reel: "Reel",
  short_video: "Short Video",
  vfx_movie: "VFX Movie",
  presentation: "Presentation",
};

const formatColors: Record<VideoFormat, string> = {
  reel: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  short_video: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  vfx_movie: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  presentation: "bg-green-500/20 text-green-400 border-green-500/30",
};

const typeLabels: Record<GenerationType, string> = {
  screenplay: "Screenplay",
  video: "Video",
  enhancement: "Enhancement",
};

const typeIcons: Record<GenerationType, React.ReactNode> = {
  screenplay: <Sparkles className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  enhancement: <TrendingUp className="h-3 w-3" />,
};

const statusConfig: Record<
  GenerationStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: "Pending",
    icon: <Hourglass className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  processing: {
    label: "Processing",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

function ActualDurationSeconds({
  videoUrl,
  fallbackDuration,
  status,
}: {
  videoUrl: string | null;
  fallbackDuration: number;
  status: GenerationStatus;
}) {
  const shouldMeasure = status === "completed" && !!videoUrl;
  const [resolvedDuration, setResolvedDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!shouldMeasure || !videoUrl) {
      setResolvedDuration(null);
      return;
    }

    let cancelled = false;
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.crossOrigin = "anonymous";
    videoEl.src = videoUrl;

    const loaded = () => {
      if (cancelled) {
        return;
      }
      const d = videoEl.duration;
      if (Number.isFinite(d) && d > 0) {
        setResolvedDuration(Math.round(d));
      } else {
        // If metadata is missing/invalid, fall back to the backend duration.
        setResolvedDuration(fallbackDuration);
      }
    };

    const errored = () => {
      if (cancelled) {
        return;
      }
      setResolvedDuration(fallbackDuration);
    };

    videoEl.addEventListener("loadedmetadata", loaded);
    videoEl.addEventListener("error", errored);

    return () => {
      cancelled = true;
      videoEl.removeEventListener("loadedmetadata", loaded);
      videoEl.removeEventListener("error", errored);
    };
  }, [shouldMeasure, videoUrl, fallbackDuration]);

  // For non-video or not-yet-completed entries, trust the backend field.
  if (!shouldMeasure) {
    return <>{fallbackDuration}s</>;
  }

  // While we are measuring, avoid showing incorrect values.
  if (resolvedDuration == null) {
    return null;
  }

  return <>{resolvedDuration}s</>;
}

function HistoryCard({ item, onClick }: { item: GenerationHistoryEntry; onClick: () => void }) {
  const date = new Date(item.created_at);
  const status = statusConfig[item.status];

  return (
    <div
      onClick={onClick}
      className="glass group cursor-pointer rounded-xl border border-border/50 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail or Placeholder */}
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.project_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {item.generation_type === "video" ? (
                <Video className="h-8 w-8 text-primary/40" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary/40" />
              )}
            </div>
          )}
          {item.video_url && item.status === "completed" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={formatColors[item.format]}>
              {formatLabels[item.format]}
            </Badge>
            <Badge variant="outline" className={status.className}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
            <Badge variant="outline" className="border-border/50 text-muted-foreground">
              {typeIcons[item.generation_type]}
              <span className="ml-1">{typeLabels[item.generation_type]}</span>
            </Badge>
          </div>

          <h3 className="mb-1 truncate font-semibold group-hover:text-primary">
            {item.project_name}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <ActualDurationSeconds
                videoUrl={item.video_url}
                fallbackDuration={item.duration}
                status={item.status}
              />
            </span>
            <span className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {item.credits_used} credits
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(date, "MMM d, yyyy")}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>

          {item.error_message && <p className="mt-2 text-xs text-red-400">{item.error_message}</p>}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ item, onClick }: { item: GenerationHistoryEntry; onClick: () => void }) {
  const status = statusConfig[item.status];

  return (
    <div
      onClick={onClick}
      className="glass group cursor-pointer overflow-hidden rounded-xl border border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.project_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Video className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {item.video_url && item.status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayCircle className="h-12 w-12 text-white" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="outline" className={`${status.className} backdrop-blur-sm`}>
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
            <ActualDurationSeconds
              videoUrl={item.video_url}
              fallbackDuration={item.duration}
              status={item.status}
            />
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate font-medium group-hover:text-primary">{item.project_name}</h3>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant="outline" className={`${formatColors[item.format]} text-[10px]`}>
            {formatLabels[item.format]}
          </Badge>
          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}

function StatsCards({ stats }: { stats: GenerationStats | null }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/20 p-2">
            <Film className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalVideos}</p>
            <p className="text-xs text-muted-foreground">Total Videos</p>
          </div>
        </div>
      </div>
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-accent/20 p-2">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalScreenplays}</p>
            <p className="text-xs text-muted-foreground">Screenplays</p>
          </div>
        </div>
      </div>
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-500/20 p-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completedVideos}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-500/20 p-2">
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.failedVideos}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>
      </div>
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-yellow-500/20 p-2">
            <Coins className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalCreditsUsed}</p>
            <p className="text-xs text-muted-foreground">Credits Used</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Clock className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No generation history yet</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Your generated screenplays and videos will appear here. Start by creating your first
        AI-powered video.
      </p>
      <Button onClick={() => navigate("/dashboard")} className="gap-2">
        <PlayCircle className="h-4 w-4" />
        Create Your First Video
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading your history...</p>
    </div>
  );
}

function normalizeSlideshowSlides(slidesRaw: unknown): SlideData[] {
  if (!Array.isArray(slidesRaw)) {
    return [];
  }

  return slidesRaw.map((slide: unknown, idx: number) => {
    const s = slide as any;

    const rawSlideNumber = s?.slideNumber ?? s?.slide_number ?? s?.slideNum;
    const slideNumber =
      typeof rawSlideNumber === "number" ? rawSlideNumber : Number(rawSlideNumber ?? idx + 1);

    const rawTitle = s?.title ?? s?.slideTitle ?? s?.heading;
    const title =
      typeof rawTitle === "string" && rawTitle.trim().length > 0 ? rawTitle : `Slide ${idx + 1}`;

    const rawBullets = s?.bulletPoints ?? s?.bullet_points ?? s?.bullets ?? [];
    const bulletPoints = Array.isArray(rawBullets)
      ? rawBullets.map((b: any) => String(b)).filter((b: string) => b.trim().length > 0)
      : [];

    const rawNarration = s?.narration ?? s?.narration_text;
    const narration = typeof rawNarration === "string" ? rawNarration : "";

    const rawImageUrl =
      s?.imageUrl ??
      s?.image_url ??
      s?.image ??
      s?.imageUrl?.url ??
      s?.image_url?.url ??
      s?.image?.url ??
      s?.imageLink ??
      s?.image_link;
    const imageUrl =
      typeof rawImageUrl === "string" && rawImageUrl.trim().length > 0 ? rawImageUrl.trim() : "";

    return {
      slideNumber: Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : idx + 1,
      title,
      bulletPoints,
      narration,
      imageUrl: imageUrl || undefined,

      // Provide alternate key names for backend exporters that may expect snake_case.
      // (Also harmless for the frontend preview.)
      image_url: imageUrl || undefined,
      bullet_points: bulletPoints,
      narration_text: narration || undefined,
      slide_number: Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : idx + 1,

      // Preserve any extra fields present in DB payloads.
      ...s,
    };
  });
}

function SlideCard({ item, onClick }: { item: StoredSlideshow; onClick: () => void }) {
  const date = new Date(item.createdAt ?? item.created_at ?? Date.now());
  const slidesCount =
    item.slideCount ?? item.slide_count ?? (Array.isArray(item.slides) ? item.slides.length : 0);

  return (
    <div
      onClick={onClick}
      className="glass group cursor-pointer rounded-xl border border-border/50 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          <Presentation className="h-8 w-8 text-primary/40" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate font-semibold group-hover:text-primary">
            {item.title || "Untitled slideshow"}
          </h3>
          <p className="text-xs text-muted-foreground">{slidesCount} slides</p>
          <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(date, "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive/60" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Failed to load history</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">{error}</p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);
  const [videos, setVideos] = useState<GenerationHistoryEntry[]>([]);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [slideshows, setSlideshows] = useState<StoredSlideshow[]>([]);
  const [slideshowsLoading, setSlideshowsLoading] = useState(false);
  const [selectedSlideshow, setSelectedSlideshow] = useState<StoredSlideshow | null>(null);
  const [isExportingSlides, setIsExportingSlides] = useState<"pptx" | "pdf" | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [historyData, videoData, statsData] = await Promise.all([
        videoGenerationService.getGenerationHistory(user.id, {
          page,
          pageSize: 20,
          status: statusFilter !== "all" ? (statusFilter as GenerationStatus) : undefined,
        }),
        videoGenerationService.getVideoHistory(user.id, 1, 12),
        videoGenerationService.getGenerationStats(user.id),
      ]);

      setHistory(historyData.entries);
      setTotalPages(historyData.totalPages);
      setVideos(videoData.videos);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, page, statusFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchSlideshows = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    setSlideshowsLoading(true);
    try {
      const list = await videoGenerationService.getAllSlideshows(user.id);
      setSlideshows(list);
    } catch {
      setSlideshows([]);
    } finally {
      setSlideshowsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "slides" && user?.id) {
      fetchSlideshows();
    }
  }, [activeTab, user?.id, fetchSlideshows]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery) {
      return history;
    }
    return history.filter((item) =>
      item.project_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [history, searchQuery]);

  const filteredVideos = useMemo(() => {
    const completed = videos.filter((item) => item.status === "completed" && !!item.video_url);

    if (!searchQuery) {
      return completed;
    }

    return completed.filter((item) =>
      item.project_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [videos, searchQuery]);

  const filteredSlideshows = useMemo(() => {
    const withSlides = slideshows.filter((item) => {
      const normalized = normalizeSlideshowSlides(item.slides);
      return normalized.length > 0;
    });

    if (!searchQuery) {
      return withSlides;
    }

    return withSlides.filter((item) =>
      (item.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [slideshows, searchQuery]);

  const selectedSlides = useMemo(
    () => normalizeSlideshowSlides(selectedSlideshow?.slides),
    [selectedSlideshow],
  );

  const selectedTotalDuration =
    selectedSlideshow?.totalDuration ?? selectedSlideshow?.total_duration ?? undefined;

  const handleDownloadSlides = async (format: "pptx" | "pdf") => {
    if (!selectedSlides.length) {
      return;
    }

    setIsExportingSlides(format);
    try {
      const result = await exportSlideshow({
        slides: selectedSlides,
        title: selectedSlideshow?.title || "Slideshow",
        format,
      });

      if (result.success) {
        toast.success(`Downloaded as ${format.toUpperCase()}`);
      } else {
        toast.error(result.error || "Download failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setIsExportingSlides(null);
    }
  };

  const handleItemClick = (item: GenerationHistoryEntry) => {
    navigate(`/history/view/${item.id}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-6">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-pulse-slow absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="animate-pulse-slow absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="mb-2 text-3xl font-bold">
            Generation <span className="gradient-text">History</span>
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            View and manage all your generated screenplays and videos.
          </p>
        </header>

        {/* Stats */}
        {!isLoading && !error && (
          <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <StatsCards stats={stats} />
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="glass-strong">
              <TabsTrigger value="all" className="gap-2">
                <Clock className="h-4 w-4" />
                All History
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="slides" className="gap-2">
                <Presentation className="h-4 w-4" />
                Slides
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-strong h-9 rounded-lg border-border/50 pl-10"
                />
              </div>

              {activeTab === "all" && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="glass-strong h-9 w-[130px] rounded-lg border-border/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong rounded-lg border-border/50">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={fetchHistory}
                disabled={isLoading}
                className="glass-strong h-9 w-9 rounded-lg border-border/50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* All History Tab */}
          <TabsContent value="all">
            <div
              className="glass-strong rounded-2xl border border-border/50 p-6"
              style={{ animationDelay: "0.2s" }}
            >
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState error={error} onRetry={fetchHistory} />
              ) : filteredHistory.length === 0 ? (
                history.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="mb-4 h-8 w-8 text-muted-foreground/60" />
                    <h3 className="mb-2 text-lg font-semibold">No results found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <HistoryCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Slides Tab */}
          <TabsContent value="slides">
            <div
              className="glass-strong rounded-2xl border border-border/50 p-6"
              style={{ animationDelay: "0.2s" }}
            >
              {slideshowsLoading ? (
                <LoadingState />
              ) : filteredSlideshows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Presentation className="mb-4 h-8 w-8 text-muted-foreground/60" />
                  <h3 className="mb-2 text-lg font-semibold">No saved slides yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your saved presentations will appear here.
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="mt-4">
                    Create content
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSlideshows.map((item) => (
                    <SlideCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedSlideshow(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div
              className="glass-strong rounded-2xl border border-border/50 p-6"
              style={{ animationDelay: "0.2s" }}
            >
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState error={error} onRetry={fetchHistory} />
              ) : filteredVideos.length === 0 ? (
                videos.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="mb-4 h-8 w-8 text-muted-foreground/60" />
                    <h3 className="mb-2 text-lg font-semibold">No videos found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVideos.map((item) => (
                    <VideoCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Slideshow detail modal */}
        <Dialog open={!!selectedSlideshow} onOpenChange={() => setSelectedSlideshow(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedSlideshow?.title || "Slideshow"}</DialogTitle>
            </DialogHeader>
            {selectedSlides.length > 0 ? (
              <div className="space-y-4 text-sm">
                <SlideshowPreview
                  slides={selectedSlides}
                  totalDuration={selectedTotalDuration}
                  autoPlay={false}
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => handleDownloadSlides("pptx")}
                    disabled={isExportingSlides === "pptx" || isExportingSlides === "pdf"}
                  >
                    {isExportingSlides === "pptx" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Film className="h-3.5 w-3.5" />
                    )}
                    Download PPTX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => handleDownloadSlides("pdf")}
                    disabled={isExportingSlides === "pdf" || isExportingSlides === "pptx"}
                  >
                    {isExportingSlides === "pdf" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Film className="h-3.5 w-3.5" />
                    )}
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                No slides found for this saved slideshow.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default History;
