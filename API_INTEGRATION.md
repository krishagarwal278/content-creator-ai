# API Integration Guide

This guide explains how to make API calls from the frontend to your Supabase backend.

## 🏗️ Architecture

The API integration is organized into layers:

1. **API Client** (`src/lib/api-client.ts`) - Low-level HTTP client
2. **Types** (`src/types/project.ts`) - TypeScript type definitions
3. **Services** (`src/services/project-service.ts`) - API endpoint functions
4. **Hooks** (`src/hooks/use-projects.ts`) - React Query hooks for components

## 🚀 Quick Start

### 1. Configure Backend URL

The backend URL is configured in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

**Important:** Make sure your backend is running on port 4000!

### 2. Use in Components

Import the hooks and use them in your React components:

```tsx
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-projects';

function MyComponent() {
  // Fetch all projects
  const { data: projects, isLoading, error } = useProjects();
  
  // Create project mutation
  const createProject = useCreateProject();
  
  // Delete project mutation
  const deleteProject = useDeleteProject();
  
  // Create a new project
  const handleCreate = async () => {
    await createProject.mutateAsync({
      pawel_id: 'test-id',
      query: 'My test query',
      url: 'https://example.com',
      image_url: 'https://example.com/image.jpg',
      description: 'Optional description'
    });
  };
  
  // Delete a project
  const handleDelete = async (id: string) => {
    await deleteProject.mutateAsync(id);
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {projects?.map(project => (
        <div key={project.uuid}>
          <h3>{project.query}</h3>
          <button onClick={() => handleDelete(project.uuid)}>Delete</button>
        </div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  );
}
```

## 📚 Available Hooks

### `useProjects()`
Fetches all projects from the backend.

**Returns:**
- `data` - Array of projects
- `isLoading` - Loading state
- `error` - Error object if request failed
- `refetch` - Function to manually refetch data

**Example:**
```tsx
const { data: projects, isLoading, error } = useProjects();
```

---

### `useProject(id: string)`
Fetches a single project by ID.

**Parameters:**
- `id` - Project UUID

**Returns:** Same as `useProjects()`

**Example:**
```tsx
const { data: project } = useProject('project-uuid-here');
```

---

### `useCreateProject()`
Creates a new project.

**Returns:**
- `mutate` - Function to trigger mutation (fire and forget)
- `mutateAsync` - Async function to trigger mutation (returns promise)
- `isPending` - Loading state
- `error` - Error object if request failed

**Example:**
```tsx
const createProject = useCreateProject();

const handleSubmit = async (formData) => {
  await createProject.mutateAsync({
    pawel_id: formData.pawelId,
    query: formData.query,
    url: formData.url,
    image_url: formData.imageUrl,
    description: formData.description, // optional
  });
};
```

---

### `useUpdateProject()`
Updates an existing project.

**Returns:** Same as `useCreateProject()`

**Example:**
```tsx
const updateProject = useUpdateProject();

const handleUpdate = async (id: string, changes) => {
  await updateProject.mutateAsync({
    id,
    data: {
      query: 'Updated query',
      // Only include fields you want to update
    }
  });
};
```

---

### `useDeleteProject()`
Deletes a project.

**Returns:** Same as `useCreateProject()`

**Example:**
```tsx
const deleteProject = useDeleteProject();

const handleDelete = async (id: string) => {
  await deleteProject.mutateAsync(id);
};
```

## 🔧 Direct Service Usage

If you need to make API calls outside of React components (e.g., in utility functions), you can use the service layer directly:

```typescript
import { projectService } from '@/services/project-service';

// Get all projects
const projects = await projectService.getAll();

// Get single project
const project = await projectService.getById('uuid');

// Create project
const newProject = await projectService.create({
  pawel_id: 'test',
  query: 'test query',
  url: 'https://example.com',
  image_url: 'https://example.com/image.jpg',
});

// Update project
const updated = await projectService.update('uuid', {
  query: 'Updated query'
});

// Delete project
await projectService.delete('uuid');
```

## 🎯 Error Handling

All hooks automatically show toast notifications for errors. You can also handle errors manually:

```tsx
const createProject = useCreateProject();

try {
  await createProject.mutateAsync(data);
  console.log('Success!');
} catch (error) {
  console.error('Failed to create project:', error);
  // Custom error handling
}
```

## 🧪 Example Component

See `src/components/examples/ProjectsExample.tsx` for a complete working example showing all CRUD operations.

## 🔐 Backend Requirements

Make sure your backend is running and has these endpoints:

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 📝 Type Definitions

All types are defined in `src/types/project.ts`:

```typescript
interface Project {
  uuid: string;
  pawel_id: string;
  query: string;
  url: string;
  image_url: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
```

## 🎨 Features

✅ Type-safe API calls with TypeScript
✅ Automatic caching with React Query
✅ Optimistic updates
✅ Automatic refetching on mutations
✅ Loading and error states
✅ Toast notifications
✅ Request/response interceptors
✅ Error handling

## 🚨 Troubleshooting

### Backend not connecting?
1. Check that your backend is running: `npm run dev` in backend folder
2. Verify the URL in `.env` matches your backend port
3. Check for CORS issues in browser console

### TypeScript errors?
1. Make sure all dependencies are installed: `npm install`
2. Restart your TypeScript server in VS Code

### Data not updating?
1. Check browser console for errors
2. Verify your backend endpoints are working (test with Postman/curl)
3. Check that React Query DevTools shows the correct cache state
