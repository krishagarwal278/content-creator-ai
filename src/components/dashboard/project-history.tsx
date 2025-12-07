import * as React from "react";
import { Play, Clock, Film, Presentation, Video, Trash2 } from "lucide-react";
import { useProjects, useDeleteProject, type Project } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const contentTypeIcons = {
  reel: Video,
  short: Film,
  vfx_movie: Film,
  presentation: Presentation,
};

const contentTypeLabels = {
  reel: "Reel",
  short: "Short",
  vfx_movie: "VFX Movie",
  presentation: "Presentation",
};

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  processing: "bg-primary/20 text-primary animate-pulse",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-destructive/20 text-destructive",
};

interface ProjectHistoryProps {
  onSelectProject?: (project: Project) => void;
  selectedProjectId?: string | null;
}

export function ProjectHistory({ onSelectProject, selectedProjectId }: ProjectHistoryProps) {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <Film className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No projects yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create your first video project
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const Icon = contentTypeIcons[project.content_type];
        const isSelected = selectedProjectId === project.id;

        return (
          <div
            key={project.id}
            onClick={() => onSelectProject?.(project)}
            className={cn(
              "glass rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all group hover:border-primary/50",
              isSelected && "border-primary bg-primary/5"
            )}
          >
            <div className="w-14 h-14 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 relative overflow-hidden">
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon className="h-5 w-5 text-muted-foreground" />
              )}
              {project.status === "completed" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{project.name}</p>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] px-1.5 py-0", statusColors[project.status])}
                >
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{contentTypeLabels[project.content_type]}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.target_duration}s
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteProject.mutate(project.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
