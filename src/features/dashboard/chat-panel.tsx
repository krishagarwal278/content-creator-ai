import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import {
  Send,
  Video,
  Loader2,
  Sparkles,
  Lightbulb,
  Play,
  Pause,
  Download,
  Share2,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChatMessage, TypingIndicator, type ChatMessageData } from "./chat-message";
import { ChatScreenplayCard } from "./chat-screenplay-card";
import type { Screenplay, VideoFormat } from "@/api/video-generation-service";
import { videoGenerationService } from "@/api/video-generation-service";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  screenplay: Screenplay | null;
  projectId: string | null;
  userId?: string;
  onScreenplayUpdate: (screenplay: Screenplay) => void;
  onScreenplayGenerated?: (screenplay: Screenplay, projectId: string) => void;
  initialVideoUrl?: string | null;
  initialVideoId?: string | null;
  aiModel?: string;
  format?: VideoFormat;
}

const IDEATION_SUGGESTIONS = [
  "Help me brainstorm a reel about productivity",
  "What makes a good tech startup intro?",
  "Ideas for an educational AI explainer",
  "How should I structure a travel montage?",
];

const REFINEMENT_SUGGESTIONS = [
  "Make it more dramatic",
  "Add a stronger hook",
  "Shorten the intro",
  "Make it funnier",
];

