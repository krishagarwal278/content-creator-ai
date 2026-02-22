/**
 * ChatMessage Component Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage, TypingIndicator, type ChatMessageData } from "../chat-message";

describe("ChatMessage", () => {
  const createMessage = (overrides: Partial<ChatMessageData> = {}): ChatMessageData => ({
    id: "msg-123",
    role: "user",
    content: "Test message content",
    timestamp: new Date("2026-02-16T10:30:00"),
    ...overrides,
  });

  describe("User messages", () => {
    it("should render user message content", () => {
      const message = createMessage({ role: "user", content: "Hello, AI!" });

      render(<ChatMessage message={message} />);

      expect(screen.getByText("Hello, AI!")).toBeInTheDocument();
    });

    it("should display user icon for user messages", () => {
      const message = createMessage({ role: "user" });

      render(<ChatMessage message={message} />);

      // User messages should have the User icon (we check for the container class)
      const iconContainer = document.querySelector(".bg-primary\\/20");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should align user messages to the right", () => {
      const message = createMessage({ role: "user" });

      render(<ChatMessage message={message} />);

      const messageContainer = document.querySelector(".flex-row-reverse");
      expect(messageContainer).toBeInTheDocument();
    });

    it("should apply primary background to user messages", () => {
      const message = createMessage({ role: "user" });

      render(<ChatMessage message={message} />);

      const messageBox = document.querySelector(".bg-primary");
      expect(messageBox).toBeInTheDocument();
    });

    it("should display timestamp", () => {
      const message = createMessage({
        timestamp: new Date("2026-02-16T14:30:00"),
      });

      render(<ChatMessage message={message} />);

      // The timestamp format is HH:MM (2-digit hour and minute)
      expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
    });
  });

  describe("Assistant messages", () => {
    it("should render assistant message content", () => {
      const message = createMessage({
        role: "assistant",
        content: "I can help you with that!",
      });

      render(<ChatMessage message={message} />);

      expect(screen.getByText("I can help you with that!")).toBeInTheDocument();
    });

    it("should display bot icon for assistant messages", () => {
      const message = createMessage({ role: "assistant" });

      render(<ChatMessage message={message} />);

      // Assistant messages have gradient background for icon
      const iconContainer = document.querySelector(".bg-gradient-to-br");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should align assistant messages to the left", () => {
      const message = createMessage({ role: "assistant" });

      render(<ChatMessage message={message} />);

      const messageContainer = document.querySelector(".flex-row:not(.flex-row-reverse)");
      expect(messageContainer).toBeInTheDocument();
    });

    it("should apply glass style to assistant messages", () => {
      const message = createMessage({ role: "assistant" });

      render(<ChatMessage message={message} />);

      const messageBox = document.querySelector(".glass");
      expect(messageBox).toBeInTheDocument();
    });
  });

  describe("System messages", () => {
    it("should render system message with centered layout", () => {
      const message = createMessage({
        role: "system",
        content: "Session started",
      });

      render(<ChatMessage message={message} />);

      expect(screen.getByText("Session started")).toBeInTheDocument();
      const centeredContainer = document.querySelector(".justify-center");
      expect(centeredContainer).toBeInTheDocument();
    });

    it("should display sparkles icon for system messages", () => {
      const message = createMessage({ role: "system" });

      render(<ChatMessage message={message} />);

      // System messages have muted background pill style
      const systemPill = document.querySelector(".bg-muted\\/50");
      expect(systemPill).toBeInTheDocument();
    });
  });

  describe("Message content", () => {
    it("should preserve whitespace in message content", () => {
      const message = createMessage({
        content: "Line 1\nLine 2\nLine 3",
      });

      render(<ChatMessage message={message} />);

      const contentElement = document.querySelector(".whitespace-pre-wrap");
      expect(contentElement).toBeInTheDocument();
    });

    it("should render children after message content", () => {
      const message = createMessage({ role: "assistant" });

      render(
        <ChatMessage message={message}>
          <div data-testid="child-content">Additional content</div>
        </ChatMessage>,
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Additional content")).toBeInTheDocument();
    });
  });
});

describe("TypingIndicator", () => {
  it("should render typing indicator", () => {
    render(<TypingIndicator />);

    // Should have three bouncing dots
    const dots = document.querySelectorAll(".animate-bounce");
    expect(dots).toHaveLength(3);
  });

  it("should display bot icon", () => {
    render(<TypingIndicator />);

    // Should have the gradient background for bot icon
    const iconContainer = document.querySelector(".bg-gradient-to-br");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should have glass styling", () => {
    render(<TypingIndicator />);

    const container = document.querySelector(".glass");
    expect(container).toBeInTheDocument();
  });

  it("should have staggered animation delays", () => {
    render(<TypingIndicator />);

    const dots = document.querySelectorAll(".animate-bounce");

    // Check for animation delay classes
    expect(dots[0]).toHaveClass("[animation-delay:-0.3s]");
    expect(dots[1]).toHaveClass("[animation-delay:-0.15s]");
    // Third dot has no delay class (default)
  });
});
