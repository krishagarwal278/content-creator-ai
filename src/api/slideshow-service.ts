/**
 * Slideshow Generation Service
 * Creates professional slideshows from document content via backend API
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export interface SlideData {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  narration: string;
  imageUrl?: string;
}

export interface SlideshowResponse {
  success: boolean;
  slides?: SlideData[];
  totalDuration?: number;
  slideCount?: number;
  error?: string;
}

export type SlideshowStyle = "modern" | "minimal" | "corporate" | "creative";

export interface SlideshowPreviewOptions {
  style?: SlideshowStyle;
  userId?: string;
}

export interface SlideshowRequest {
  content: string;
  title?: string;
  maxSlides?: number;
  style?: SlideshowStyle;
  userId?: string;
}

/**
 * Generate a quick slideshow preview (4 slides) from content
 */
export async function generateSlideshowPreview(
  content: string,
  options: SlideshowPreviewOptions = {},
): Promise<SlideshowResponse> {
  try {
    console.log("[Slideshow] Generating preview...");

    const response = await fetch(`${BACKEND_URL}/api/v1/video/generate-slideshow-preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, ...options }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to generate slideshow" }));
      return {
        success: false,
        error: error.message || `HTTP ${response.status}: Failed to generate slideshow`,
      };
    }

    const result = await response.json();

    if (result.data) {
      return {
        success: true,
        slides: result.data.slides,
        totalDuration: result.data.totalDuration,
        slideCount: result.data.slideCount,
      };
    }

    return {
      success: result.success ?? true,
      slides: result.slides,
      totalDuration: result.totalDuration,
      slideCount: result.slideCount,
      error: result.error,
    };
  } catch (error) {
    console.error("[Slideshow] Error generating preview:", error);

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
 * Generate a full slideshow (up to 15 slides) from content
 */
export async function generateSlideshow(request: SlideshowRequest): Promise<SlideshowResponse> {
  try {
    console.log("[Slideshow] Generating full slideshow...");

    const response = await fetch(`${BACKEND_URL}/api/v1/video/generate-slideshow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to generate slideshow" }));
      return {
        success: false,
        error: error.message || `HTTP ${response.status}: Failed to generate slideshow`,
      };
    }

    const result = await response.json();

    if (result.data) {
      return {
        success: true,
        slides: result.data.slides,
        totalDuration: result.data.totalDuration,
        slideCount: result.data.slideCount,
      };
    }

    return {
      success: result.success ?? true,
      slides: result.slides,
      totalDuration: result.totalDuration,
      slideCount: result.slideCount,
      error: result.error,
    };
  } catch (error) {
    console.error("[Slideshow] Error generating slideshow:", error);

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

export const slideshowService = {
  generateSlideshowPreview,
  generateSlideshow,
};
