import * as React from "react";
import { cn } from "@/lib/utils";
import { Film, Play, Clapperboard, Presentation } from "lucide-react";
import { Badge } from "./badge";

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  comingSoon?: boolean;
}

const contentTypes: ContentType[] = [
  {
    id: "reel",
    name: "Reel",
    description: "Vertical short-form",
    icon: Play,
    duration: "15-60s",
  },
  {
    id: "short",
    name: "Short Video",
    description: "Quick explainer",
    icon: Film,
    duration: "1-3min",
  },
  {
    id: "vfx_movie",
    name: "VFX Movie",
    description: "Cinematic content",
    icon: Clapperboard,
    duration: "5-15min",
    comingSoon: true,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Slide narration",
    icon: Presentation,
    duration: "Custom",
    comingSoon: true,
  },
];

interface ContentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ContentTypeSelector({ value, onValueChange }: ContentTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {contentTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;
        const isDisabled = type.comingSoon;

        return (
          <button
            key={type.id}
            onClick={() => !isDisabled && onValueChange(type.id)}
            disabled={isDisabled}
            className={cn(
              "relative rounded-xl p-4 text-left transition-all duration-300",
              "border",
              isDisabled
                ? "cursor-not-allowed border-border/30 opacity-50"
                : "hover:border-primary/50",
              isSelected && !isDisabled
                ? "glass-strong border-primary/60 shadow-[0_0_20px_hsl(174_72%_56%/0.15)]"
                : "glass border-border/50",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  isSelected && !isDisabled
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{type.name}</h4>
                  {type.comingSoon && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      Soon
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{type.description}</p>
                <span className="mt-1 inline-block text-xs text-primary/80">{type.duration}</span>
              </div>
            </div>
            {isSelected && !isDisabled && (
              <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
