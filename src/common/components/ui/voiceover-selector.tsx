import { useState, useRef } from "react";
import { Mic, Upload, Volume2, Play, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { VoiceoverOptions, VoiceoverMode } from "@/api/video-generation-service";
import { DEFAULT_AI_VOICES } from "@/api/video-generation-service";
import { voiceService } from "@/api/voice-service";

export interface ProjectAudioItem {
  id: string;
  name: string;
  fileUrl: string;
}

interface VoiceoverSelectorProps {
  value: VoiceoverOptions;
  onChange: (value: VoiceoverOptions) => void;
  /** When mode is "personal", list of project audio to choose from */
  projectAudioList?: ProjectAudioItem[];
  /** Label for the main voiceover toggle */
  label?: string;
  /** Short description under the toggle */
  description?: string;
  /** Compact layout (e.g. for Create Project dialog) */
  compact?: boolean;
  /** Optional userId for TTS preview (backend may use for quotas) */
  userId?: string;
  /** Show "Preview voice" button when AI voice is selected (calls backend TTS) */
  showPreview?: boolean;
}

const PREVIEW_SAMPLE_TEXT = "This is a preview of your selected voice for course narration.";

export function VoiceoverSelector({
  value,
  onChange,
  projectAudioList = [],
  label = "Voiceover",
  description = "AI narration or your own voice",
  compact = false,
  userId,
  showPreview = true,
}: VoiceoverSelectorProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const setEnabled = (enabled: boolean) => onChange({ ...value, enabled });
  const setMode = (mode: VoiceoverMode) =>
    onChange({
      ...value,
      mode,
      personalAudioUrl: mode === "personal" ? value.personalAudioUrl : undefined,
      voiceId: mode === "ai" ? value.voiceId : undefined,
    });
  const setVoiceId = (voiceId: string) => onChange({ ...value, voiceId });
  const setPersonalAudioUrl = (personalAudioUrl: string) =>
    onChange({ ...value, personalAudioUrl });

  const handlePreviewVoice = async () => {
    const voiceId = value.voiceId ?? DEFAULT_AI_VOICES[0].id;
    setIsPreviewing(true);
    try {
      const result = await voiceService.synthesizeSpeech({
        text: PREVIEW_SAMPLE_TEXT,
        voiceId,
        userId,
        model: "tts-1-hd",
      });
      if (result.success && (result.audioUrl || result.audioBase64)) {
        const url =
          result.audioUrl ??
          (result.audioBase64 ? `data:audio/mp3;base64,${result.audioBase64}` : null);
        if (url) {
          const audio = new Audio(url);
          previewAudioRef.current = audio;
          await audio.play();
        }
      }
    } catch {
      // Error surfaced by voiceService or play()
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="voiceover-toggle" className="cursor-pointer text-sm">
            {label}
          </Label>
          {!compact && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Switch id="voiceover-toggle" checked={value.enabled} onCheckedChange={setEnabled} />
      </div>

      {value.enabled && (
        <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
          <RadioGroup
            value={value.mode}
            onValueChange={(v) => setMode(v as VoiceoverMode)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ai" id="voice-ai" />
              <Label
                htmlFor="voice-ai"
                className="flex cursor-pointer items-center gap-1.5 font-normal"
              >
                <Volume2 className="h-3.5 w-3.5" />
                AI voice
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" id="voice-personal" />
              <Label
                htmlFor="voice-personal"
                className="flex cursor-pointer items-center gap-1.5 font-normal"
              >
                <Mic className="h-3.5 w-3.5" />
                My voice
              </Label>
            </div>
          </RadioGroup>

          {value.mode === "ai" && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Choose voice</Label>
                <Select value={value.voiceId ?? DEFAULT_AI_VOICES[0].id} onValueChange={setVoiceId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_AI_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                        {voice.description ? ` — ${voice.description}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handlePreviewVoice}
                  disabled={isPreviewing}
                >
                  {isPreviewing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Preview voice
                </Button>
              )}
            </div>
          )}

          {value.mode === "personal" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Use project audio or upload new
              </Label>
              {projectAudioList.length > 0 ? (
                <Select value={value.personalAudioUrl ?? ""} onValueChange={setPersonalAudioUrl}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select saved audio" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectAudioList.map((a) => (
                      <SelectItem key={a.id} value={a.fileUrl}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Upload className="h-3.5 w-3.5" />
                  Upload or record audio in the project to use your voice.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
