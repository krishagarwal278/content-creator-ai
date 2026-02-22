/**
 * ContentTypeSelector Component Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentTypeSelector } from "../content-type-selector";

describe("ContentTypeSelector", () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all content type options", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      expect(screen.getByText("Reel")).toBeInTheDocument();
      expect(screen.getByText("Short Video")).toBeInTheDocument();
      expect(screen.getByText("VFX Movie")).toBeInTheDocument();
      expect(screen.getByText("Presentation")).toBeInTheDocument();
    });

    it("should display descriptions for each type", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      expect(screen.getByText("Vertical short-form")).toBeInTheDocument();
      expect(screen.getByText("Quick explainer")).toBeInTheDocument();
      expect(screen.getByText("Cinematic content")).toBeInTheDocument();
      expect(screen.getByText("Slide narration")).toBeInTheDocument();
    });

    it("should display duration for each type", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      expect(screen.getByText("15-60s")).toBeInTheDocument();
      expect(screen.getByText("1-3min")).toBeInTheDocument();
      expect(screen.getByText("5-15min")).toBeInTheDocument();
      expect(screen.getByText("Custom")).toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("should highlight selected option", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      // Find the Reel button and check for selected styling
      const reelButton = screen.getByText("Reel").closest("button");
      expect(reelButton).toHaveClass("glass-strong");
    });

    it("should call onValueChange when clicking an available option", async () => {
      const user = userEvent.setup();

      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const shortVideoButton = screen.getByText("Short Video").closest("button");
      await user.click(shortVideoButton!);

      expect(mockOnValueChange).toHaveBeenCalledWith("short");
    });

    it("should update selection when value prop changes", () => {
      const { rerender } = render(
        <ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />,
      );

      // Initially reel is selected
      let reelButton = screen.getByText("Reel").closest("button");
      expect(reelButton).toHaveClass("glass-strong");

      // Change to short
      rerender(<ContentTypeSelector value="short" onValueChange={mockOnValueChange} />);

      const shortButton = screen.getByText("Short Video").closest("button");
      expect(shortButton).toHaveClass("glass-strong");

      // Reel should no longer be selected
      reelButton = screen.getByText("Reel").closest("button");
      expect(reelButton).not.toHaveClass("glass-strong");
    });
  });

  describe("Coming Soon items", () => {
    it("should show 'Soon' badge for VFX Movie", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const vfxSection = screen.getByText("VFX Movie").closest("button");
      expect(vfxSection).toContainElement(screen.getAllByText("Soon")[0]);
    });

    it("should show 'Soon' badge for Presentation", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const presentationSection = screen.getByText("Presentation").closest("button");
      expect(presentationSection).toContainElement(screen.getAllByText("Soon")[1]);
    });

    it("should disable VFX Movie option", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const vfxButton = screen.getByText("VFX Movie").closest("button");
      expect(vfxButton).toBeDisabled();
    });

    it("should disable Presentation option", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const presentationButton = screen.getByText("Presentation").closest("button");
      expect(presentationButton).toBeDisabled();
    });

    it("should not call onValueChange when clicking disabled option", async () => {
      const user = userEvent.setup();

      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const vfxButton = screen.getByText("VFX Movie").closest("button");
      await user.click(vfxButton!);

      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it("should apply reduced opacity to disabled options", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const vfxButton = screen.getByText("VFX Movie").closest("button");
      expect(vfxButton).toHaveClass("opacity-50");
    });

    it("should apply cursor-not-allowed to disabled options", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const vfxButton = screen.getByText("VFX Movie").closest("button");
      expect(vfxButton).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Available items", () => {
    it("should enable Reel option", () => {
      render(<ContentTypeSelector value="short" onValueChange={mockOnValueChange} />);

      const reelButton = screen.getByText("Reel").closest("button");
      expect(reelButton).not.toBeDisabled();
    });

    it("should enable Short Video option", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const shortButton = screen.getByText("Short Video").closest("button");
      expect(shortButton).not.toBeDisabled();
    });

    it("should not show Soon badge for available options", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const reelSection = screen.getByText("Reel").closest("button");
      const shortSection = screen.getByText("Short Video").closest("button");

      // Get all Soon badges
      const soonBadges = screen.getAllByText("Soon");

      // Neither Reel nor Short Video should contain a Soon badge
      soonBadges.forEach((badge) => {
        expect(reelSection).not.toContainElement(badge);
        expect(shortSection).not.toContainElement(badge);
      });
    });
  });

  describe("Visual indicators", () => {
    it("should show pulse indicator on selected available option", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const pulseIndicator = document.querySelector(".animate-pulse.bg-primary");
      expect(pulseIndicator).toBeInTheDocument();
    });

    it("should not show pulse indicator on disabled options even if selected", () => {
      // This tests the edge case where somehow a disabled option is set as value
      render(<ContentTypeSelector value="vfx_movie" onValueChange={mockOnValueChange} />);

      const vfxButton = screen.getByText("VFX Movie").closest("button");
      const pulseIndicator = vfxButton?.querySelector(".animate-pulse");
      expect(pulseIndicator).not.toBeInTheDocument();
    });
  });

  describe("Grid layout", () => {
    it("should render in a 2-column grid", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const grid = document.querySelector(".grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("should have proper spacing between items", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const grid = document.querySelector(".gap-3");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render icons for each content type", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      // Each option should have an icon container
      const iconContainers = document.querySelectorAll(".rounded-lg.p-2");
      expect(iconContainers.length).toBe(4);
    });

    it("should highlight icon for selected option", () => {
      render(<ContentTypeSelector value="reel" onValueChange={mockOnValueChange} />);

      const reelButton = screen.getByText("Reel").closest("button");
      const iconContainer = reelButton?.querySelector(".bg-primary\\/20");
      expect(iconContainer).toBeInTheDocument();
    });
  });
});
