/**
 * Vitest Test Setup
 * Global test configuration and mocks (inspired by OpenShift Console)
 */
import { expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Reset fetch mock before each test
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

// ============================================================================
// Browser API Mocks
// ============================================================================

// Mock window.matchMedia (required for responsive components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (required for many UI components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
}));

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
}));

// Mock scrollTo
window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
});

// ============================================================================
// Storage Mocks
// ============================================================================

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

Object.defineProperty(window, "localStorage", { value: createStorageMock() });
Object.defineProperty(window, "sessionStorage", { value: createStorageMock() });

// ============================================================================
// Navigation Mocks
// ============================================================================

// Mock window.location
const locationMock = {
  href: "http://localhost:3000",
  origin: "http://localhost:3000",
  pathname: "/",
  search: "",
  hash: "",
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, "location", {
  value: locationMock,
  writable: true,
});

// Mock URL.createObjectURL / revokeObjectURL
URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/test-blob");
URL.revokeObjectURL = vi.fn();

// ============================================================================
// Console Suppression (optional - uncomment to suppress console during tests)
// ============================================================================

// Suppress console.error for expected React errors during tests
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args: unknown[]) => {
//     if (
//       typeof args[0] === 'string' &&
//       (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
//        args[0].includes('act(...)'))
//     ) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });

// ============================================================================
// Environment Variables
// ============================================================================

// Set test environment variables
vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-anon-key");
vi.stubEnv("VITE_BACKEND_URL", "http://localhost:4000");
