/**
 * Video Generation Service Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateVideo,
  enhanceScreenplay,
  generateActualVideo,
  getVideoStatus,
  type VideoGenerationRequest,
  type EnhanceScreenplayRequest,
  type GenerateActualVideoRequest,
} from "../video-generation-service";
import { mockScreenplay } from "@/test/test-utils";

const BACKEND_URL = "http://localhost:4000";

describe("video-generation-service", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("generateVideo", () => {
    const validRequest: VideoGenerationRequest = {
      projectName: "Test Project",
      format: "reel",
      targetDuration: 30,
      topic: "AI Technology",
      aiModel: "gpt-4",
      enableVoiceover: true,
      enableCaptions: true,
      userId: "user-123",
    };

    it("should call the correct endpoint with POST method", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            projectId: "proj-123",
            screenplay: mockScreenplay(),
            status: "screenplay_generated",
            message: "Success",
          }),
      });

      await generateVideo(validRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/api/v1/video/generate`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validRequest),
        }),
      );
    });

    it("should return parsed response on success", async () => {
      const expectedResponse = {
        success: true,
        projectId: "proj-123",
        screenplay: mockScreenplay(),
        status: "screenplay_generated",
        message: "Screenplay generated successfully",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse),
      });

      const result = await generateVideo(validRequest);

      expect(result).toEqual(expectedResponse);
    });

    it("should throw error on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid request" }),
      });

      await expect(generateVideo(validRequest)).rejects.toThrow("Invalid request");
    });

    it("should throw connection error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(generateVideo(validRequest)).rejects.toThrow("Cannot connect to backend");
    });

    it("should re-throw other errors", async () => {
      const customError = new Error("Custom error");
      mockFetch.mockRejectedValueOnce(customError);

      await expect(generateVideo(validRequest)).rejects.toThrow("Custom error");
    });
  });

  describe("enhanceScreenplay", () => {
    const validRequest: EnhanceScreenplayRequest = {
      projectId: "proj-123",
      screenplay: mockScreenplay(),
      feedback: "Make it more engaging",
    };

    it("should call enhance-screenplay endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            projectId: "proj-123",
            screenplay: mockScreenplay(),
            status: "screenplay_generated",
            message: "Enhanced",
          }),
      });

      await enhanceScreenplay(validRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/api/v1/video/enhance-screenplay`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(validRequest),
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Enhancement failed" }),
      });

      await expect(enhanceScreenplay(validRequest)).rejects.toThrow("Enhancement failed");
    });
  });

  describe("generateActualVideo", () => {
    const validRequest: GenerateActualVideoRequest = {
      projectId: "proj-123",
      screenplay: mockScreenplay(),
      userId: "user-123",
    };

    it("should call generate-video endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            videoId: "vid-123",
            videoUrl: "https://example.com/video.mp4",
          }),
      });

      await generateActualVideo(validRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/api/video/generate-video`,
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should return video URL on success", async () => {
      const expectedResponse = {
        success: true,
        videoId: "vid-123",
        videoUrl: "https://example.com/video.mp4",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse),
      });

      const result = await generateActualVideo(validRequest);

      expect(result.videoUrl).toBe("https://example.com/video.mp4");
    });
  });

  describe("getVideoStatus", () => {
    it("should call status endpoint with video ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "completed",
            progress: 100,
            videoUrl: "https://example.com/video.mp4",
          }),
      });

      await getVideoStatus("vid-123");

      expect(mockFetch).toHaveBeenCalledWith(`${BACKEND_URL}/api/video/status/vid-123`);
    });

    it("should return status with progress", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "processing",
            progress: 50,
          }),
      });

      const result = await getVideoStatus("vid-123");

      expect(result.status).toBe("processing");
      expect(result.progress).toBe(50);
    });

    it("should include error for failed status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "failed",
            progress: 0,
            error: "Rendering failed",
          }),
      });

      const result = await getVideoStatus("vid-123");

      expect(result.status).toBe("failed");
      expect(result.error).toBe("Rendering failed");
    });
  });
});
