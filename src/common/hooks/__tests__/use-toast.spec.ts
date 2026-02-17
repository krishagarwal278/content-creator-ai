/**
 * useToast Hook Tests
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast, toast, reducer } from "../use-toast";

describe("use-toast", () => {
  beforeEach(() => {
    // Reset the toast state between tests by dismissing all toasts
    vi.useFakeTimers();
  });

  describe("reducer", () => {
    const initialState = { toasts: [] };

    it("should add a toast with ADD_TOAST action", () => {
      const newToast = {
        id: "1",
        title: "Test Toast",
        description: "This is a test",
        open: true,
      };

      const result = reducer(initialState, {
        type: "ADD_TOAST",
        toast: newToast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0]).toEqual(newToast);
    });

    it("should limit toasts to TOAST_LIMIT (1)", () => {
      const toast1 = { id: "1", title: "Toast 1", open: true };
      const toast2 = { id: "2", title: "Toast 2", open: true };

      let state = reducer(initialState, { type: "ADD_TOAST", toast: toast1 });
      state = reducer(state, { type: "ADD_TOAST", toast: toast2 });

      // Only the most recent toast should be kept
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe("2");
    });

    it("should update a toast with UPDATE_TOAST action", () => {
      const initialToast = { id: "1", title: "Original", open: true };
      const stateWithToast = { toasts: [initialToast] };

      const result = reducer(stateWithToast, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });

      expect(result.toasts[0].title).toBe("Updated");
      expect(result.toasts[0].open).toBe(true);
    });

    it("should dismiss a toast with DISMISS_TOAST action", () => {
      const activeToast = { id: "1", title: "Test", open: true };
      const stateWithToast = { toasts: [activeToast] };

      const result = reducer(stateWithToast, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(result.toasts[0].open).toBe(false);
    });

    it("should dismiss all toasts when toastId is undefined", () => {
      const toast1 = { id: "1", title: "Toast 1", open: true };
      const stateWithToast = { toasts: [toast1] };

      const result = reducer(stateWithToast, {
        type: "DISMISS_TOAST",
        toastId: undefined,
      });

      expect(result.toasts[0].open).toBe(false);
    });

    it("should remove a specific toast with REMOVE_TOAST action", () => {
      const toast1 = { id: "1", title: "Toast 1", open: true };
      const stateWithToast = { toasts: [toast1] };

      const result = reducer(stateWithToast, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(result.toasts).toHaveLength(0);
    });

    it("should remove all toasts when REMOVE_TOAST has no toastId", () => {
      const toast1 = { id: "1", title: "Toast 1", open: true };
      const stateWithToast = { toasts: [toast1] };

      const result = reducer(stateWithToast, {
        type: "REMOVE_TOAST",
        toastId: undefined,
      });

      expect(result.toasts).toHaveLength(0);
    });
  });

  describe("toast function", () => {
    it("should create a toast and return an object with id, dismiss, and update", () => {
      const result = toast({ title: "Test Toast" });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("dismiss");
      expect(result).toHaveProperty("update");
      expect(typeof result.dismiss).toBe("function");
      expect(typeof result.update).toBe("function");
    });

    it("should generate unique IDs for each toast", () => {
      const toast1 = toast({ title: "Toast 1" });
      const toast2 = toast({ title: "Toast 2" });

      expect(toast1.id).not.toBe(toast2.id);
    });
  });

  describe("useToast hook", () => {
    it("should return toasts array and helper functions", () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty("toasts");
      expect(result.current).toHaveProperty("toast");
      expect(result.current).toHaveProperty("dismiss");
      expect(Array.isArray(result.current.toasts)).toBe(true);
    });

    it("should reflect toast state changes", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "New Toast" });
      });

      expect(result.current.toasts.length).toBeGreaterThan(0);
      expect(result.current.toasts[0].title).toBe("New Toast");
    });

    it("should dismiss a toast by id", () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;

      act(() => {
        const newToast = result.current.toast({ title: "To Be Dismissed" });
        toastId = newToast.id;
      });

      expect(result.current.toasts[0].open).toBe(true);

      act(() => {
        result.current.dismiss(toastId);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it("should update a toast", () => {
      const { result } = renderHook(() => useToast());

      let updateFn: (props: { title?: string }) => void;

      act(() => {
        const newToast = result.current.toast({ title: "Original Title" });
        updateFn = newToast.update;
      });

      expect(result.current.toasts[0].title).toBe("Original Title");

      act(() => {
        updateFn({ title: "Updated Title" });
      });

      expect(result.current.toasts[0].title).toBe("Updated Title");
    });
  });
});