export function ChatPanel({
  screenplay,
  projectId,
  userId,
  onScreenplayUpdate,
  onScreenplayGenerated,
  initialVideoUrl,
  initialVideoId,
  aiModel = "gpt-4o",
  format,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const isLoading = isRefining || isGenerating;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, screenplay]);

  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
    }
  }, [initialVideoUrl]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const pollVideoStatus = useCallback(async (videoId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const status = await videoGenerationService.getVideoStatus(videoId);
        setVideoProgress(status.progress);

        if (status.status === "completed" && status.videoUrl) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          setVideoUrl(status.videoUrl);
          setIsGeneratingVideo(false);
          toast.success("Video generated successfully!");
        } else if (status.status === "failed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          setIsGeneratingVideo(false);
          toast.error(status.error || "Video generation failed");
        }
      } catch (error) {
        console.error("Error polling video status:", error);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    if (initialVideoId) {
      setIsGeneratingVideo(true);
      pollVideoStatus(initialVideoId);
    }
  }, [initialVideoId, pollVideoStatus]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue("");

    // If no screenplay exists, this is ideation mode - provide helpful suggestions
    if (!screenplay) {
      await handleIdeation(messageContent);
    } else if (projectId) {
      await handleRefineScreenplay(messageContent);
    }
  };

  const handleIdeation = async (message: string) => {
    setIsGenerating(true);

    try {
      const context = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await videoGenerationService.chatIdeate({
        message,
        userId: userId || "anonymous",
        format: format || screenplay?.format,
        aiModel,
        currentScreenplay: screenplay || undefined,
        context,
      });

      const assistantMessage: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const fallbackResponses = [
        `Great idea! For "${message.slice(0, 50)}${message.length > 50 ? "..." : ""}", I'd suggest:\n\n• Start with a strong hook in the first 3 seconds\n• Keep the pacing quick for better engagement\n• End with a clear call-to-action\n\nWhen you're ready, fill in the details on the left and click "Generate Screenplay" to create your video script!`,
        `I love that concept! Here are some tips:\n\n• Focus on one key message\n• Use visuals that match your narration\n• Consider your target audience\n\nOnce you've refined your idea, use the form on the left to generate your screenplay.`,
        `That's a solid starting point! Consider:\n\n• What's the main takeaway for viewers?\n• What emotion do you want to evoke?\n• What's your unique angle?\n\nWhen you're happy with the concept, set your preferences on the left and hit "Generate Screenplay"!`,
      ];

      const assistantMessage: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (error instanceof Error && !error.message.includes("Cannot connect to backend")) {
        console.error("Ideation error:", error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineScreenplay = async (feedback: string) => {
    if (!screenplay || !projectId) {
      return;
    }

    setIsRefining(true);

    try {
      const result = await videoGenerationService.enhanceScreenplay({
        projectId,
        screenplay,
        feedback,
        aiModel,
        userId,
      });

      if (result.screenplay) {
        onScreenplayUpdate(result.screenplay);

        const assistantMessage: ChatMessageData = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "I've updated the screenplay based on your feedback. Here's the refined version:",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to refine screenplay";
      toast.error(errorMessage);

      const errorAssistantMessage: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an issue: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleGenerateVideo = async () => {
    if (!screenplay || !projectId) {
      toast.error("Screenplay and project are required");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setVideoUrl(null);

    try {
      const result = await videoGenerationService.generateActualVideo({
        projectId,
        screenplay,
        userId: userId || "anonymous",
      });

      if (result.success && result.videoUrl) {
        setVideoUrl(result.videoUrl);
        setIsGeneratingVideo(false);
        toast.success("Video generated successfully!");
      } else if (result.videoId) {
        toast.info("Video is being processed...");
        pollVideoStatus(result.videoId);
      } else {
        throw new Error(result.message || "Unknown error");
      }
    } catch (error) {
      setIsGeneratingVideo(false);
      const message = error instanceof Error ? error.message : "Failed to generate video";
      toast.error(message);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Video Player Section (shows when video exists or generating) */}
      {(videoUrl || isGeneratingVideo) && (
        <div className="mb-4 flex-shrink-0">
          <div className="glass group relative h-[200px] overflow-hidden rounded-xl">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlayPause}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full bg-primary"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={() => videoUrl && window.open(videoUrl, "_blank")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-7 w-7">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  {screenplay && projectId && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                    >
                      <RefreshCw
                        className={cn("h-3.5 w-3.5", isGeneratingVideo && "animate-spin")}
                      />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Generating Video</p>
                  <Progress value={videoProgress} className="mt-2 h-1.5 w-32" />
                  <p className="mt-1 text-xs text-muted-foreground">{videoProgress}% complete</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        {/* Welcome message when no screenplay and no messages */}
        {!screenplay && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Need help with your idea?</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Chat with me to brainstorm and refine your video concept. When ready, use the form on
              the left to generate your screenplay.
            </p>

            {/* Ideation suggestions */}
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {IDEATION_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="space-y-4 py-4">
          {messages.map((message, index) => {
            const isLastAssistantBeforeScreenplay =
              message.role === "assistant" && index === messages.length - 1 && screenplay;

            return (
              <Fragment key={message.id}>
                <ChatMessage message={message}>
                  {isLastAssistantBeforeScreenplay && (
                    <ChatScreenplayCard screenplay={screenplay} isLatest={true} />
                  )}
                </ChatMessage>
              </Fragment>
            );
          })}

          {/* Show screenplay after initial generation (no messages yet) */}
          {screenplay && messages.length === 0 && (
            <div className="space-y-4">
              <ChatMessage
                message={{
                  id: "initial",
                  role: "assistant",
                  content:
                    "I've created a screenplay based on your requirements. Review it below and let me know if you'd like any changes!",
                  timestamp: new Date(),
                }}
              >
                <ChatScreenplayCard screenplay={screenplay} isLatest={true} />
              </ChatMessage>
            </div>
          )}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion Chips - Show refinement suggestions when screenplay exists */}
      {screenplay && !isLoading && messages.length > 0 && (
        <div className="flex flex-shrink-0 flex-wrap gap-2 pb-3">
          {REFINEMENT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area - Always visible */}
      <div className="flex-shrink-0 space-y-3 border-t border-border/50 pt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                screenplay
                  ? "Ask for changes... e.g., 'Make scene 2 more dramatic'"
                  : "Ask for help... e.g., 'How should I structure a product demo?'"
              }
              className="glass pr-10"
              disabled={isLoading}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : screenplay ? (
                <Send className="h-4 w-4" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Generate Video Button - Always visible, enabled after screenplay */}
        {!videoUrl && !isGeneratingVideo && (
          <Button
            onClick={handleGenerateVideo}
            disabled={!screenplay || !projectId}
            className={cn(
              "h-12 w-full rounded-xl text-base font-semibold transition-all",
              screenplay && projectId
                ? "bg-gradient-to-r from-primary via-primary/90 to-accent hover:shadow-[0_0_20px_hsl(174_72%_56%/0.3)]"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Video className="mr-2 h-5 w-5" />
            Generate Video
          </Button>
        )}
      </div>
    </div>
  );
}
