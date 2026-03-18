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

/** Content AI model for slideshow generation: "kimi" or "openai" (GPT-4o) */
export type ContentAiModel = "kimi" | "openai";

export interface SlideshowPreviewOptions {
  style?: SlideshowStyle;
  userId?: string;
  contentAiModel?: ContentAiModel;
}

export interface SlideshowRequest {
  /** Main content: full document text (prefer extracted) or topic. Backend uses first ~28k chars when present. */
  content: string;
  title?: string;
  maxSlides?: number;
  style?: SlideshowStyle;
  userId?: string;
  projectId?: string;
  contentAiModel?: ContentAiModel;
  /** When set, request is sent as multipart with this file as "document" so backend can extract server-side. */
  document?: File;
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
 * Generate a full slideshow (up to 15 slides) from content.
 * Sends JSON with content (full text) or multipart with document file when request.document is set.
 */
export async function generateSlideshow(request: SlideshowRequest): Promise<SlideshowResponse> {
  try {
    console.log("[Slideshow] Generating full slideshow...");

    let body: string | FormData;
    let headers: HeadersInit = {};

    if (request.document) {
      const form = new FormData();
      form.append("document", request.document);
      form.append("content", request.content);
      if (request.title != null) {
        form.append("title", request.title);
      }
      if (request.maxSlides != null) {
        form.append("maxSlides", String(request.maxSlides));
      }
      if (request.style) {
        form.append("style", request.style);
      }
      if (request.userId) {
        form.append("userId", request.userId);
      }
      if (request.contentAiModel) {
        form.append("contentAiModel", request.contentAiModel);
      }
      body = form;
      // Do not set Content-Type; browser sets multipart boundary
    } else {
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({
        content: request.content,
        title: request.title,
        maxSlides: request.maxSlides,
        style: request.style,
        userId: request.userId,
        contentAiModel: request.contentAiModel,
      });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/video/generate-slideshow`, {
      method: "POST",
      headers,
      body,
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

export interface ExportSlideshowRequest {
  slides: SlideData[];
  title: string;
  format: "pptx" | "pdf";
}

export interface ExportSlideshowResult {
  success: boolean;
  error?: string;
}

/**
 * Export slideshow as PPTX or PDF. POSTs to backend, then triggers file download
 * using the response blob and filename from Content-Disposition or default.
 */
export async function exportSlideshow(
  request: ExportSlideshowRequest,
): Promise<ExportSlideshowResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/video/export-slideshow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slides: request.slides,
        title: request.title,
        format: request.format,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Export failed" }));
      return { success: false, error: err.message || `HTTP ${response.status}: Export failed` };
    }

    const blob = await response.blob();
    let filename = request.format === "pptx" ? "slideshow.pptx" : "slideshow.pdf";
    const disposition = response.headers.get("Content-Disposition");
    if (disposition) {
      const match =
        disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) ??
        disposition.match(/filename="?([^";\n]+)"?/i);
      if (match?.[1]) {
        filename = match[1].trim().replace(/^["']|["']$/g, "");
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return {
        success: false,
        error: `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
    };
  }
}

export const slideshowService = {
  generateSlideshowPreview,
  generateSlideshow,
  exportSlideshow,
};
