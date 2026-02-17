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
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function generateVideo(
  request: VideoGenerationRequest,
): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/video/generate`, {
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

export async function enhanceScreenplay(
  request: EnhanceScreenplayRequest,
): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/video/enhance-screenplay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to enhance screenplay" }));
      throw new Error(error.message || "Failed to enhance screenplay");
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

export const videoGenerationService = {
  generateVideo,
  enhanceScreenplay,
  generateActualVideo,
  getVideoStatus,
};
