/**
 * GenerationPanel Component Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GenerationPanel } from "../generation-panel";

// Mock the API services
vi.mock("@/api", () => ({
  storageService: {
    getProjectFiles: vi.fn().mockResolvedValue([]),
    uploadFile: vi.fn().mockResolvedValue({}),
  },
  generateVideo: vi.fn(),
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      }),
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { generateVideo, storageService, supabase } from "@/api";
import { toast } from "sonner";

describe("GenerationPanel", () => {
  const mockOnScreenplayGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render topic input section", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("Describe Your Video")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/What should your video be about/)).toBeInTheDocument();
    });

    it("should render file upload section", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("Upload Content")).toBeInTheDocument();
    });

    it("should render content type selector", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("Choose Format")).toBeInTheDocument();
      expect(screen.getByText("Reel")).toBeInTheDocument();
      expect(screen.getByText("Short Video")).toBeInTheDocument();
    });

    it("should render AI models section", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("AI Models")).toBeInTheDocument();
      expect(screen.getByText("Screenplay AI")).toBeInTheDocument();
      expect(screen.getByText("Video Generation")).toBeInTheDocument();
    });

    it("should render generation settings", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("Generation Settings")).toBeInTheDocument();
      expect(screen.getByText("Target Duration")).toBeInTheDocument();
      expect(screen.getByText("AI Voiceover")).toBeInTheDocument();
      expect(screen.getByText("Auto Captions")).toBeInTheDocument();
    });

    it("should render generate button", () => {
      render(<GenerationPanel />);

      expect(screen.getByRole("button", { name: /Generate Screenplay/i })).toBeInTheDocument();
    });
  });

  describe("Topic Input", () => {
    it("should update topic value when typing", async () => {
      const user = userEvent.setup();
      render(<GenerationPanel />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "AI productivity tips");

      expect(input).toHaveValue("AI productivity tips");
    });

    it("should disable generate button when topic is empty", () => {
      render(<GenerationPanel />);

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      expect(button).toBeDisabled();
    });

    it("should enable generate button when topic has content", async () => {
      const user = userEvent.setup();
      render(<GenerationPanel />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "Test topic");

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("Content Type Selection", () => {
    it("should default to reel format", () => {
      render(<GenerationPanel />);

      const reelButton = screen.getByText("Reel").closest("button");
      expect(reelButton).toHaveClass("glass-strong");
    });

    it("should change content type when clicked", async () => {
      const user = userEvent.setup();
      render(<GenerationPanel />);

      const shortVideoButton = screen.getByText("Short Video").closest("button");
      await user.click(shortVideoButton!);

      expect(shortVideoButton).toHaveClass("glass-strong");
    });
  });

  describe("Duration Slider", () => {
    it("should display default duration", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("30s")).toBeInTheDocument();
    });
  });

  describe("Toggle Switches", () => {
    it("should have voiceover enabled by default", () => {
      render(<GenerationPanel />);

      const voiceoverSwitch = screen.getByRole("switch", { name: /AI Voiceover/i });
      expect(voiceoverSwitch).toBeChecked();
    });

    it("should have captions enabled by default", () => {
      render(<GenerationPanel />);

      const captionsSwitch = screen.getByRole("switch", { name: /Auto Captions/i });
      expect(captionsSwitch).toBeChecked();
    });

    it("should toggle voiceover when clicked", async () => {
      const user = userEvent.setup();
      render(<GenerationPanel />);

      const voiceoverSwitch = screen.getByRole("switch", { name: /AI Voiceover/i });
      await user.click(voiceoverSwitch);

      expect(voiceoverSwitch).not.toBeChecked();
    });

    it("should toggle captions when clicked", async () => {
      const user = userEvent.setup();
      render(<GenerationPanel />);

      const captionsSwitch = screen.getByRole("switch", { name: /Auto Captions/i });
      await user.click(captionsSwitch);

      expect(captionsSwitch).not.toBeChecked();
    });
  });

  describe("Generate Screenplay", () => {
    it("should show error when topic is empty and generate is clicked", async () => {
      const user = userEvent.setup();
      render(<GenerationPanel />);

      // Button should be disabled, but let's test the validation
      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "   "); // Only whitespace
      await user.clear(input);

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      expect(button).toBeDisabled();
    });

    it("should call generateVideo API when form is submitted", async () => {
      const user = userEvent.setup();
      vi.mocked(generateVideo).mockResolvedValueOnce({
        success: true,
        projectId: "proj-123",
        screenplay: {
          title: "Test Video",
          format: "reel",
          totalDuration: 30,
          scenes: [],
        },
        status: "screenplay_generated",
        message: "Success",
      });

      render(<GenerationPanel onScreenplayGenerated={mockOnScreenplayGenerated} />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "AI productivity tips");

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      await user.click(button);

      await waitFor(() => {
        expect(generateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            topic: "AI productivity tips",
            format: "reel",
            targetDuration: 30,
            enableVoiceover: true,
            enableCaptions: true,
            userId: "user-123",
          }),
        );
      });
    });

    it("should call onScreenplayGenerated callback on success", async () => {
      const user = userEvent.setup();
      const mockScreenplay = {
        title: "Test Video",
        format: "reel" as const,
        totalDuration: 30,
        scenes: [
          {
            sceneNumber: 1,
            duration: 30,
            visualDescription: "Test",
            narration: "Test",
          },
        ],
      };

      vi.mocked(generateVideo).mockResolvedValueOnce({
        success: true,
        projectId: "proj-123",
        screenplay: mockScreenplay,
        status: "screenplay_generated",
        message: "Success",
      });

      render(<GenerationPanel onScreenplayGenerated={mockOnScreenplayGenerated} />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "Test topic");

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockOnScreenplayGenerated).toHaveBeenCalledWith(mockScreenplay, "proj-123");
      });
    });

    it("should show loading state while generating", async () => {
      const user = userEvent.setup();
      vi.mocked(generateVideo).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      render(<GenerationPanel />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "Test topic");

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      await user.click(button);

      expect(screen.getByText(/Generating Screenplay/)).toBeInTheDocument();
    });

    it("should show error toast on API failure", async () => {
      const user = userEvent.setup();
      vi.mocked(generateVideo).mockRejectedValueOnce(new Error("API Error"));

      render(<GenerationPanel />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "Test topic");

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to generate video: API Error");
      });
    });

    it("should require user to be logged in", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any);

      render(<GenerationPanel />);

      const input = screen.getByPlaceholderText(/What should your video be about/);
      await user.type(input, "Test topic");

      const button = screen.getByRole("button", { name: /Generate Screenplay/i });
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Please log in to generate videos");
      });
    });
  });

  describe("Selected Background Video", () => {
    it("should display selected video when provided", () => {
      // const selectedVideo = {
      //   id: 123,
      //   url: "https://example.com/video.mp4",
      //   image: "https://example.com/thumb.jpg",
      //   user: "TestUser",
      //   duration: 30,
      //   width: 1920,
      //   height: 1080,
      //   videoFiles: [{ link: "https://example.com/video.mp4" }],
      // };

      expect(screen.getByText("Selected Background")).toBeInTheDocument();
      expect(screen.getByText("By TestUser")).toBeInTheDocument();
      expect(screen.getByText("30s • 1920x1080")).toBeInTheDocument();
    });

    it("should not display selected video section when not provided", () => {
      render(<GenerationPanel />);

      expect(screen.queryByText("Selected Background")).not.toBeInTheDocument();
    });
  });

  describe("Existing Project", () => {
    it("should load project data when existingProject is provided", async () => {
      const existingProject = {
        id: "proj-123",
        name: "Existing Project",
        description: null,
        model: "gpt-4",
        content_type: "short" as const,
        target_duration: 60,
        voiceover_enabled: false,
        captions_enabled: true,
        user_id: "user-123",
        status: "draft" as const,
        thumbnail_url: null,
        video_url: null,
        script: null,
        created_at: "2026-02-16T00:00:00Z",
        updated_at: "2026-02-16T00:00:00Z",
      };

      vi.mocked(storageService.getProjectFiles).mockResolvedValueOnce([]);

      render(<GenerationPanel existingProject={existingProject} />);

      await waitFor(() => {
        expect(storageService.getProjectFiles).toHaveBeenCalledWith("proj-123");
      });
    });
  });

  describe("Step Numbers", () => {
    it("should display numbered steps", () => {
      render(<GenerationPanel />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });
});
