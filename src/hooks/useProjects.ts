import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "processing" | "completed" | "failed";
  content_type: "reel" | "short" | "vfx_movie" | "presentation";
  target_duration: number;
  model: string;
  voiceover_enabled: boolean;
  captions_enabled: boolean;
  thumbnail_url: string | null;
  video_url: string | null;
  script: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  content_type: "reel" | "short" | "vfx_movie" | "presentation";
  target_duration: number;
  model: string;
  voiceover_enabled: boolean;
  captions_enabled: boolean;
}

// Mock data store (in-memory for now, will be replaced with Supabase later)
let mockProjects: Project[] = [
  {
    id: "1",
    name: "Sample Marketing Reel",
    description: "A demo marketing video",
    status: "completed",
    content_type: "reel",
    target_duration: 30,
    model: "gpt-4o",
    voiceover_enabled: true,
    captions_enabled: true,
    thumbnail_url: null,
    video_url: null,
    script: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    name: "Product Demo Short",
    description: "Quick product showcase",
    status: "processing",
    content_type: "short",
    target_duration: 60,
    model: "gemini-pro",
    voiceover_enabled: true,
    captions_enabled: false,
    thumbnail_url: null,
    video_url: null,
    script: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...mockProjects].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockProjects.find((p) => p.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: input.name,
        description: input.description || null,
        status: "draft",
        content_type: input.content_type,
        target_duration: input.target_duration,
        model: input.model,
        voiceover_enabled: input.voiceover_enabled,
        captions_enabled: input.captions_enabled,
        thumbnail_url: null,
        video_url: null,
        script: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockProjects.push(newProject);
      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Project>;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const projectIndex = mockProjects.findIndex((p) => p.id === id);
      if (projectIndex === -1) throw new Error("Project not found");
      
      mockProjects[projectIndex] = {
        ...mockProjects[projectIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      return mockProjects[projectIndex];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
    },
    onError: (error) => {
      toast.error("Failed to update project: " + error.message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockProjects = mockProjects.filter((p) => p.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete project: " + error.message);
    },
  });
}

