import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
}

const models: Model[] = [
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

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const selectedModel = models.find((m) => m.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="glass-strong w-full h-12 px-4 rounded-xl border-border/50 hover:border-primary/50 transition-all">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <SelectValue placeholder="Select model">
            {selectedModel && (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedModel.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({selectedModel.provider})
                </span>
              </span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="glass-strong border-border/50 rounded-xl z-50">
        {models.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="rounded-lg focus:bg-primary/10 cursor-pointer"
          >
            <div className="flex flex-col gap-0.5 py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {model.provider}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {model.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
