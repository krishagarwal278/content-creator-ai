/**
 * ChatPanel Component Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "../chat-panel";
import type { Screenplay } from "@/api/video-generation-service";

// Mock the video generation service (direct module used by chat-panel)
vi.mock("@/api/video-generation-service", () => ({
  videoGenerationService: {
    enhanceScreenplay: vi.fn(),
    generateActualVideo: vi.fn(),
    getVideoStatus: vi.fn(),
    chatIdeate: vi.fn(),
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

describe("ChatPanel", () => {
  const mockOnScreenplayUpdate = vi.fn();

  const createScreenplay = (overrides: Partial<Screenplay> = {}): Screenplay => ({
    title: "Test Video",
    format: "reel",
    totalDuration: 30,
    scenes: [
      {
        sceneNumber: 1,
        duration: 10,
        visualDescription: "Opening shot",
        narration: "Welcome",
      },
      {
        sceneNumber: 2,
        duration: 10,
        visualDescription: "Middle shot",
        narration: "Content",
      },
      {
        sceneNumber: 3,
        duration: 10,
        visualDescription: "Closing shot",
        narration: "Goodbye",
      },
    ],
    voiceoverStyle: "professional",
    musicSuggestion: "upbeat",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("Initial state (no screenplay)", () => {
    it("should show welcome message when no screenplay and no messages", () => {
      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      expect(screen.getByText("Need help with your idea?")).toBeInTheDocument();
    });

    it("should show ideation suggestions when no screenplay", () => {
      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      expect(screen.getByText("Help me brainstorm a reel about productivity")).toBeInTheDocument();
      expect(screen.getByText("What makes a good tech startup intro?")).toBeInTheDocument();
    });

    it("should have disabled Generate Video button when no screenplay", () => {
      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const generateButton = screen.getByRole("button", { name: /Generate Video/i });
      expect(generateButton).toBeDisabled();
    });

    it("should show placeholder text for ideation mode", () => {
      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      expect(input).toBeInTheDocument();
    });
  });

  describe("With screenplay", () => {
    it("should show screenplay card when screenplay exists", () => {
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      expect(screen.getByText("Test Video")).toBeInTheDocument();
    });

    it("should show initial assistant message with screenplay", () => {
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      expect(
        screen.getByText(/I've created a screenplay based on your requirements/),
      ).toBeInTheDocument();
    });

    it("should show Generate Video button with Coming Soon (disabled for MVP)", () => {
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const generateButton = screen.getByRole("button", { name: /Generate Video/i });
      expect(generateButton).toBeDisabled();
      expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });

    it("should show refinement placeholder when screenplay exists", () => {
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for changes/);
      expect(input).toBeInTheDocument();
    });
  });

  describe("User input", () => {
    it("should update input value when typing", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Hello AI");

      expect(input).toHaveValue("Hello AI");
    });

    it("should disable send button when input is empty", () => {
      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const sendButton = screen.getByRole("button", { name: "" }); // Icon button
      expect(sendButton).toBeDisabled();
    });

    it("should enable send button when input has text", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Hello");

      // Find the send button (it's the icon button in the input area)
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons.find(
        (btn) => btn.querySelector("svg") && !btn.textContent?.includes("Generate"),
      );
      expect(sendButton).not.toBeDisabled();
    });

    it("should fill input when suggestion is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const suggestion = screen.getByText("Help me brainstorm a reel about productivity");
      await user.click(suggestion);

      const input = screen.getByPlaceholderText(/Ask for help/);
      expect(input).toHaveValue("Help me brainstorm a reel about productivity");
    });
  });

  describe("Message sending", () => {
    it("should add user message to chat when sent", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should clear input after sending message", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");

      expect(input).toHaveValue("");
    });

    it("should show typing indicator while processing", async () => {
      const user = userEvent.setup();
      const { videoGenerationService } = await import("@/api/video-generation-service");

      vi.mocked(videoGenerationService.chatIdeate).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  message: "Test response",
                } as Awaited<ReturnType<typeof videoGenerationService.chatIdeate>>),
              300,
            ),
          ),
      );

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");

      // Typing indicator (bouncing dots) should appear while chatIdeate is in flight
      await waitFor(
        () => {
          const dots = document.querySelectorAll(".animate-bounce");
          expect(dots.length).toBeGreaterThan(0);
        },
        { timeout: 500 },
      );
    });

    it("should add assistant response after user message in ideation mode", async () => {
      const user = userEvent.setup();
      const { videoGenerationService } = await import("@/api/video-generation-service");

      vi.mocked(videoGenerationService.chatIdeate).mockResolvedValue({
        success: true,
        message: "I'd suggest starting with a strong hook!",
      });

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Help me with video ideas");
      await user.keyboard("{Enter}");

      // Wait for assistant response
      await waitFor(
        () => {
          expect(
            screen.getByText(/I'd suggest|I love that|solid starting point/i),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Refinement suggestions", () => {
    it("should show refinement suggestions when screenplay exists and messages present", async () => {
      const user = userEvent.setup();
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      // Send a message first to trigger refinement suggestions
      const input = screen.getByPlaceholderText(/Ask for changes/);
      await user.type(input, "Test");
      await user.keyboard("{Enter}");

      // Wait for response and then check for refinement suggestions
      await waitFor(() => {
        expect(screen.getByText("Make it more dramatic")).toBeInTheDocument();
      });
    });
  });

  describe("Video generation", () => {
    it("should not show video player initially", () => {
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      expect(document.querySelector("video")).not.toBeInTheDocument();
    });

    it("should show video player when videoUrl is provided", () => {
      const screenplay = createScreenplay();

      render(
        <ChatPanel
          screenplay={screenplay}
          projectId="proj-123"
          onScreenplayUpdate={mockOnScreenplayUpdate}
          initialVideoUrl="https://example.com/video.mp4"
        />,
      );

      expect(document.querySelector("video")).toBeInTheDocument();
    });
  });

  describe("Keyboard shortcuts", () => {
    it("should send message on Enter key", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should not send message on Shift+Enter", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "Test message");
      await user.keyboard("{Shift>}{Enter}{/Shift}");

      // Message should not be sent
      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
      // Input should still have the text
      expect(input).toHaveValue("Test message");
    });
  });

  describe("Empty input handling", () => {
    it("should not send empty message", async () => {
      const user = userEvent.setup();

      render(
        <ChatPanel
          screenplay={null}
          projectId={null}
          onScreenplayUpdate={mockOnScreenplayUpdate}
        />,
      );

      const input = screen.getByPlaceholderText(/Ask for help/);
      await user.type(input, "   "); // Only whitespace
      await user.keyboard("{Enter}");

      // No user message should appear (only whitespace)
      const messages = document.querySelectorAll(".flex.gap-3");
      expect(messages.length).toBe(0);
    });
  });
});
