/**
 * Video Generation Service Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateVideo,
  enhanceScreenplay,
  generateActualVideo,
  getVideoStatus,
  getHistoryEntry,
  type VideoGenerationRequest,
  type EnhanceScreenplayRequest,
  type GenerateActualVideoRequest,
} from "../video-generation-service";
import { mockScreenplay } from "../../test/test-utils";

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

  describe("getHistoryEntry", () => {
    it("should call history entry endpoint with entry id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              entry: {
                id: "entry-1",
                user_id: "user-1",
                project_id: "proj-1",
                project_name: "Test",
                generation_type: "video",
                status: "completed",
                video_url: "https://example.com/video.mp4",
              },
            },
          }),
      });

      await getHistoryEntry("entry-1");

      expect(mockFetch).toHaveBeenCalledWith(`${BACKEND_URL}/api/v1/history/entry-1`);
    });

    it("should return entry when response has data.data.entry", async () => {
      const entry = {
        id: "entry-1",
        user_id: "user-1",
        project_id: "proj-1",
        project_name: "Test Project",
        generation_type: "video",
        status: "completed",
        credits_used: 10,
        format: "reel",
        duration: 30,
        thumbnail_url: "https://example.com/thumb.jpg",
        video_url: "https://example.com/video.mp4",
        error_message: null,
        metadata: {},
        started_at: "2026-01-01T00:00:00Z",
        completed_at: "2026-01-01T00:01:00Z",
        created_at: "2026-01-01T00:00:00Z",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { entry } }),
      });

      const result = await getHistoryEntry("entry-1");

      expect(result).toEqual(entry);
    });

    it("should return null on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      const result = await getHistoryEntry("missing-id");

      expect(result).toBeNull();
    });

    it("should throw on non-404 error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Server error" }),
      });

      await expect(getHistoryEntry("entry-1")).rejects.toThrow("Server error");
    });

    it("should throw connection error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(getHistoryEntry("entry-1")).rejects.toThrow("Cannot connect to backend");
    });
  });
});
