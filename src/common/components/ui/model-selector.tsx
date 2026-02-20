import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Video } from "lucide-react";

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  price?: string;
}

const screenplayModels: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable multimodal model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and affordable",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Balanced performance",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Advanced reasoning",
  },
];

const videoModels: Model[] = [
  {
    id: "fal-ai/ovi",
    name: "Fal AI Ovi",
    provider: "Fal AI",
    description: "Text-to-video with synchronized audio",
    price: "$0.20/video",
  },
];

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const selectedModel = screenplayModels.find((m) => m.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="glass-strong h-12 w-full rounded-xl border-border/50 px-4 transition-all hover:border-primary/50">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <SelectValue placeholder="Select model">
            {selectedModel && (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedModel.name}</span>
                <span className="text-xs text-muted-foreground">({selectedModel.provider})</span>
              </span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="glass-strong z-50 rounded-xl border-border/50">
        {screenplayModels.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="cursor-pointer rounded-lg focus:bg-primary/10"
          >
            <div className="flex flex-col gap-0.5 py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {model.provider}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface VideoModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function VideoModelSelector({ value, onValueChange }: VideoModelSelectorProps) {
  const selectedModel = videoModels.find((m) => m.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="glass-strong h-12 w-full rounded-xl border-border/50 px-4 transition-all hover:border-primary/50">
        <div className="flex items-center gap-3">
          <Video className="h-4 w-4 text-accent" />
          <SelectValue placeholder="Select video model">
            {selectedModel && (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedModel.name}</span>
                <span className="text-xs text-muted-foreground">({selectedModel.provider})</span>
              </span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="glass-strong z-50 rounded-xl border-border/50">
        {videoModels.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="cursor-pointer rounded-lg focus:bg-primary/10"
          >
            <div className="flex flex-col gap-0.5 py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {model.provider}
                </span>
                {model.price && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                    {model.price}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
