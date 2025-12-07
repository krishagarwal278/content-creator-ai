import * as React from "react";
import { ModelSelector } from "@/components/ui/model-selector";
import { ContentTypeSelector } from "@/components/ui/content-type-selector";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export function GenerationPanel() {
  const [selectedModel, setSelectedModel] = React.useState("gpt-4o");
  const [contentType, setContentType] = React.useState("reel");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [duration, setDuration] = React.useState([30]);
  const [voiceover, setVoiceover] = React.useState(true);
  const [captions, setCaptions] = React.useState(true);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const canGenerate = files.length > 0;

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="font-semibold">Upload Content</h2>
        </div>
        <FileUploadZone files={files} onFilesChange={setFiles} />
      </section>

      {/* Content Type */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h2 className="font-semibold">Choose Format</h2>
        </div>
        <ContentTypeSelector value={contentType} onValueChange={setContentType} />
      </section>

      {/* Model Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h2 className="font-semibold">AI Model</h2>
        </div>
        <ModelSelector value={selectedModel} onValueChange={setSelectedModel} />
      </section>

      {/* Settings */}
      <section className="glass rounded-xl p-4 space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Generation Settings
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="duration" className="text-sm">
              Target Duration
            </Label>
            <span className="text-sm font-mono text-primary">{duration[0]}s</span>
          </div>
          <Slider
            id="duration"
            value={duration}
            onValueChange={setDuration}
            min={15}
            max={180}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="voiceover" className="text-sm cursor-pointer">
              AI Voiceover
            </Label>
            <p className="text-xs text-muted-foreground">
              Generate natural narration
            </p>
          </div>
          <Switch
            id="voiceover"
            checked={voiceover}
            onCheckedChange={setVoiceover}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="captions" className="text-sm cursor-pointer">
              Auto Captions
            </Label>
            <p className="text-xs text-muted-foreground">
              Add synchronized subtitles
            </p>
          </div>
          <Switch
            id="captions"
            checked={captions}
            onCheckedChange={setCaptions}
          />
        </div>
      </section>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 text-primary-foreground transition-all hover:shadow-[0_0_30px_hsl(174_72%_56%/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            Generate Video
            <ChevronRight className="h-5 w-5 ml-auto" />
          </>
        )}
      </Button>
    </div>
  );
}
