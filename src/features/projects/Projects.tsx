import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  type CreateProjectInput,
} from "@/common/hooks/useProjects";
import {
  Plus,
  Folder,
  Video,
  Sparkles,
  Clock,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Loader2,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  Film,
  Grid3X3,
  List,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Button, Input, Badge, Label, Textarea, Switch } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatLabels: Record<string, string> = {
  reel: "Reel",
  short: "Short Video",
  short_video: "Short Video",
  vfx_movie: "VFX Movie",
  presentation: "Presentation",
};

const formatColors: Record<string, string> = {
  reel: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  short: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  short_video: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  vfx_movie: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  presentation: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  draft: {
    label: "Draft",
    icon: <Folder className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  processing: {
    label: "Processing",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  screenplay_generated: {
    label: "Screenplay Ready",
    icon: <Sparkles className="h-3 w-3" />,
    className: "bg-accent/20 text-accent border-accent/30",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  failed: {
    label: "Failed",
    icon: <AlertCircle className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    content_type: string;
    status: string;
    thumbnail_url?: string | null;
    video_url?: string | null;
    target_duration?: number | null;
    created_at: string;
    updated_at?: string;
  };
  onOpen: () => void;
  onDelete: () => void;
  viewMode: "grid" | "list";
}

function ProjectCard({ project, onOpen, onDelete, viewMode }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.draft;
  const formatColor = formatColors[project.content_type] || formatColors.reel;
  const formatLabel = formatLabels[project.content_type] || project.content_type;

  if (viewMode === "list") {
    return (
      <div
        onClick={onOpen}
        className="glass group flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      >
        {/* Thumbnail */}
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Video className="h-6 w-6 text-primary/40" />
            </div>
          )}
          {project.video_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate font-semibold group-hover:text-primary">{project.name}</h3>
            <Badge variant="outline" className={status.className}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className={`${formatColor} text-[10px]`}>
              {formatLabel}
            </Badge>
            {project.target_duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {project.target_duration}s
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-strong">
            <DropdownMenuItem onClick={onOpen}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Open Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      className="glass group cursor-pointer overflow-hidden rounded-xl border border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Video className="h-12 w-12 text-primary/30" />
          </div>
        )}
        {project.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-12 w-12 text-white" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="outline" className={`${status.className} backdrop-blur-sm`}>
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
        {project.target_duration && (
          <div className="absolute bottom-2 right-2">
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
              {project.target_duration}s
            </span>
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon" className="h-8 w-8 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem onClick={onOpen}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Open Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="mb-2 truncate font-semibold group-hover:text-primary">{project.name}</h3>
        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant="outline" className={`${formatColor} text-[10px]`}>
            {formatLabel}
          </Badge>
          <span>{format(new Date(project.created_at), "MMM d, yyyy")}</span>
        </div>
      </div>
    </div>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProjectInput) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = React.useState<CreateProjectInput>({
    name: "",
    content_type: "reel",
    description: "",
    target_duration: 60,
    model: "gpt-4o",
    voiceover_enabled: true,
    captions_enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Set up a new video project with your preferred settings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Video"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="glass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">Video Format</Label>
              <Select
                value={formData.content_type}
                onValueChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    content_type: v as "reel" | "short" | "vfx_movie" | "presentation",
                  }))
                }
              >
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  <SelectItem value="reel">Reel (Vertical)</SelectItem>
                  <SelectItem value="short_video">Short Video</SelectItem>
                  <SelectItem value="vfx_movie">VFX Movie</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this video about?"
                value={formData.description || ""}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="glass min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Target Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  max={180}
                  value={formData.target_duration}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, target_duration: parseInt(e.target.value) || 60 }))
                  }
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select
                  value={formData.model || "gpt-4o"}
                  onValueChange={(v) => setFormData((p) => ({ ...p, model: v }))}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong">
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="voiceover">AI Voiceover</Label>
                <p className="text-xs text-muted-foreground">Generate natural narration</p>
              </div>
              <Switch
                id="voiceover"
                checked={formData.voiceover_enabled}
                onCheckedChange={(c) => setFormData((p) => ({ ...p, voiceover_enabled: c }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="captions">Auto Captions</Label>
                <p className="text-xs text-muted-foreground">Add synchronized subtitles</p>
              </div>
              <Switch
                id="captions"
                checked={formData.captions_enabled}
                onCheckedChange={(c) => setFormData((p) => ({ ...p, captions_enabled: c }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Film className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
      <p className="mb-6 max-w-md text-muted-foreground">
        Create your first project to start generating AI-powered videos. Each project can have
        multiple screenplays and video generations.
      </p>
      <Button onClick={onCreateClick} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Create Your First Project
      </Button>
    </div>
  );
}

const Projects = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [deleteProject, setDeleteProject] = React.useState<{ id: string; name: string } | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const { data: projects, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCreateProject = async (data: CreateProjectInput) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
      navigate(`/dashboard/${newProject.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) {
      return;
    }
    try {
      await deleteProjectMutation.mutateAsync(deleteProject.id);
      setDeleteProject(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const filteredProjects = React.useMemo(() => {
    if (!projects) {
      return [];
    }
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" || project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  if (error) {
    return (
      <div className="relative min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <div className="glass-strong rounded-2xl border border-red-500/30 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h2 className="mb-2 text-xl font-semibold">Connection Error</h2>
            <p className="mb-4 text-muted-foreground">Failed to connect to the backend API.</p>
            <p className="text-sm text-red-400">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-6">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-pulse-slow absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="animate-pulse-slow absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex animate-fade-in flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              Your <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-muted-foreground">
              Manage and organize all your video generation projects.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </header>

        {/* Filters */}
        <div
          className="mb-6 flex animate-fade-in flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-strong h-9 rounded-lg border-border/50 pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="glass-strong h-9 w-[140px] rounded-lg border-border/50">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="glass-strong rounded-lg border-border/50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="screenplay_generated">Screenplay Ready</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border/50 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {isLoading ? (
            <div className="glass-strong flex items-center justify-center rounded-2xl border border-border/50 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            projects && projects.length === 0 ? (
              <div className="glass-strong rounded-2xl border border-border/50 p-6">
                <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
              </div>
            ) : (
              <div className="glass-strong rounded-2xl border border-border/50 p-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="mb-4 h-8 w-8 text-muted-foreground/60" />
                  <h3 className="mb-2 text-lg font-semibold">No projects found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              </div>
            )
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  onOpen={() => navigate(`/dashboard/${project.id}`)}
                  onDelete={() => setDeleteProject({ id: project.id, name: project.name })}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  onOpen={() => navigate(`/dashboard/${project.id}`)}
                  onDelete={() => setDeleteProject({ id: project.id, name: project.name })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
        isLoading={createProjectMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.name}"? This action cannot be undone
              and will remove all associated screenplays and files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteProjectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
