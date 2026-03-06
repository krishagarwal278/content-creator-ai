import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Video, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  videoGenerationService,
  type GenerationHistoryEntry,
} from "@/api/video-generation-service";
import { format } from "date-fns";

export function HistoryViewPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<GenerationHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) {
      setLoading(false);
      setError("Missing entry ID");
      return;
    }

    let cancelled = false;

    async function fetchEntry() {
      try {
        const data = await videoGenerationService.getHistoryEntry(entryId ?? "");
        if (!cancelled) {
          setEntry(data);
          setError(data ? null : "Entry not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEntry();
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-center text-muted-foreground">{error || "Entry not found"}</p>
        <Button variant="outline" onClick={() => navigate("/history")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
      </div>
    );
  }

  const isCompleted = entry.status === "completed";
  const hasVideo = Boolean(entry.video_url);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/history")}>
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>

        <header className="mb-6">
          <h1 className="mb-1 text-2xl font-bold">{entry.project_name}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(entry.created_at), "MMM d, yyyy 'at' HH:mm")} · {entry.format} ·{" "}
            {entry.status}
          </p>
        </header>

        {isCompleted && hasVideo ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-black/5">
              <video
                key={entry.video_url ?? undefined}
                src={entry.video_url ?? undefined}
                controls
                className="h-auto w-full"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={entry.video_url ?? "#"} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in new tab
                </a>
              </Button>
              {entry.project_id && (
                <Button variant="outline" onClick={() => navigate(`/project/${entry.project_id}`)}>
                  <Video className="mr-2 h-4 w-4" />
                  Open project
                </Button>
              )}
            </div>
          </div>
        ) : entry.status === "processing" || entry.status === "pending" ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 py-16">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="font-medium">Video is still generating</p>
            <p className="text-sm text-muted-foreground">Check back in a few minutes.</p>
            {entry.project_id && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate(`/project/${entry.project_id}`)}
              >
                Open project
              </Button>
            )}
          </div>
        ) : entry.project_id ? (
          <div className="rounded-xl border border-border bg-muted/20 p-6">
            <p className="mb-4 text-muted-foreground">
              {entry.status === "failed" && entry.error_message
                ? entry.error_message
                : "No video file available. Open the project to view screenplay or regenerate."}
            </p>
            <Button onClick={() => navigate(`/project/${entry.project_id}`)}>
              <Video className="mr-2 h-4 w-4" />
              Open project
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/20 p-6">
            <p className="text-muted-foreground">
              {entry.status === "failed" && entry.error_message
                ? entry.error_message
                : "This entry has no video or project linked."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
