import { useState } from "react";
import {
  Clock,
  Film,
  Mic,
  Music,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Screenplay, ScreenplayScene } from "@/api/video-generation-service";
import { cn } from "@/lib/utils";

interface ChatScreenplayCardProps {
  screenplay: Screenplay;
  isLatest?: boolean;
  onAccept?: () => void;
}

function CompactSceneCard({ scene, isExpanded }: { scene: ScreenplayScene; isExpanded: boolean }) {
  if (!isExpanded) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
          {scene.sceneNumber}
        </span>
        <span className="flex-1 truncate text-sm text-muted-foreground">
          {scene.visualDescription.slice(0, 50)}...
        </span>
        <Badge variant="secondary" className="font-mono text-xs">
          {scene.duration}s
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {scene.sceneNumber}
          </span>
          <span className="text-sm font-medium">Scene {scene.sceneNumber}</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {scene.duration}s
        </Badge>
      </div>

      <div className="space-y-2 pl-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Visual</p>
          <p className="text-sm">{scene.visualDescription}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Narration</p>
          <p className="text-sm italic text-primary/90">"{scene.narration}"</p>
        </div>

        {scene.textOverlay && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">On-Screen</p>
            <span className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs">
              {scene.textOverlay}
            </span>
          </div>
        )}

        {scene.transition && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>→</span>
            <span>{scene.transition}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatScreenplayCard({
  screenplay,
  isLatest = false,
  onAccept,
}: ChatScreenplayCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllScenes, setShowAllScenes] = useState(false);

  const displayedScenes = showAllScenes ? screenplay.scenes : screenplay.scenes.slice(0, 3);
  const hasMoreScenes = screenplay.scenes.length > 3;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border",
        isLatest ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/50",
      )}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{screenplay.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {screenplay.totalDuration}s
              </span>
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {screenplay.scenes.length} scenes
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLatest && (
            <Badge className="bg-primary/20 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              Latest
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border/50 p-4 pt-3">
          {/* Metadata */}
          <div className="mb-4 flex flex-wrap gap-2">
            {screenplay.voiceoverStyle && (
              <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs">
                <Mic className="h-3 w-3 text-primary" />
                {screenplay.voiceoverStyle}
              </div>
            )}
            {screenplay.musicSuggestion && (
              <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs">
                <Music className="h-3 w-3 text-primary" />
                {screenplay.musicSuggestion}
              </div>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {screenplay.format.replace("_", " ")}
            </Badge>
          </div>

          {/* Scenes */}
          <div className="space-y-2">
            {displayedScenes.map((scene) => (
              <CompactSceneCard key={scene.sceneNumber} scene={scene} isExpanded={isExpanded} />
            ))}

            {hasMoreScenes && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllScenes(!showAllScenes);
                }}
              >
                {showAllScenes ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show {screenplay.scenes.length - 3} more scenes
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-4 border-t border-border/30 pt-3">
            <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
              {screenplay.scenes.map((scene, index) => (
                <div
                  key={scene.sceneNumber}
                  className="h-full transition-all hover:opacity-80"
                  style={{
                    width: `${(scene.duration / screenplay.totalDuration) * 100}%`,
                    backgroundColor: `hsl(${174 + index * 15}, 72%, ${56 - index * 3}%)`,
                  }}
                  title={`Scene ${scene.sceneNumber}: ${scene.duration}s`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isLatest && onAccept && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept();
                }}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
              >
                <Check className="mr-2 h-4 w-4" />
                Use This Screenplay
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
