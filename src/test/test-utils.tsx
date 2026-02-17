/**
 * Test Utilities
 * Custom render functions and test helpers (inspired by OpenShift Console)
 *
 * Usage:
 *   import { renderWithProviders, mockUser } from '@/test/test-utils';
 */
import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

// ============================================================================
// Types
// ============================================================================

interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialRoute?: string;
  queryClient?: QueryClient;
}

// ============================================================================
// Mock Factories
// ============================================================================

/**
 * Creates a mock Supabase user
 */
export function mockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: "test-user-id-123",
    email: "test@example.com",
    user_metadata: {
      name: "Test User",
    },
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
  created_at: string;
}

/**
 * Creates a mock Supabase session
 */
export function mockSession(overrides: Partial<MockSession> = {}): MockSession {
  const user = mockUser(overrides.user);
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user,
    ...overrides,
  };
}

interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: MockUser;
}

/**
 * Creates a mock project
 */
export function mockProject(overrides: Partial<MockProject> = {}): MockProject {
  return {
    id: "project-123",
    name: "Test Project",
    description: "A test project",
    status: "draft",
    format: "reel",
    user_id: "test-user-id-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

interface MockProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  format: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a mock screenplay
 */
export function mockScreenplay(overrides: Partial<MockScreenplay> = {}): MockScreenplay {
  return {
    title: "Test Video",
    format: "reel",
    totalDuration: 30,
    scenes: [
      {
        sceneNumber: 1,
        duration: 10,
        visualDescription: "Opening shot of a cityscape",
        narration: "Welcome to the future of content creation.",
        textOverlay: "Content Creator AI",
        transition: "fade",
      },
      {
        sceneNumber: 2,
        duration: 10,
        visualDescription: "Person using the app on their phone",
        narration: "Create stunning videos in minutes.",
        transition: "cut",
      },
      {
        sceneNumber: 3,
        duration: 10,
        visualDescription: "Montage of different video types",
        narration: "From reels to presentations, we've got you covered.",
        transition: "fade",
      },
    ],
    voiceoverStyle: "professional",
    musicSuggestion: "upbeat corporate",
    ...overrides,
  };
}

interface MockScreenplay {
  title: string;
  format: "reel" | "short_video" | "vfx_movie" | "presentation";
  totalDuration: number;
  scenes: Array<{
    sceneNumber: number;
    duration: number;
    visualDescription: string;
    narration: string;
    textOverlay?: string;
    transition?: string;
  }>;
  voiceoverStyle?: string;
  musicSuggestion?: string;
}

// ============================================================================
// Test Query Client
// ============================================================================

/**
 * Creates a new QueryClient configured for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ============================================================================
// Custom Render Functions
// ============================================================================

/**
 * Renders a component with all necessary providers
 * (Router, QueryClient, etc.)
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute = "/",
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  // Set the initial route
  window.history.pushState({}, "Test page", initialRoute);

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Renders a component with router only (no QueryClient)
 */
export function renderWithRouter(
  ui: ReactElement,
  { initialRoute = "/" }: { initialRoute?: string } = {},
) {
  window.history.pushState({}, "Test page", initialRoute);

  function Wrapper({ children }: WrapperProps) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper });
}

// ============================================================================
// Mock Helpers
// ============================================================================

/**
 * Creates a mock fetch response
 */
export function mockFetchResponse<T>(data: T, options: { status?: number; ok?: boolean } = {}) {
  const { status = 200, ok = true } = options;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

/**
 * Creates a mock fetch error
 */
export function mockFetchError(message: string) {
  return vi.fn().mockRejectedValue(new TypeError(message));
}

/**
 * Waits for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  { timeout = 5000, interval = 100 } = {},
): Promise<void> {
  const start = Date.now();

  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// ============================================================================
// Test Data Attributes (for E2E tests)
// ============================================================================

/**
 * Standard data-test attribute selectors (like OpenShift Console)
 */
export const testIds = {
  // Auth
  authForm: "auth-form",
  emailInput: "email-input",
  passwordInput: "password-input",
  signInButton: "sign-in-button",
  signUpButton: "sign-up-button",
  signOutButton: "sign-out-button",

  // Dashboard
  dashboardPage: "dashboard-page",
  generationPanel: "generation-panel",
  previewPanel: "preview-panel",
  projectNameInput: "project-name-input",
  topicInput: "topic-input",
  formatSelector: "format-selector",
  generateButton: "generate-button",

  // Projects
  projectsPage: "projects-page",
  projectCard: "project-card",
  createProjectButton: "create-project-button",
  deleteProjectButton: "delete-project-button",

  // Settings
  settingsPage: "settings-page",

  // Common
  loadingSpinner: "loading-spinner",
  errorMessage: "error-message",
  successMessage: "success-message",
  modal: "modal",
  modalClose: "modal-close",
  confirmButton: "confirm-button",
  cancelButton: "cancel-button",
} as const;

/**
 * Helper to create data-test attribute
 */
export function dataTestId(id: string): { "data-test": string } {
  return { "data-test": id };
}

// ============================================================================
// Re-exports from testing-library
// ============================================================================

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
