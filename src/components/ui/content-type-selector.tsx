import * as React from "react";
import { cn } from "@/lib/utils";
import { Film, Play, Clapperboard, Presentation } from "lucide-react";

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  duration: string;
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
    id: "movie",
    name: "VFX Movie",
    description: "Cinematic content",
    icon: Clapperboard,
    duration: "5-15min",
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Slide narration",
    icon: Presentation,
    duration: "Custom",
  },
];

interface ContentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ContentTypeSelector({
  value,
  onValueChange,
}: ContentTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {contentTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;

        return (
          <button
            key={type.id}
            onClick={() => onValueChange(type.id)}
            className={cn(
              "relative p-4 rounded-xl text-left transition-all duration-300",
              "border hover:border-primary/50",
              isSelected
                ? "glass-strong border-primary/60 shadow-[0_0_20px_hsl(174_72%_56%/0.15)]"
                : "glass border-border/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{type.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {type.description}
                </p>
                <span className="text-xs text-primary/80 mt-1 inline-block">
                  {type.duration}
                </span>
              </div>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
