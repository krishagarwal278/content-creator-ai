/**
 * fal.ai Video Generation Service
 * Calls backend API which proxies to fal.ai (API keys should not be exposed in browser)
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export interface TextToVideoRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  model?: "minimax" | "wan" | "luma";
  userId?: string;
}

export interface TextToVideoResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  requestId?: string;
}

export interface VideoGenerationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  videoUrl?: string;
  error?: string;
}

/**
 * Generate a video from text prompt using fal.ai (via backend proxy)
 */
export async function generateTextToVideo(
  request: TextToVideoRequest,
): Promise<TextToVideoResponse> {
  try {
    console.log(`[fal.ai] Starting text-to-video generation via backend`);
    console.log(`[fal.ai] Prompt: ${request.prompt.substring(0, 100)}...`);

    const response = await fetch(`${BACKEND_URL}/api/v1/video/generate-fal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        duration: request.duration || 5,
        aspectRatio: request.aspectRatio || "16:9",
        model: request.model || "minimax",
        userId: request.userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate video" }));
      return {
        success: false,
        error: error.message || `HTTP ${response.status}: Failed to generate video`,
      };
    }

    const result = await response.json();

    if (result.data) {
      return {
        success: true,
        videoUrl: result.data.videoUrl,
        requestId: result.data.requestId,
      };
    }

    return {
      success: result.success ?? true,
      videoUrl: result.videoUrl,
      requestId: result.requestId,
      error: result.error,
    };
  } catch (error) {
    console.error("[fal.ai] Error generating video:", error);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return {
        success: false,
        error: `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Generate a video from an image using fal.ai (via backend proxy)
 */
export async function generateImageToVideo(
  imageUrl: string,
  prompt: string,
  model: "minimax" | "kling" | "luma" = "minimax",
  userId?: string,
): Promise<TextToVideoResponse> {
  try {
    console.log(`[fal.ai] Starting image-to-video generation via backend`);

    const response = await fetch(`${BACKEND_URL}/api/v1/video/generate-fal-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        imageUrl,
        model,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate video" }));
      return {
        success: false,
        error: error.message || `HTTP ${response.status}: Failed to generate video`,
      };
    }

    const result = await response.json();

    if (result.data) {
      return {
        success: true,
        videoUrl: result.data.videoUrl,
        requestId: result.data.requestId,
      };
    }

    return {
      success: result.success ?? true,
      videoUrl: result.videoUrl,
      requestId: result.requestId,
      error: result.error,
    };
  } catch (error) {
    console.error("[fal.ai] Error generating video:", error);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return {
        success: false,
        error: `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Check if backend is available for fal.ai generation
 */
export async function isFalConfigured(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const falVideoService = {
  generateTextToVideo,
  generateImageToVideo,
  isFalConfigured,
};
