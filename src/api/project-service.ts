/**
 * Project Service - API calls for project CRUD operations
 */

import { apiClient } from "@/common/utils/api-client";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectsResponse,
  ProjectResponse,
} from "@/common/types/project";

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  console.log("Fetching projects from API...");
  const response = await apiClient.get<ProjectsResponse | Project[]>("/api/projects");
  console.log("API Response:", response);

  // Handle different response formats
  let projects: Project[];

  // Check if response is already an array
  if (Array.isArray(response)) {
    projects = response;
  } else {
    // Otherwise, try to extract from object properties
    projects = response.projects || response.data || [];
  }

  console.log("Parsed projects:", projects);

  return projects;
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project> {
  const response = await apiClient.get<ProjectResponse>(`/api/projects/${id}`);
  // Handle different response formats
  return response.project || response.data || (response as unknown as Project);
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectInput): Promise<Project> {
  const response = await apiClient.post<ProjectResponse | Project>("/api/projects", data);
  // Handle different response formats
  if ("id" in response && "name" in response) {
    // Response is already a Project object
    return response as Project;
  }
  return response.project || response.data || (response as unknown as Project);
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
  const response = await apiClient.put<ProjectResponse>(`/api/projects/${id}`, data);
  // Handle different response formats
  return response.project || response.data || (response as unknown as Project);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/api/projects/${id}`);
}

/**
 * Project service object (alternative usage pattern)
 */
export const projectService = {
  getAll: getProjects,
  getById: getProjectById,
  create: createProject,
  update: updateProject,
  delete: deleteProject,
};

export default projectService;
