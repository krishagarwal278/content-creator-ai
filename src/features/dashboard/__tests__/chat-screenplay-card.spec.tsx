/**
 * ChatScreenplayCard Component Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatScreenplayCard } from "../chat-screenplay-card";
import type { Screenplay } from "@/api";

describe("ChatScreenplayCard", () => {
  const createScreenplay = (overrides: Partial<Screenplay> = {}): Screenplay => ({
    title: "Test Video",
    format: "reel",
    totalDuration: 30,
    scenes: [
      {
        sceneNumber: 1,
        duration: 10,
        visualDescription: "Opening shot of a cityscape",
        narration: "Welcome to the future.",
        textOverlay: "Welcome",
        transition: "fade",
      },
      {
        sceneNumber: 2,
        duration: 10,
        visualDescription: "Person using the app",
        narration: "Create stunning videos.",
        transition: "cut",
      },
      {
        sceneNumber: 3,
        duration: 10,
        visualDescription: "Montage of different video types",
        narration: "From reels to presentations.",
        transition: "fade",
      },
    ],
    voiceoverStyle: "professional",
    musicSuggestion: "upbeat corporate",
    ...overrides,
  });

  describe("Header", () => {
    it("should display screenplay title", () => {
      const screenplay = createScreenplay({ title: "My Amazing Video" });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("My Amazing Video")).toBeInTheDocument();
    });

    it("should display total duration", () => {
      const screenplay = createScreenplay({ totalDuration: 45 });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("45s")).toBeInTheDocument();
    });

    it("should display scene count", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("3 scenes")).toBeInTheDocument();
    });

    it("should show Latest badge when isLatest is true", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={true} />);

      expect(screen.getByText("Latest")).toBeInTheDocument();
    });

    it("should not show Latest badge when isLatest is false", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={false} />);

      expect(screen.queryByText("Latest")).not.toBeInTheDocument();
    });
  });

  describe("Expand/Collapse", () => {
    it("should be expanded by default", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      // Should show scene details when expanded
      expect(screen.getByText("Opening shot of a cityscape")).toBeInTheDocument();
    });

    it("should collapse when header is clicked", async () => {
      const user = userEvent.setup();
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      // Find and click the header
      const header = screen.getByText("Test Video").closest("div[class*='cursor-pointer']");
      await user.click(header!);

      // Scene details should be hidden (the detailed view)
      expect(screen.queryByText("Visual")).not.toBeInTheDocument();
    });

    it("should expand when collapsed header is clicked", async () => {
      const user = userEvent.setup();
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      const header = screen.getByText("Test Video").closest("div[class*='cursor-pointer']");

      // Collapse
      await user.click(header!);
      // Expand
      await user.click(header!);

      // Scene details should be visible again
      expect(screen.getByText(/Opening shot/)).toBeInTheDocument();
    });
  });

  describe("Metadata", () => {
    it("should display voiceover style", () => {
      const screenplay = createScreenplay({ voiceoverStyle: "energetic" });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("energetic")).toBeInTheDocument();
    });

    it("should display music suggestion", () => {
      const screenplay = createScreenplay({ musicSuggestion: "cinematic orchestral" });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("cinematic orchestral")).toBeInTheDocument();
    });

    it("should display format badge", () => {
      const screenplay = createScreenplay({ format: "short_video" });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("short video")).toBeInTheDocument();
    });
  });

  describe("Scenes", () => {
    it("should display first 3 scenes by default", () => {
      const screenplay = createScreenplay({
        scenes: [
          {
            sceneNumber: 1,
            duration: 5,
            visualDescription: "First scene visual",
            narration: "Narration 1",
          },
          {
            sceneNumber: 2,
            duration: 5,
            visualDescription: "Second scene visual",
            narration: "Narration 2",
          },
          {
            sceneNumber: 3,
            duration: 5,
            visualDescription: "Third scene visual",
            narration: "Narration 3",
          },
          {
            sceneNumber: 4,
            duration: 5,
            visualDescription: "Fourth scene visual",
            narration: "Narration 4",
          },
          {
            sceneNumber: 5,
            duration: 5,
            visualDescription: "Fifth scene visual",
            narration: "Narration 5",
          },
        ],
        totalDuration: 25,
      });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText(/First scene visual/)).toBeInTheDocument();
      expect(screen.getByText(/Second scene visual/)).toBeInTheDocument();
      expect(screen.getByText(/Third scene visual/)).toBeInTheDocument();
      expect(screen.queryByText(/Fourth scene visual/)).not.toBeInTheDocument();
    });

    it("should show 'Show more' button when more than 3 scenes", () => {
      const screenplay = createScreenplay({
        scenes: [
          { sceneNumber: 1, duration: 5, visualDescription: "First visual", narration: "N1" },
          { sceneNumber: 2, duration: 5, visualDescription: "Second visual", narration: "N2" },
          { sceneNumber: 3, duration: 5, visualDescription: "Third visual", narration: "N3" },
          { sceneNumber: 4, duration: 5, visualDescription: "Fourth visual", narration: "N4" },
        ],
        totalDuration: 20,
      });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText(/Show 1 more scene/)).toBeInTheDocument();
    });

    it("should expand to show all scenes when 'Show more' is clicked", async () => {
      const user = userEvent.setup();
      const screenplay = createScreenplay({
        scenes: [
          { sceneNumber: 1, duration: 5, visualDescription: "First visual", narration: "N1" },
          { sceneNumber: 2, duration: 5, visualDescription: "Second visual", narration: "N2" },
          { sceneNumber: 3, duration: 5, visualDescription: "Third visual", narration: "N3" },
          { sceneNumber: 4, duration: 5, visualDescription: "Fourth visual", narration: "N4" },
        ],
        totalDuration: 20,
      });

      render(<ChatScreenplayCard screenplay={screenplay} />);

      await user.click(screen.getByText(/Show 1 more scene/));

      expect(screen.getByText(/Fourth visual/)).toBeInTheDocument();
      expect(screen.getByText(/Show less/)).toBeInTheDocument();
    });

    it("should display scene duration", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      // Each scene shows its duration
      expect(screen.getAllByText("10s")).toHaveLength(3);
    });

    it("should display scene narration", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText(/"Welcome to the future."/)).toBeInTheDocument();
    });

    it("should display text overlay when present", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getByText("Welcome")).toBeInTheDocument();
    });

    it("should display transition when present", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      expect(screen.getAllByText("fade")).toHaveLength(2);
      expect(screen.getByText("cut")).toBeInTheDocument();
    });
  });

  describe("Timeline", () => {
    it("should render timeline segments for each scene", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} />);

      // Timeline container
      const timeline = document.querySelector(".flex.h-1\\.5.gap-0\\.5");
      expect(timeline).toBeInTheDocument();

      // Should have 3 segments
      const segments = timeline?.querySelectorAll("div");
      expect(segments).toHaveLength(3);
    });
  });

  describe("Accept button", () => {
    it("should show accept button when isLatest and onAccept provided", () => {
      const screenplay = createScreenplay();
      const onAccept = vi.fn();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={true} onAccept={onAccept} />);

      expect(screen.getByText("Use This Screenplay")).toBeInTheDocument();
    });

    it("should not show accept button when not latest", () => {
      const screenplay = createScreenplay();
      const onAccept = vi.fn();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={false} onAccept={onAccept} />);

      expect(screen.queryByText("Use This Screenplay")).not.toBeInTheDocument();
    });

    it("should not show accept button when onAccept not provided", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={true} />);

      expect(screen.queryByText("Use This Screenplay")).not.toBeInTheDocument();
    });

    it("should call onAccept when accept button is clicked", async () => {
      const user = userEvent.setup();
      const screenplay = createScreenplay();
      const onAccept = vi.fn();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={true} onAccept={onAccept} />);

      await user.click(screen.getByText("Use This Screenplay"));

      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it("should not collapse card when accept button is clicked", async () => {
      const user = userEvent.setup();
      const screenplay = createScreenplay();
      const onAccept = vi.fn();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={true} onAccept={onAccept} />);

      await user.click(screen.getByText("Use This Screenplay"));

      // Card should still be expanded
      expect(screen.getByText(/Opening shot/)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have primary border when isLatest", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={true} />);

      const card = document.querySelector(".border-primary\\/50");
      expect(card).toBeInTheDocument();
    });

    it("should have default border when not latest", () => {
      const screenplay = createScreenplay();

      render(<ChatScreenplayCard screenplay={screenplay} isLatest={false} />);

      const card = document.querySelector(".border-border\\/50");
      expect(card).toBeInTheDocument();
    });
  });
});
