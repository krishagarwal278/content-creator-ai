# 🚀 Quick Start Guide - Testing Your API Integration

## Prerequisites

Before testing the frontend-backend connection, make sure:

1. ✅ Your **Supabase backend** is running
2. ✅ Backend is accessible at `http://localhost:4000`
3. ✅ Your **frontend** is running (`npm run dev`)

## Step 1: Start Your Backend

Navigate to your backend repository and start the server:

```bash
cd /path/to/your/backend
npm run dev
# or
supabase functions serve
```

Make sure you see output indicating the server is running on port 4000.

## Step 2: Verify Backend is Working

Test your backend endpoints using curl or your browser:

```bash
# Test if backend is accessible
curl http://localhost:4000/api/projects

# You should see a JSON response with your projects
```

## Step 3: Test the Frontend Integration

1. **Open your browser** to your frontend app (usually `http://localhost:5173`)

2. **Navigate to the API Test Page**:
   - Go to: `http://localhost:5173/api-test`
   - This page has a complete UI for testing all CRUD operations

3. **Try the following operations**:
   - ✅ View all existing projects (loaded automatically)
   - ✅ Create a new project using the form
   - ✅ Update a project by clicking the edit button
   - ✅ Delete a project by clicking the delete button

## Step 4: Use in Your Own Components

Now that you've verified the connection works, you can use the API hooks in any component:

### Example 1: Simple Project List

```tsx
import { useProjects } from '@/hooks/use-projects';

function MyProjectList() {
  const { data: projects, isLoading } = useProjects();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {projects?.map(project => (
        <div key={project.uuid}>
          <h3>{project.query}</h3>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Create Project Form

```tsx
import { useCreateProject } from '@/hooks/use-projects';
import { useState } from 'react';

function CreateProjectForm() {
  const createProject = useCreateProject();
  const [formData, setFormData] = useState({
    pawel_id: '',
    query: '',
    url: '',
    image_url: '',
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProject.mutateAsync(formData);
    // Form will reset automatically, and the project list will update!
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.query}
        onChange={(e) => setFormData({...formData, query: e.target.value})}
        placeholder="Query"
      />
      {/* Add other fields */}
      <button type="submit" disabled={createProject.isPending}>
        {createProject.isPending ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

## 🔍 Debugging

### Frontend not connecting to backend?

1. **Check the console** (F12 in browser):
   - Look for CORS errors
   - Look for network errors (failed to fetch)

2. **Verify environment variable**:
   - Check `.env` file has: `VITE_API_BASE_URL=http://localhost:4000`
   - Restart your dev server after changing `.env`

3. **Check backend is running**:
   ```bash
   curl http://localhost:4000/api/projects
   ```

### CORS Issues?

If you see CORS errors, you need to enable CORS in your backend. Add this to your backend server:

```javascript
// In your backend server file
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### Data not updating?

1. Open React Query DevTools (should appear in bottom corner)
2. Check if queries are being invalidated after mutations
3. Try manually refetching: `const { refetch } = useProjects();`

## 📚 Next Steps

1. Read the full documentation: `API_INTEGRATION.md`
2. Explore the example component: `src/components/examples/ProjectsExample.tsx`
3. Check out the service layer: `src/services/project-service.ts`
4. Review the React Query hooks: `src/hooks/use-projects.ts`

## 🎉 You're All Set!

You now have a fully functional frontend-backend integration with:
- ✅ Type-safe API calls
- ✅ Automatic caching and refetching
- ✅ Loading and error states
- ✅ Toast notifications
- ✅ Optimistic updates

Happy coding! 🚀
