/**
 * Video Generation Service Mock
 * Mock implementation for API testing
 */
import { vi } from "vitest";
import { mockScreenplay } from "../test-utils";
import type {
  VideoGenerationRequest,
  VideoGenerationResponse,
  GenerateActualVideoRequest,
  GenerateActualVideoResponse,
  VideoStatusResponse,
  EnhanceScreenplayRequest,
} from "@/api/video-generation-service";

// ============================================================================
// Mock Response Factories
// ============================================================================

export function mockVideoGenerationResponse(
  overrides: Partial<VideoGenerationResponse> = {},
): VideoGenerationResponse {
  return {
    success: true,
    projectId: "project-123",
    screenplay: mockScreenplay(),
    status: "screenplay_generated",
    message: "Screenplay generated successfully",
    estimatedCompletionTime: 30,
    ...overrides,
  };
}

export function mockGenerateActualVideoResponse(
  overrides: Partial<GenerateActualVideoResponse> = {},
): GenerateActualVideoResponse {
  return {
    success: true,
    videoId: "video-123",
    videoUrl: "https://example.com/videos/video-123.mp4",
    message: "Video generation started",
    ...overrides,
  };
}

export function mockVideoStatusResponse(
  overrides: Partial<VideoStatusResponse> = {},
): VideoStatusResponse {
  return {
    status: "completed",
    progress: 100,
    videoUrl: "https://example.com/videos/video-123.mp4",
    ...overrides,
  };
}

// ============================================================================
// Mock Functions
// ============================================================================

export const mockGenerateVideo = vi.fn(
  (_request: VideoGenerationRequest): Promise<VideoGenerationResponse> =>
    Promise.resolve(mockVideoGenerationResponse()),
);

export const mockEnhanceScreenplay = vi.fn(
  (_request: EnhanceScreenplayRequest): Promise<VideoGenerationResponse> =>
    Promise.resolve(mockVideoGenerationResponse({ message: "Screenplay enhanced successfully" })),
);

export const mockGenerateActualVideo = vi.fn(
  (_request: GenerateActualVideoRequest): Promise<GenerateActualVideoResponse> =>
    Promise.resolve(mockGenerateActualVideoResponse()),
);

export const mockGetVideoStatus = vi.fn(
  (_videoId: string): Promise<VideoStatusResponse> => Promise.resolve(mockVideoStatusResponse()),
);

// ============================================================================
// Service Mock
// ============================================================================

export const videoGenerationService = {
  generateVideo: mockGenerateVideo,
  enhanceScreenplay: mockEnhanceScreenplay,
  generateActualVideo: mockGenerateActualVideo,
  getVideoStatus: mockGetVideoStatus,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simulates a processing video status progression
 */
export function simulateVideoProcessing(onProgress?: (progress: number) => void) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    if (progress >= 100) {
      clearInterval(interval);
      mockGetVideoStatus.mockResolvedValueOnce(mockVideoStatusResponse());
    } else {
      mockGetVideoStatus.mockResolvedValueOnce(
        mockVideoStatusResponse({ status: "processing", progress, videoUrl: undefined }),
      );
    }
    onProgress?.(progress);
  }, 100);

  return () => clearInterval(interval);
}

/**
 * Reset all mocks
 */
export function resetVideoGenerationMocks() {
  mockGenerateVideo.mockClear();
  mockGenerateVideo.mockResolvedValue(mockVideoGenerationResponse());

  mockEnhanceScreenplay.mockClear();
  mockEnhanceScreenplay.mockResolvedValue(
    mockVideoGenerationResponse({ message: "Screenplay enhanced successfully" }),
  );

  mockGenerateActualVideo.mockClear();
  mockGenerateActualVideo.mockResolvedValue(mockGenerateActualVideoResponse());

  mockGetVideoStatus.mockClear();
  mockGetVideoStatus.mockResolvedValue(mockVideoStatusResponse());
}

export default {
  generateVideo: mockGenerateVideo,
  enhanceScreenplay: mockEnhanceScreenplay,
  generateActualVideo: mockGenerateActualVideo,
  getVideoStatus: mockGetVideoStatus,
};
