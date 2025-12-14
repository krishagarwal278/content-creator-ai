/**
 * Type definitions for the Project entity
 * Based on actual Supabase schema
 */

export interface Project {
  id: string;
  user_id: string;
  name: string;
  content_type: string;
  description?: string;
  status?: string;
  target_duration?: number;
  model?: string;
  voiceover_enabled?: boolean;
  captions_enabled?: boolean;
  thumbnail_url?: string;
  video_url?: string;
  script?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectInput {
  name: string;
  content_type: string;
  description?: string;
  status?: string;
  target_duration?: number;
  model?: string;
  voiceover_enabled?: boolean;
  captions_enabled?: boolean;
  thumbnail_url?: string;
  video_url?: string;
  script?: string;
}

export interface UpdateProjectInput {
  name?: string;
  content_type?: string;
  description?: string;
  status?: string;
  target_duration?: number;
  model?: string;
  voiceover_enabled?: boolean;
  captions_enabled?: boolean;
  thumbnail_url?: string;
  video_url?: string;
  script?: string;
}

export interface ProjectsResponse {
  projects?: Project[];
  data?: Project[];
  count?: number;
}

export interface ProjectResponse {
  project?: Project;
  data?: Project;
}
