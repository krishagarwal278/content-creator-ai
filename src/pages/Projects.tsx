import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects, useCreateProject, useDeleteProject, type CreateProjectInput } from "@/hooks/useProjects";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    FormControl,
    FormHelperText,
    useTheme
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Article as ArticleIcon,
} from "@mui/icons-material";

const Projects = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState<CreateProjectInput & { status: string }>({
        name: "",
        content_type: "reel",
        description: "",
        status: "draft",
        target_duration: 60,
        model: "gpt-4o",
        voiceover_enabled: true,
        captions_enabled: true,
    });

    const { data: projects, isLoading, error } = useProjects();
    const createProject = useCreateProject();
    const deleteProject = useDeleteProject();

    // Debug logging
    console.log('Projects Debug:', {
        projects,
        isLoading,
        error,
        projectsLength: projects?.length,
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newProject = await createProject.mutateAsync(formData);
            setIsCreateDialogOpen(false);
            // Reset form
            setFormData({
                name: "",
                content_type: "reel",
                description: "",
                status: "draft",
                target_duration: 60,
                model: "gpt-4o",
                voiceover_enabled: true,
                captions_enabled: true,
            });
            navigate(`/project/${newProject.id}`);
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    const handleDeleteProject = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProject.mutateAsync(id);
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'info';
            case 'failed': return 'error';
            default: return 'warning';
        }
    };

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Box
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.main'
                    }}
                >
                    <Typography variant="h5" color="error" gutterBottom>
                        Connection Error
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Failed to connect to the backend API.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Error: {error.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Make sure your backend is running on port 4000.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Projects
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and view your projects from Supabase.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    New Project
                </Button>
            </Stack>

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={handleCreateProject}>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                label="Project Name"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="e.g., My Demo Project"
                            />

                            <FormControl fullWidth required>
                                <InputLabel id="content-type-label">Content Type</InputLabel>
                                <Select
                                    labelId="content-type-label"
                                    value={formData.content_type}
                                    label="Content Type"
                                    onChange={(e) => handleInputChange("content_type", e.target.value)}
                                >
                                    <MenuItem value="reel">Reel</MenuItem>
                                    <MenuItem value="short">Short</MenuItem>
                                    <MenuItem value="vfx_movie">VFX Movie</MenuItem>
                                    <MenuItem value="presentation">Presentation</MenuItem>
                                </Select>
                                <FormHelperText>Type of video content to create</FormHelperText>
                            </FormControl>

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Project description..."
                            />

                            <FormControl fullWidth>
                                <InputLabel id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => handleInputChange("status", e.target.value)}
                                >
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="processing">Processing</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setIsCreateDialogOpen(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createProject.isPending}
                            startIcon={createProject.isPending ? <CircularProgress size={20} /> : null}
                        >
                            {createProject.isPending ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress size={40} />
                </Box>
            ) : projects && projects.length > 0 ? (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[4]
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        pt: '56.25%', // 16:9 aspect ratio
                                        bgcolor: 'primary.dark',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ArticleIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)' }} />
                                    </Box>
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="h6" component="h2" noWrap fontWeight="bold">
                                                {project.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Type: {project.content_type}
                                            </Typography>
                                        </Box>

                                        {project.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {project.description}
                                            </Typography>
                                        )}

                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="caption" fontWeight="medium">
                                                Status:
                                            </Typography>
                                            <Chip
                                                label={project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                size="small"
                                                color={getStatusColor(project.status)}
                                                variant="outlined"
                                            />
                                        </Box>

                                        {project.created_at && (
                                            <Typography variant="caption" color="text.secondary">
                                                Created: {new Date(project.created_at).toLocaleDateString()}
                                            </Typography>
                                        )}

                                        <Stack direction="row" spacing={1} mt={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                fullWidth
                                                onClick={() => navigate(`/project/${project.id}`)}
                                            >
                                                Open
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteProject(project.id, project.name)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box textAlign="center" py={8}>
                    <Typography color="text.secondary" paragraph>
                        No projects found.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        Create Your First Project
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default Projects;
