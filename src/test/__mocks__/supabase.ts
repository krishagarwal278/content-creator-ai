/**
 * Supabase Client Mock
 * Mock implementation for testing (inspired by OpenShift Console's mocking patterns)
 */
import { vi } from "vitest";
import { mockUser, mockSession } from "../test-utils";

// ============================================================================
// Auth Mock
// ============================================================================

const mockAuthState = {
  session: null as ReturnType<typeof mockSession> | null,
  user: null as ReturnType<typeof mockUser> | null,
};

const authListeners: Array<(event: string, session: unknown) => void> = [];

export const mockAuth = {
  getSession: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: { session: mockAuthState.session },
      error: null,
    }),
  ),

  getUser: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: { user: mockAuthState.user },
      error: null,
    }),
  ),

  signInWithPassword: vi.fn().mockImplementation(({ email, password }) => {
    if (email === "test@example.com" && password === "password123") {
      const session = mockSession();
      mockAuthState.session = session;
      mockAuthState.user = session.user;
      authListeners.forEach((listener) => listener("SIGNED_IN", session));
      return Promise.resolve({ data: { session, user: session.user }, error: null });
    }
    return Promise.resolve({
      data: { session: null, user: null },
      error: { message: "Invalid credentials" },
    });
  }),

  signUp: vi.fn().mockImplementation(({ email }) => {
    const user = mockUser({ email });
    return Promise.resolve({
      data: { user, session: null },
      error: null,
    });
  }),

  signOut: vi.fn().mockImplementation(() => {
    mockAuthState.session = null;
    mockAuthState.user = null;
    authListeners.forEach((listener) => listener("SIGNED_OUT", null));
    return Promise.resolve({ error: null });
  }),

  onAuthStateChange: vi.fn().mockImplementation((callback) => {
    authListeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authListeners.indexOf(callback);
            if (index > -1) {
              authListeners.splice(index, 1);
            }
          },
        },
      },
    };
  }),

  // Test helpers
  __setSession: (session: ReturnType<typeof mockSession> | null) => {
    mockAuthState.session = session;
    mockAuthState.user = session?.user ?? null;
  },
  __reset: () => {
    mockAuthState.session = null;
    mockAuthState.user = null;
    authListeners.length = 0;
    mockAuth.getSession.mockClear();
    mockAuth.getUser.mockClear();
    mockAuth.signInWithPassword.mockClear();
    mockAuth.signUp.mockClear();
    mockAuth.signOut.mockClear();
    mockAuth.onAuthStateChange.mockClear();
  },
};

// ============================================================================
// Database Mock (for Supabase queries)
// ============================================================================

type MockQueryResult<T> = {
  data: T | null;
  error: Error | null;
};

function createMockQueryBuilder<T>() {
  let mockData: T[] = [];
  let mockError: Error | null = null;

  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: mockData[0] ?? null,
        error: mockError,
      } as MockQueryResult<T>),
    ),
    maybeSingle: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: mockData[0] ?? null,
        error: mockError,
      } as MockQueryResult<T | null>),
    ),
    then: (resolve: (value: MockQueryResult<T[]>) => void) => {
      resolve({ data: mockData, error: mockError });
      return Promise.resolve({ data: mockData, error: mockError });
    },

    // Test helpers
    __setData: (data: T[]) => {
      mockData = data;
    },
    __setError: (error: Error | null) => {
      mockError = error;
    },
    __reset: () => {
      mockData = [];
      mockError = null;
    },
  };

  return builder;
}

export const mockFrom = vi.fn().mockImplementation(() => createMockQueryBuilder());

// ============================================================================
// Storage Mock
// ============================================================================

export const mockStorage = {
  from: vi.fn().mockImplementation(() => ({
    upload: vi.fn().mockResolvedValue({
      data: { path: "test-file.mp4" },
      error: null,
    }),
    download: vi.fn().mockResolvedValue({
      data: new Blob(["test content"]),
      error: null,
    }),
    remove: vi.fn().mockResolvedValue({
      data: [{ name: "deleted-file.mp4" }],
      error: null,
    }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/test-file.mp4" },
    }),
    list: vi.fn().mockResolvedValue({
      data: [
        { name: "file1.mp4", id: "1" },
        { name: "file2.mp4", id: "2" },
      ],
      error: null,
    }),
  })),
};

// ============================================================================
// Main Supabase Mock
// ============================================================================

export const supabase = {
  auth: mockAuth,
  from: mockFrom,
  storage: mockStorage,
};

/**
 * Reset all mocks
 */
export function resetSupabaseMocks() {
  mockAuth.__reset();
  mockFrom.mockClear();
}

// Default export for vi.mock
export default { supabase, mockAuth, mockFrom, mockStorage, resetSupabaseMocks };
