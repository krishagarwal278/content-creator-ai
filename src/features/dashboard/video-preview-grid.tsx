import { useState, useRef, useMemo, useEffect } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Grid, Card, Box, Typography, Skeleton, Link } from "@mui/material";

import { usePexelsVideos, type PexelsVideo } from "@/common/hooks/usePexelsVideos";
import "@/styles/components.css";

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
      <Card variant="outlined" className="empty-state-card" sx={{ bgcolor: "background.default" }}>
        <Typography variant="body2" color="text.secondary">
          Enter a search query to find background videos
        </Typography>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 6 }} key={i}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" className="empty-state-card" sx={{ bgcolor: "background.default" }}>
        <Typography variant="body2" color="error">
          Failed to load videos
        </Typography>
      </Card>
    );
  }

  if (!data?.videos?.length) {
    return (
      <Card variant="outlined" className="empty-state-card" sx={{ bgcolor: "background.default" }}>
        <Typography variant="body2" color="text.secondary">
          No videos found for "{searchQuery}"
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="caption" color="text.secondary">
          {data.totalResults} videos found
        </Typography>
        <Link
          href={`https://www.pexels.com/search/videos/${encodeURIComponent(searchQuery)}/`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem" }}
        >
          View on Pexels
          <ExternalLink size={12} />
        </Link>
      </Box>
      <Grid container spacing={2}>
        {data.videos.map((video) => (
          <Grid size={{ xs: 6 }} key={video.id}>
            <VideoCard video={video} onClick={() => onSelectVideo?.(video)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

interface VideoCardProps {
  video: PexelsVideo;
  onClick?: () => void;
}

function VideoCard({ video, onClick }: VideoCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get the best quality video file that's not too large
  const videoFile = useMemo(() => {
    const sorted = [...video.videoFiles].sort((a, b) => b.width - a.width);
    return sorted.find((f) => f.width <= 1280) || sorted[0];
  }, [video.videoFiles]);

  useEffect(() => {
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
    <Card
      className="video-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Thumbnail Image */}
      <Box
        component="img"
        src={video.image}
        alt={`Video by ${video.user}`}
        className="video-card-media"
        sx={{ opacity: isHovering ? 0 : 1 }}
      />

      {/* Video Element */}
      <Box
        component="video"
        ref={videoRef}
        src={videoFile?.link}
        muted
        loop
        playsInline
        className="video-card-media"
        sx={{ opacity: isHovering ? 1 : 0 }}
      />

      {/* Overlay Gradient (Hover) */}
      <Box className="video-overlay-gradient" sx={{ opacity: isHovering ? 1 : 0 }} />

      {/* Info (Hover) */}
      <Box className="video-info" sx={{ opacity: isHovering ? 1 : 0 }}>
        <Typography variant="caption" color="white" noWrap display="block" sx={{ opacity: 0.9 }}>
          By {video.user}
        </Typography>
        <Typography variant="caption" color="white" sx={{ opacity: 0.7 }}>
          {video.duration}s
        </Typography>
      </Box>

      {/* Play Icon (Hover) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isHovering ? 1 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      >
        <Box className="play-icon-container">
          <Play size={20} color="white" fill="white" />
        </Box>
      </Box>
    </Card>
  );
}
