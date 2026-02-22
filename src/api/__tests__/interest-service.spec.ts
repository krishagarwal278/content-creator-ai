/**
 * Interest Service Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  submitInterestForm,
  getInterestSubmissions,
  getInterestStats,
  type InterestFormData,
} from "../interest-service";

describe("interest-service", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("submitInterestForm", () => {
    const validFormData: InterestFormData = {
      fullName: "John Doe",
      email: "john@example.com",
      role: "content_creator",
      earlyAccessPriority: "very_interested",
      videoTopics: ["technical_skills", "business_finance"],
      useCase: "create_learning_videos",
      aiExperience: "intermediate",
    };

    it("should call the correct endpoint with POST method", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              submission: {
                id: "sub-123",
                fullName: "John Doe",
                email: "john@example.com",
                role: "content_creator",
                earlyAccessPriority: "very_interested",
                videoTopics: ["technical_skills"],
                useCase: "create_learning_videos",
                aiExperience: "intermediate",
                createdAt: "2026-02-16T00:00:00Z",
                status: "pending",
                isBetaUser: false,
              },
            },
          }),
      });

      await submitInterestForm(validFormData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/interest/submit"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: validFormData.fullName,
            email: validFormData.email,
            role: validFormData.role,
            earlyAccessPriority: validFormData.earlyAccessPriority,
            videoTopics: validFormData.videoTopics,
            useCase: validFormData.useCase,
            aiExperience: validFormData.aiExperience,
          }),
        }),
      );
    });

    it("should return parsed submission on success", async () => {
      const expectedSubmission = {
        id: "sub-123",
        fullName: "John Doe",
        email: "john@example.com",
        role: "content_creator",
        earlyAccessPriority: "very_interested",
        videoTopics: ["technical_skills"],
        useCase: "create_learning_videos",
        aiExperience: "intermediate",
        createdAt: "2026-02-16T00:00:00Z",
        status: "pending",
        isBetaUser: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { submission: expectedSubmission },
          }),
      });

      const result = await submitInterestForm(validFormData);

      expect(result.id).toBe("sub-123");
      expect(result.fullName).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
      expect(result.role).toBe("content_creator");
      expect(result.status).toBe("pending");
    });

    it("should handle snake_case response fields", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              submission: {
                id: "sub-123",
                full_name: "John Doe",
                email: "john@example.com",
                role: "content_creator",
                early_access_priority: "very_interested",
                video_topics: ["technical_skills"],
                use_case: "create_learning_videos",
                ai_experience: "intermediate",
                created_at: "2026-02-16T00:00:00Z",
                status: "pending",
                is_beta_user: false,
              },
            },
          }),
      });

      const result = await submitInterestForm(validFormData);

      expect(result.fullName).toBe("John Doe");
      expect(result.earlyAccessPriority).toBe("very_interested");
      expect(result.createdAt).toBe("2026-02-16T00:00:00Z");
      expect(result.isBetaUser).toBe(false);
    });

    it("should throw error on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Email already exists" }),
      });

      await expect(submitInterestForm(validFormData)).rejects.toThrow("Email already exists");
    });

    it("should throw connection error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(submitInterestForm(validFormData)).rejects.toThrow("Cannot connect to backend");
    });

    it("should handle minimal required fields", async () => {
      const minimalData: InterestFormData = {
        fullName: "Jane Doe",
        email: "jane@example.com",
        role: "student",
        earlyAccessPriority: "just_exploring",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              submission: {
                id: "sub-456",
                fullName: "Jane Doe",
                email: "jane@example.com",
                role: "student",
                earlyAccessPriority: "just_exploring",
                createdAt: "2026-02-16T00:00:00Z",
                status: "pending",
                isBetaUser: false,
              },
            },
          }),
      });

      const result = await submitInterestForm(minimalData);

      expect(result.fullName).toBe("Jane Doe");
      expect(result.videoTopics).toBeUndefined();
      expect(result.useCase).toBeUndefined();
    });
  });

  describe("getInterestSubmissions", () => {
    it("should call the correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { submissions: [] },
          }),
      });

      await getInterestSubmissions();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/v1/interest"));
    });

    it("should return array of submissions", async () => {
      const mockSubmissions = [
        {
          id: "sub-1",
          fullName: "User One",
          email: "one@example.com",
          role: "student",
          earlyAccessPriority: "very_interested",
          createdAt: "2026-02-16T00:00:00Z",
          status: "pending",
          isBetaUser: false,
        },
        {
          id: "sub-2",
          fullName: "User Two",
          email: "two@example.com",
          role: "educator",
          earlyAccessPriority: "somewhat_interested",
          createdAt: "2026-02-15T00:00:00Z",
          status: "approved",
          isBetaUser: true,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { submissions: mockSubmissions } }),
      });

      const result = await getInterestSubmissions();

      expect(result).toHaveLength(2);
      expect(result[0].fullName).toBe("User One");
      expect(result[1].isBetaUser).toBe(true);
    });

    it("should return empty array when no submissions", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { submissions: [] } }),
      });

      const result = await getInterestSubmissions();

      expect(result).toEqual([]);
    });

    it("should throw error on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Unauthorized" }),
      });

      await expect(getInterestSubmissions()).rejects.toThrow("Unauthorized");
    });

    it("should throw connection error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(getInterestSubmissions()).rejects.toThrow("Cannot connect to backend");
    });
  });

  describe("getInterestStats", () => {
    it("should call the correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              stats: { total: 0, pending: 0, approved: 0, betaUsers: 0 },
            },
          }),
      });

      await getInterestStats();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/v1/interest/stats"));
    });

    it("should return stats object", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              stats: { total: 100, pending: 50, approved: 40, betaUsers: 10 },
            },
          }),
      });

      const result = await getInterestStats();

      expect(result.total).toBe(100);
      expect(result.pending).toBe(50);
      expect(result.approved).toBe(40);
      expect(result.betaUsers).toBe(10);
    });

    it("should return default stats when data is missing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const result = await getInterestStats();

      expect(result).toEqual({ total: 0, pending: 0, approved: 0, betaUsers: 0 });
    });

    it("should throw error on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Server error" }),
      });

      await expect(getInterestStats()).rejects.toThrow("Server error");
    });

    it("should throw connection error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(getInterestStats()).rejects.toThrow("Cannot connect to backend");
    });
  });
});
