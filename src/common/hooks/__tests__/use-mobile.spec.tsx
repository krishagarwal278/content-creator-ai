/**
 * useIsMobile Hook Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile", () => {
  const MOBILE_BREAKPOINT = 768;
  let matchMediaListeners: Array<() => void> = [];

  // Mock matchMedia implementation
  const createMatchMedia = (width: number) => {
    return vi.fn().mockImplementation((query: string) => ({
      matches: width < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, callback: () => void) => {
        matchMediaListeners.push(callback);
      }),
      removeEventListener: vi.fn((_event: string, callback: () => void) => {
        matchMediaListeners = matchMediaListeners.filter((cb) => cb !== callback);
      }),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    matchMediaListeners = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when window width is less than 768px", () => {
    // Set up mobile viewport
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
    window.matchMedia = createMatchMedia(375);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return false when window width is 768px or greater", () => {
    // Set up desktop viewport
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    window.matchMedia = createMatchMedia(1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return false at exactly 768px (breakpoint boundary)", () => {
    Object.defineProperty(window, "innerWidth", { value: 768, writable: true });
    window.matchMedia = createMatchMedia(768);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should update when viewport changes from mobile to desktop", () => {
    // Start with mobile viewport
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
    window.matchMedia = createMatchMedia(375);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    // Change to desktop viewport
    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
      // Trigger the media query change listener
      matchMediaListeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(false);
  });

  it("should clean up event listener on unmount", () => {
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
    const mockMatchMedia = createMatchMedia(375);
    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useIsMobile());

    // Get the mocked addEventListener call
    const addEventListenerCalls = mockMatchMedia.mock.results[0]?.value.addEventListener.mock.calls;
    expect(addEventListenerCalls.length).toBeGreaterThan(0);

    unmount();

    // Verify removeEventListener was called
    const removeEventListenerCalls =
      mockMatchMedia.mock.results[0]?.value.removeEventListener.mock.calls;
    expect(removeEventListenerCalls.length).toBeGreaterThan(0);
  });
});
