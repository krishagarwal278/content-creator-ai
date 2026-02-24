import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Maximize2,
  Minimize2,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlideData } from "@/api/slideshow-service";

interface SlideshowPreviewProps {
  slides: SlideData[];
  totalDuration?: number;
  autoPlay?: boolean;
  className?: string;
  onDownload?: () => void;
}

export function SlideshowPreview({
  slides,
  totalDuration,
  autoPlay = false,
  className,
  onDownload,
}: SlideshowPreviewProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const slide = slides[currentSlide];

  // Auto-advance slides when playing
  React.useEffect(() => {
    if (!isPlaying || slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  // Handle keyboard navigation in fullscreen
  React.useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides.length) {
    return null;
  }

  const SlideContent = ({ isLarge = false }: { isLarge?: boolean }) => (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-black",
        isLarge ? "aspect-video" : "aspect-video",
      )}
    >
      {/* Background Image */}
      {slide.imageUrl ? (
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
      )}

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Slide Content */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end",
          isLarge ? "p-8 md:p-12" : "p-4 md:p-6",
        )}
      >
        <div className="space-y-3">
          {/* Slide Number Badge */}
          <span
            className={cn(
              "inline-block rounded-full bg-primary/80 font-medium text-primary-foreground",
              isLarge ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs",
            )}
          >
            Slide {slide.slideNumber} of {slides.length}
          </span>

          {/* Title */}
          <h3
            className={cn(
              "font-bold text-white drop-shadow-lg",
              isLarge ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
            )}
          >
            {slide.title}
          </h3>

          {/* Bullet Points */}
          {slide.bulletPoints.length > 0 && (
            <ul className={cn("space-y-2", isLarge ? "max-w-3xl" : "")}>
              {slide.bulletPoints.map((point, idx) => (
                <li
                  key={idx}
                  className={cn(
                    "flex items-start gap-2 text-white/90",
                    isLarge ? "text-base md:text-lg" : "text-sm",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 rounded-full bg-primary",
                      isLarge ? "mt-2 h-2 w-2" : "mt-1.5 h-1.5 w-1.5",
                    )}
                  />
                  <span className="drop-shadow">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white transition-colors hover:bg-black/70",
              isLarge ? "p-3" : "p-2",
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className={isLarge ? "h-6 w-6" : "h-5 w-5"} />
          </button>
          <button
            onClick={nextSlide}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white transition-colors hover:bg-black/70",
              isLarge ? "p-3" : "p-2",
            )}
            aria-label="Next slide"
          >
            <ChevronRight className={isLarge ? "h-6 w-6" : "h-5 w-5"} />
          </button>
        </>
      )}

      {/* Top Controls */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {/* Play/Pause Button */}
        {slides.length > 1 && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}

        {/* Fullscreen Toggle */}
        {!isFullscreen && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="Enter fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {/* Close fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="Exit fullscreen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  // Fullscreen Modal
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 md:p-8">
        {/* Close button */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-white/70">
            Press ESC to exit • Arrow keys to navigate • Space to play/pause
          </span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>

        {/* Main slide area */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-6xl">
            <SlideContent isLarge />
          </div>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50",
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Narration in fullscreen */}
        {slide.narration && (
          <div className="mx-auto mt-4 max-w-4xl rounded-lg bg-white/10 p-4">
            <p className="text-center text-sm leading-relaxed text-white/80">{slide.narration}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Slide Display */}
      <SlideContent />

      {/* Bottom Controls Row */}
      <div className="flex items-center justify-between">
        {/* Slide Dots Navigation */}
        {slides.length > 1 && (
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === currentSlide
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Duration & Download */}
        <div className="flex items-center gap-3">
          {totalDuration && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, "0")}
              </span>
            </div>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Narration Text - Collapsible */}
      {slide.narration && (
        <details className="group rounded-lg border border-border/50 bg-card/50">
          <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs font-medium text-muted-foreground hover:text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Narration Script
            <ChevronRight className="ml-auto h-3 w-3 transition-transform group-open:rotate-90" />
          </summary>
          <div className="border-t border-border/50 p-3">
            <p className="text-sm leading-relaxed text-foreground/80">{slide.narration}</p>
          </div>
        </details>
      )}
    </div>
  );
}

// Grid view for all slides
interface SlideshowGridProps {
  slides: SlideData[];
  onSlideClick?: (index: number) => void;
  className?: string;
}

export function SlideshowGrid({ slides, onSlideClick, className }: SlideshowGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4", className)}>
      {slides.map((slide, idx) => (
        <button
          key={slide.slideNumber}
          onClick={() => onSlideClick?.(idx)}
          className="group relative aspect-video overflow-hidden rounded-lg border border-border/50 bg-black text-left transition-all hover:border-primary/50 hover:ring-2 hover:ring-primary/20"
        >
          {/* Background */}
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-2">
            <span className="mb-0.5 text-[10px] font-medium text-primary">
              Slide {slide.slideNumber}
            </span>
            <h4 className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">
              {slide.title}
            </h4>
          </div>
        </button>
      ))}
    </div>
  );
}
