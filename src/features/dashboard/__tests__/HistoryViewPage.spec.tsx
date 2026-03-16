/**
 * HistoryViewPage Tests (history view for PR #7)
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HistoryViewPage } from "../HistoryViewPage";
import type { GenerationHistoryEntry } from "@/api/video-generation-service";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(() => mockNavigate),
  };
});
vi.mock("@/api/video-generation-service", () => ({
  videoGenerationService: {
    getHistoryEntry: vi.fn(),
  },
}));

const { useParams } = await import("react-router-dom");
const { videoGenerationService } = await import("@/api/video-generation-service");

function mockEntry(overrides: Partial<GenerationHistoryEntry> = {}): GenerationHistoryEntry {
  return {
    id: "entry-1",
    user_id: "user-1",
    project_id: "proj-1",
    project_name: "Test Project",
    generation_type: "video",
    status: "completed",
    credits_used: 10,
    format: "reel",
    duration: 30,
    thumbnail_url: null,
    video_url: "https://example.com/video.mp4",
    error_message: null,
    metadata: {},
    started_at: "2026-01-01T00:00:00Z",
    completed_at: "2026-01-01T00:01:00Z",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("HistoryViewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("should show loading spinner when entryId is present and fetch in progress", () => {
      vi.mocked(useParams).mockReturnValue({ entryId: "entry-1" });
      vi.mocked(videoGenerationService.getHistoryEntry).mockImplementation(
        () => new Promise(() => {}),
      );

      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("missing or invalid entry", () => {
    it("should show error when entryId is missing", async () => {
      vi.mocked(useParams).mockReturnValue({});

      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Missing entry ID")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /Back to History/i })).toBeInTheDocument();
    });

    it("should show Entry not found when getHistoryEntry returns null", async () => {
      vi.mocked(useParams).mockReturnValue({ entryId: "missing" });
      vi.mocked(videoGenerationService.getHistoryEntry).mockResolvedValue(null);

      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Entry not found")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /Back to History/i })).toBeInTheDocument();
    });

    it("should show error message when getHistoryEntry throws", async () => {
      vi.mocked(useParams).mockReturnValue({ entryId: "entry-1" });
      vi.mocked(videoGenerationService.getHistoryEntry).mockRejectedValue(
        new Error("Network error"),
      );

      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /Back to History/i })).toBeInTheDocument();
    });
  });

  describe("completed entry with video", () => {
    it("should show video player and project name when entry has video_url", async () => {
      vi.mocked(useParams).mockReturnValue({ entryId: "entry-1" });
      vi.mocked(videoGenerationService.getHistoryEntry).mockResolvedValue(mockEntry());

      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });
      expect(document.querySelector("video")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Open in new tab/i })).toHaveAttribute(
        "href",
        "https://example.com/video.mp4",
      );
      expect(screen.getByRole("button", { name: /Open project/i })).toBeInTheDocument();
    });

    it("should navigate to /history when Back to History is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(useParams).mockReturnValue({});
      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Back to History/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole("button", { name: /Back to History/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/history");
    });
  });

  describe("processing entry", () => {
    it("should show processing message when status is processing", async () => {
      vi.mocked(useParams).mockReturnValue({ entryId: "entry-1" });
      vi.mocked(videoGenerationService.getHistoryEntry).mockResolvedValue(
        mockEntry({ status: "processing", video_url: null }),
      );

      render(
        <MemoryRouter>
          <HistoryViewPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Video is still generating")).toBeInTheDocument();
      });
      expect(screen.getByText("Check back in a few minutes.")).toBeInTheDocument();
    });
  });
});
