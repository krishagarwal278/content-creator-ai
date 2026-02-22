// Types matching your backend API

export type VideoFormat = "reel" | "short_video" | "vfx_movie" | "presentation";

export interface VideoGenerationRequest {
  projectId?: string;
  projectName: string;
  format: VideoFormat;
  targetDuration: number;
  topic: string;
  aiModel: string;
  enableVoiceover: boolean;
  enableCaptions: boolean;
  backgroundVideo?: {
    id: string;
    url: string;
    thumbnailUrl: string;
  };
  userId: string;
  documentContent?: string;
}

export interface ScreenplayScene {
  sceneNumber: number;
  duration: number;
  visualDescription: string;
  narration: string;
  textOverlay?: string;
  transition?: string;
}

export interface Screenplay {
  title: string;
  format: VideoFormat;
  totalDuration: number;
  scenes: ScreenplayScene[];
  voiceoverStyle?: string;
  musicSuggestion?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  projectId: string;
  screenplay: Screenplay;
  status: "screenplay_generated" | "processing" | "completed" | "failed";
  message: string;
  estimatedCompletionTime?: number;
}

export interface GenerateActualVideoRequest {
  projectId: string;
  screenplay: Screenplay;
  userId: string;
}

export interface GenerateActualVideoResponse {
  success: boolean;
  videoId?: string;
  videoUrl?: string;
  message?: string;
}

export interface VideoStatusResponse {
  status: "processing" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  error?: string;
}

export interface EnhanceScreenplayRequest {
  projectId: string;
  screenplay: Screenplay;
  feedback: string;
  aiModel?: string;
  userId?: string;
}

