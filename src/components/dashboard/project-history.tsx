import * as React from "react";
import { Play, Clock, Film, Presentation, Video, Trash2 } from "lucide-react";
import { useProjects, useDeleteProject, type Project } from "@/hooks/useProjects";
import {
  Box,
  Typography,
  Skeleton,
  Card,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import "@/css/components.css";

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

const statusClasses: Record<string, string> = {
  draft: "default",
  processing: "info",
  completed: "success",
  failed: "error",
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
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
              <Box flex={1}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  if (!projects?.length) {
    return (
      <Card variant="outlined" className="empty-state-card" sx={{ p: 4, borderRadius: 3 }}>
        <Film size={32} className="text-secondary" style={{ marginBottom: 12, opacity: 0.5 }} />
        <Typography variant="body2" color="text.secondary">
          No projects yet
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Create your first video project
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={1.5}>
      {projects.map((project) => {
        const Icon = contentTypeIcons[project.content_type];
        const isSelected = selectedProjectId === project.id;
        const statusClass = statusClasses[project.status] || "default";

        return (
          <Card
            key={project.id}
            variant="outlined"
            onClick={() => onSelectProject?.(project)}
            className={`project-card ${isSelected ? 'selected' : ''}`}
            sx={{ p: 1.5 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Thumbnail / Icon */}
              <Box className="project-thumbnail">
                {project.thumbnail_url ? (
                  <Box
                    component="img"
                    src={project.thumbnail_url}
                    alt={project.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Icon size={20} className="text-secondary" />
                )}

                {project.status === "completed" && (
                  <Box className="thumbnail-overlay">
                    <Play size={16} color="white" fill="white" />
                  </Box>
                )}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {project.name}
                  </Typography>
                  <Chip
                    label={project.status}
                    size="small"
                    variant="outlined"
                    className={`status-chip ${statusClass}`}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {contentTypeLabels[project.content_type]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">•</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Clock size={10} className="text-secondary" />
                    <Typography variant="caption" color="text.secondary">
                      {project.target_duration}s
                    </Typography>
                  </Stack>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </Typography>
              </Box>

              {/* Action */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject.mutate(project.id);
                }}
                className="delete-button"
              >
                <Trash2 size={16} />
              </IconButton>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
