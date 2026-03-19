import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Presentation, Calendar, Download, FileText, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/common/contexts/AuthContext";
import { SlideshowPreview } from "@/common/components/ui/slideshow-preview";
import { exportSlideshow } from "@/api/slideshow-service";
import { getProjectById } from "@/api/project-service";
import { getAllSlideshows, type StoredSlideshow } from "@/api/video-generation-service";
import {
  normalizeSlideshowSlides,
  normalizeSlideshowDesignStyle,
} from "@/features/dashboard/normalizeSlideshow";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProjectFilesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [slideshows, setSlideshows] = useState<StoredSlideshow[]>([]);
  const [slideshowsLoading, setSlideshowsLoading] = useState(false);

  const [selectedSlideshow, setSelectedSlideshow] = useState<StoredSlideshow | null>(null);
  const [isExportingSlides, setIsExportingSlides] = useState<"pptx" | "pdf" | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      return;
    }
    setProjectLoading(true);
    setProjectError(null);
    try {
      const project = await getProjectById(projectId);
      setProjectName(project.name ?? "Project");
    } catch {
      setProjectError("Project not found");
      setProjectName(null);
    } finally {
      setProjectLoading(false);
    }
  }, [projectId]);

  const fetchSlideshows = useCallback(async () => {
    if (!user?.id || !projectId) {
      return;
    }
    setSlideshowsLoading(true);
    try {
      const list = await getAllSlideshows(user.id, projectId);
      setSlideshows(list);
    } catch {
      setSlideshows([]);
    } finally {
      setSlideshowsLoading(false);
    }
  }, [user?.id, projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (projectId && user?.id && !projectError) {
      fetchSlideshows();
    }
  }, [projectId, user?.id, projectError, fetchSlideshows]);

  const selectedSlides = useMemo(
    () => normalizeSlideshowSlides(selectedSlideshow?.slides),
    [selectedSlideshow],
  );

  const selectedSlideshowStyle = normalizeSlideshowDesignStyle(
    selectedSlideshow?.style ??
      selectedSlideshow?.slideshow_style ??
      selectedSlideshow?.metadata?.style,
  );

  const downloadSlidesFor = async (item: StoredSlideshow, format: "pptx" | "pdf") => {
    const slides = normalizeSlideshowSlides(item.slides);
    if (!slides.length) {
      return;
    }
    setIsExportingSlides(format);
    try {
      const result = await exportSlideshow({
        slides,
        title: item.title || "Slideshow",
        format,
      });
      if (result.success) {
        toast.success(`Downloaded as ${format.toUpperCase()}`);
      } else {
        toast.error(result.error || "Download failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setIsExportingSlides(null);
    }
  };

  const handleDownloadSlides = async (format: "pptx" | "pdf") => {
    if (!selectedSlideshow || !selectedSlides.length) {
      return;
    }
    await downloadSlidesFor(selectedSlideshow, format);
  };

  if (!projectId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <p className="text-muted-foreground">Missing project ID.</p>
      </div>
    );
  }

  if (projectLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading project…</p>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">{projectError}</p>
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Button>
          <h1 className="mb-1 text-2xl font-bold">
            <span className="gradient-text">{projectName ?? "Project"}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            View and download generated content for this project.
          </p>
        </header>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" />
            Generated slideshows
          </h2>

          {slideshowsLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-border/50 bg-muted/20 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : slideshows.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-muted/10 p-8 text-center">
              <Presentation className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">No slideshows for this project yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate a presentation from the dashboard to see it here.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate(`/project/${projectId}`)}
              >
                Open project
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {slideshows.map((item) => {
                const slidesCount =
                  item.slideCount ??
                  item.slide_count ??
                  (Array.isArray(item.slides) ? item.slides.length : 0);
                const date = new Date(item.createdAt ?? item.created_at ?? Date.now());

                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:border-primary/30 hover:bg-card/80"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{item.title || "Untitled slideshow"}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{slidesCount} slides</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(date, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setSelectedSlideshow(item)}
                      >
                        <Presentation className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSlidesFor(item, "pptx");
                        }}
                        disabled={!item.slides}
                      >
                        <Download className="h-4 w-4" />
                        PPTX
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSlidesFor(item, "pdf");
                        }}
                        disabled={!item.slides}
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Preview modal */}
      <Dialog
        open={!!selectedSlideshow}
        onOpenChange={(open) => !open && setSelectedSlideshow(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedSlideshow?.title || "Slideshow preview"}</DialogTitle>
          </DialogHeader>
          {selectedSlideshow && selectedSlides.length > 0 && (
            <div className="space-y-4">
              <SlideshowPreview
                slides={selectedSlides}
                style={selectedSlideshowStyle}
                className="rounded-xl border border-border/50"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExportingSlides !== null}
                  onClick={() => handleDownloadSlides("pptx")}
                >
                  {isExportingSlides === "pptx" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PPTX
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExportingSlides !== null}
                  onClick={() => handleDownloadSlides("pdf")}
                >
                  {isExportingSlides === "pdf" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
