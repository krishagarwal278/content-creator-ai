import { useState } from "react";
import { Clock, Film, Mic, Music, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Screenplay, ScreenplayScene } from "@/api/video-generation-service";

interface ScreenplayPreviewProps {
  screenplay: Screenplay;
  onRegenerate?: () => void;
  onEnhance?: (feedback: string) => void;
  isLoading?: boolean;
}

function SceneCard({ scene }: { scene: ScreenplayScene }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="glass space-y-3 rounded-xl p-4">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {scene.sceneNumber}
          </span>
          <span className="font-medium">Scene {scene.sceneNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {scene.duration}s
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t border-border/50 pt-2">
          {/* Visual Description */}
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Visual</p>
            <p className="text-sm">{scene.visualDescription}</p>
          </div>

          {/* Narration */}
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Narration</p>
            <p className="text-sm italic text-primary/90">"{scene.narration}"</p>
          </div>

          {/* Text Overlay */}
          {scene.textOverlay && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                On-Screen Text
              </p>
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm">
                {scene.textOverlay}
              </span>
            </div>
          )}

          {/* Transition */}
          {scene.transition && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Transition:</span>
              <Badge variant="outline" className="text-xs">
                {scene.transition}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ScreenplayPreview({
  screenplay,
  onRegenerate,
  isLoading = false,
}: ScreenplayPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-4 border-b border-border/50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{screenplay.title}</h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{screenplay.totalDuration}s</span>
              </div>
              <div className="flex items-center gap-1">
                <Film className="h-4 w-4" />
                <span>{screenplay.scenes.length} scenes</span>
              </div>
            </div>
          </div>
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3">
          {screenplay.voiceoverStyle && (
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
              <Mic className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">{screenplay.voiceoverStyle}</span>
            </div>
          )}
          {screenplay.musicSuggestion && (
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
              <Music className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">{screenplay.musicSuggestion}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scenes List */}
      <div className="space-y-3">
        {screenplay.scenes.map((scene) => (
          <SceneCard key={scene.sceneNumber} scene={scene} />
        ))}
      </div>

      {/* Timeline Preview */}
      <div className="mt-4 border-t border-border/50 pt-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Timeline</p>
        <div className="flex h-2 gap-1 overflow-hidden rounded-full">
          {screenplay.scenes.map((scene, index) => (
            <div
              key={scene.sceneNumber}
              className="h-full transition-all hover:opacity-80"
              style={{
                width: `${(scene.duration / screenplay.totalDuration) * 100}%`,
                backgroundColor: `hsl(${174 + index * 20}, 72%, ${56 - index * 5}%)`,
              }}
              title={`Scene ${scene.sceneNumber}: ${scene.duration}s`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span>
            {Math.floor(screenplay.totalDuration / 60)}:
            {(screenplay.totalDuration % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
