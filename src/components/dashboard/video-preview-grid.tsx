import * as React from "react";
import { Play, ExternalLink } from "lucide-react";
import { usePexelsVideos, type PexelsVideo } from "@/hooks/usePexelsVideos";
import { cn } from "@/lib/utils";

interface VideoPreviewGridProps {
  searchQuery: string;
  orientation?: "landscape" | "portrait" | "square";
  onSelectVideo?: (video: PexelsVideo) => void;
}

export function VideoPreviewGrid({
  searchQuery,
  orientation = "landscape",
  onSelectVideo,
}: VideoPreviewGridProps) {
  const { data, isLoading, error } = usePexelsVideos(searchQuery, {
    perPage: 6,
    orientation,
    enabled: !!searchQuery,
  });

  if (!searchQuery) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Enter a search query to find background videos
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-video rounded-xl bg-secondary/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-sm text-destructive">Failed to load videos</p>
      </div>
    );
  }

  if (!data?.videos?.length) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">No videos found for "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.totalResults} videos found
        </p>
        <a
          href={`https://www.pexels.com/search/videos/${encodeURIComponent(searchQuery)}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View on Pexels
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => onSelectVideo?.(video)}
          />
        ))}
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: PexelsVideo;
  onClick?: () => void;
}

function VideoCard({ video, onClick }: VideoCardProps) {
  const [isHovering, setIsHovering] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Get the best quality video file that's not too large
  const videoFile = React.useMemo(() => {
    const sorted = [...video.videoFiles].sort((a, b) => b.width - a.width);
    return sorted.find((f) => f.width <= 1280) || sorted[0];
  }, [video.videoFiles]);

  React.useEffect(() => {
    if (videoRef.current) {
      if (isHovering) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovering]);

  return (
    <div
      className={cn(
        "relative aspect-video rounded-xl overflow-hidden cursor-pointer group",
        "ring-2 ring-transparent hover:ring-primary/50 transition-all"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img
        src={video.image}
        alt={`Video by ${video.user}`}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity",
          isHovering ? "opacity-0" : "opacity-100"
        )}
      />
      <video
        ref={videoRef}
        src={videoFile?.link}
        muted
        loop
        playsInline
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-white/80 truncate">By {video.user}</p>
        <p className="text-[10px] text-white/60">{video.duration}s</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
        </div>
      </div>
    </div>
  );
}