export interface ChatIdeateRequest {
  message: string;
  userId: string;
  format?: VideoFormat;
  aiModel?: string;
  currentScreenplay?: Screenplay;
  context?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatIdeateResponse {
  success: boolean;
  message: string;
  suggestions?: string[];
  screenplaySuggestions?: Array<{
    sceneNumber?: number;
    suggestion: string;
    type: "add" | "modify" | "remove" | "general";
  }>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function generateVideo(
  request: VideoGenerationRequest,
): Promise<VideoGenerationResponse> {
  try {
    // Try v1 endpoint first, fall back to legacy endpoint
    let response = await fetch(`${BACKEND_URL}/api/v1/video/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    // If v1 endpoint returns 404, try legacy endpoint
    if (response.status === 404) {
      response = await fetch(`${BACKEND_URL}/api/video/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate video" }));
      throw new Error(error.message || "Failed to generate video");
    }

    const json = await response.json();

    // Handle wrapped response (e.g., { data: { ... } } or { success: true, data: { ... } })
    if (json.data && (json.data.screenplay || json.data.projectId)) {
      return json.data;
    }

    return json;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function enhanceScreenplay(
  request: EnhanceScreenplayRequest,
): Promise<VideoGenerationResponse> {
  try {
    console.log("Enhancing screenplay with request:", request);

    // Try v1 endpoint first
    let response = await fetch(`${BACKEND_URL}/api/v1/video/enhance-screenplay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    // If v1 endpoint returns 404, try legacy endpoint
    if (response.status === 404) {
      console.log("v1 endpoint not found, trying legacy endpoint");
      response = await fetch(`${BACKEND_URL}/api/video/enhance-screenplay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to enhance screenplay" }));
      console.error("Enhance screenplay error response:", error);
      throw new Error(error.message || "Failed to enhance screenplay");
    }

    const json = await response.json();
    console.log("Enhance screenplay response:", json);

    // Handle wrapped response
    if (json.data && (json.data.screenplay || json.data.projectId)) {
      return json.data;
    }

    return json;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function chatIdeate(request: ChatIdeateRequest): Promise<ChatIdeateResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/ideate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to get AI response" }));
      throw new Error(error.message || "Failed to get AI response");
    }

    const json = await response.json();

    // Handle wrapped response
    if (json.data && json.data.message) {
      return json.data;
    }

    return json;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function generateActualVideo(
  request: GenerateActualVideoRequest,
): Promise<GenerateActualVideoResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/video/generate-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate video" }));
      throw new Error(error.message || "Failed to generate video");
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/video/status/${videoId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to get video status" }));
      throw new Error(error.message || "Failed to get video status");
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export interface StoredScreenplay {
  id: string;
  chatId: string;
  userId: string;
  screenplay: Screenplay;
  createdAt: string;
}

export async function getProjectScreenplays(projectId: string): Promise<StoredScreenplay[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/video/project/${projectId}/screenplays`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch screenplays" }));
      throw new Error(error.message || "Failed to fetch screenplays");
    }

    const data = await response.json();
    return data.data?.screenplays || [];
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function getAllScreenplays(userId?: string): Promise<StoredScreenplay[]> {
  try {
    const url = userId
      ? `${BACKEND_URL}/api/v1/video/screenplays?userId=${userId}`
      : `${BACKEND_URL}/api/v1/video/screenplays`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch screenplays" }));
      throw new Error(error.message || "Failed to fetch screenplays");
    }

    const data = await response.json();
    return data.data?.screenplays || [];
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

// =============================================================================
// Generation History API
// =============================================================================

export type GenerationType = "screenplay" | "video" | "enhancement";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerationHistoryEntry {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  generation_type: GenerationType;
  status: GenerationStatus;
  credits_used: number;
  format: VideoFormat;
  duration: number;
  thumbnail_url: string | null;
  video_url: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface GenerationHistoryResponse {
  entries: GenerationHistoryEntry[];
  totalGenerations: number;
  totalCreditsUsed: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VideoHistoryResponse {
  videos: GenerationHistoryEntry[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface GenerationStats {
  totalVideos: number;
  totalScreenplays: number;
  completedVideos: number;
  failedVideos: number;
  totalCreditsUsed: number;
}

export interface GetHistoryOptions {
  page?: number;
  pageSize?: number;
  type?: GenerationType;
  status?: GenerationStatus;
}

/**
 * Get generation history for a user
 */
export async function getGenerationHistory(
  userId: string,
  options: GetHistoryOptions = {},
): Promise<GenerationHistoryResponse> {
  try {
    const params = new URLSearchParams({ userId });
    if (options.page) {
      params.append("page", String(options.page));
    }
    if (options.pageSize) {
      params.append("pageSize", String(options.pageSize));
    }
    if (options.type) {
      params.append("type", options.type);
    }
    if (options.status) {
      params.append("status", options.status);
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/history?${params}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch history" }));
      throw new Error(error.message || "Failed to fetch history");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

/**
 * Get video generation history (for gallery view)
 */
export async function getVideoHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 12,
): Promise<VideoHistoryResponse> {
  try {
    const params = new URLSearchParams({
      userId,
      page: String(page),
      pageSize: String(pageSize),
    });

    const response = await fetch(`${BACKEND_URL}/api/v1/history/videos?${params}`);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch video history" }));
      throw new Error(error.message || "Failed to fetch video history");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

/**
 * Get recent generations for dashboard
 */
export async function getRecentGenerations(
  userId: string,
  limit: number = 5,
): Promise<GenerationHistoryEntry[]> {
  try {
    const params = new URLSearchParams({
      userId,
      limit: String(limit),
    });

    const response = await fetch(`${BACKEND_URL}/api/v1/history/recent?${params}`);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch recent generations" }));
      throw new Error(error.message || "Failed to fetch recent generations");
    }

    const data = await response.json();
    return data.data?.recent || [];
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

/**
 * Get generation statistics for a user
 */
export async function getGenerationStats(userId: string): Promise<GenerationStats> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/history/stats?userId=${userId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch stats" }));
      throw new Error(error.message || "Failed to fetch stats");
    }

    const data = await response.json();
    return data.data?.stats;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

/**
 * Get a single history entry by ID
 */
export async function getHistoryEntry(entryId: string): Promise<GenerationHistoryEntry | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/history/${entryId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({ message: "Failed to fetch entry" }));
      throw new Error(error.message || "Failed to fetch entry");
    }

    const data = await response.json();
    return data.data?.entry || null;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export const videoGenerationService = {
  generateVideo,
  enhanceScreenplay,
  chatIdeate,
  generateActualVideo,
  getVideoStatus,
  getProjectScreenplays,
  getAllScreenplays,
  getGenerationHistory,
  getVideoHistory,
  getRecentGenerations,
  getGenerationStats,
  getHistoryEntry,
};
