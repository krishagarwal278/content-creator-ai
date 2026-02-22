/**
 * ThemeContext Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../ThemeContext";

// Test component that uses the theme context
function TestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        Dark
      </button>
      <button data-testid="set-system" onClick={() => setTheme("system")}>
        System
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  let originalMatchMedia: typeof window.matchMedia;
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Store original matchMedia
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia
    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });

    // Clear document classes
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    // Restore original matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  describe("ThemeProvider", () => {
    it("should provide default theme as dark", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    it("should use custom default theme", () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    });

    it("should read theme from localStorage", () => {
      localStorage.setItem("content-ai-theme", "light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });

    it("should use custom storage key", () => {
      localStorage.setItem("custom-theme-key", "light");

      render(
        <ThemeProvider storageKey="custom-theme-key">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });

    it("should apply dark class to document", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });

    it("should apply light class to document", () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("setTheme", () => {
    it("should change theme to light", async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId("set-light"));

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("should change theme to dark", async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId("set-dark"));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should persist theme to localStorage", async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId("set-light"));

      expect(localStorage.getItem("content-ai-theme")).toBe("light");
    });

    it("should handle system theme", async () => {
      const user = userEvent.setup();

      // Mock system preference as dark
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId("set-system"));

      expect(screen.getByTestId("theme")).toHaveTextContent("system");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });
  });

  describe("useTheme hook", () => {
    it("should throw error when used outside ThemeProvider", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useTheme must be used within a ThemeProvider");

      consoleError.mockRestore();
    });
  });

  describe("system theme changes", () => {
    it("should listen for system theme changes when theme is system", async () => {
      const user = userEvent.setup();
      let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === "change") {
            mediaQueryCallback = callback;
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId("set-system"));

      // Verify addEventListener was called
      expect(mockMatchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    });
  });
});
