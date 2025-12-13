/**
 * Example component demonstrating how to use the project API hooks
 * Updated to use Material UI and correct Schema
 */

import { useState } from 'react';
import {
    useProjects,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
} from '@/hooks/use-projects';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    TextField,
    Typography,
    Grid,
    IconButton,
    Box,
    CircularProgress,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';

export function ProjectsExample() {
    const [newProject, setNewProject] = useState({
        name: '',
        content_type: '',
        description: '',
        status: 'draft',
    });

    // Fetch all projects
    const { data: projects, isLoading, error } = useProjects();

    // Mutations
    const createMutation = useCreateProject();
    const updateMutation = useUpdateProject();
    const deleteMutation = useDeleteProject();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createMutation.mutateAsync({
            ...newProject,
            name: newProject.name, // Ensure required fields
            content_type: newProject.content_type || 'short'
        });
        // Reset form
        setNewProject({
            name: '',
            content_type: '',
            description: '',
            status: 'draft',
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleUpdate = async (id: string, currentName: string) => {
        const newName = prompt('Enter new project name:', currentName);
        if (newName) {
            await updateMutation.mutateAsync({
                id,
                data: { name: newName },
            });
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4} textAlign="center">
                <Typography color="error">Error: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Projects Manager Example
            </Typography>

            <Grid container spacing={4}>
                {/* Create Project Form */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Create New Project" />
                        <CardContent>
                            <form onSubmit={handleCreate}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Project Name"
                                        value={newProject.name}
                                        onChange={(e) =>
                                            setNewProject({ ...newProject, name: e.target.value })
                                        }
                                        required
                                        fullWidth
                                    />

                                    <FormControl fullWidth required>
                                        <InputLabel>Content Type</InputLabel>
                                        <Select
                                            value={newProject.content_type}
                                            label="Content Type"
                                            onChange={(e) =>
                                                setNewProject({ ...newProject, content_type: e.target.value })
                                            }
                                        >
                                            <MenuItem value="reel">Reel</MenuItem>
                                            <MenuItem value="short">Short</MenuItem>
                                            <MenuItem value="vfx_movie">VFX Movie</MenuItem>
                                            <MenuItem value="presentation">Presentation</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Description"
                                        value={newProject.description}
                                        onChange={(e) =>
                                            setNewProject({ ...newProject, description: e.target.value })
                                        }
                                        multiline
                                        rows={2}
                                        fullWidth
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={createMutation.isPending}
                                        startIcon={<AddIcon />}
                                        fullWidth
                                    >
                                        {createMutation.isPending ? 'Creating...' : 'Create Project'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Projects List */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="h5" gutterBottom>
                        All Projects ({projects?.length || 0})
                    </Typography>

                    {projects && projects.length > 0 ? (
                        <Grid container spacing={2}>
                            {projects.map((project) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={project.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" noWrap>
                                                {project.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                ID: {project.id}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Type: {project.content_type}
                                            </Typography>

                                            {project.description && (
                                                <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                                                    {project.description}
                                                </Typography>
                                            )}

                                            <Stack direction="row" spacing={1} mt={2}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleUpdate(project.id, project.name)}
                                                    disabled={updateMutation.isPending}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDelete(project.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="text.secondary">No projects found.</Typography>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}
