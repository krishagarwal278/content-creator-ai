import * as React from "react";
import { cn } from "@/lib/utils";
import { Play, Download, Share2, Maximize2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewPanel() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Preview</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="flex-1 glass rounded-2xl overflow-hidden relative group">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card via-card/80 to-secondary/50">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/30 blur-3xl animate-pulse-slow" />
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/30 blur-3xl animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* Placeholder Content */}
          <div className="relative z-10 text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No video yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Upload your content and click generate to create your video
            </p>
          </div>
        </div>

        {/* Video Controls Overlay (shown when video exists) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
            >
              <Play className="h-5 w-5 text-primary-foreground" />
            </Button>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-0 bg-primary rounded-full" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              0:00 / 0:00
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl glass border-border/50 hover:border-primary/50"
          disabled
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl glass border-border/50 hover:border-primary/50"
          disabled
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Recent Projects */}
      <div className="mt-6">
        <h3 className="font-medium text-sm text-muted-foreground mb-3">
          Recent Projects
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass rounded-xl p-3 flex items-center gap-3 opacity-50 cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Play className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Project {i}</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
