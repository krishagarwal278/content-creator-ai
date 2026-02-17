/**
 * ProtectedRoute Component Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";

// Mock useAuth hook
const mockUseAuth = vi.fn();

vi.mock("@/common/contexts", () => ({
  useAuth: () => mockUseAuth(),
}));

// Helper to render with router context
const renderWithRouter = (initialRoute = "/protected") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
          <Route
            path="/another"
            element={
              <>
                <div>First Child</div>
                <div>Second Child</div>
              </>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      user: null,
      loading: true,
    });

    renderWithRouter();

    // Should show loading indicator, not the content
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    // Should show the loading spinner
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render outlet content when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "123", email: "test@example.com" } },
      user: { id: "123", email: "test@example.com" },
      loading: false,
    });

    renderWithRouter("/protected");

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to /auth when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      user: null,
      loading: false,
    });

    renderWithRouter("/protected");

    // Content should not be rendered
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    // Should show auth page (redirected)
    expect(screen.getByText("Auth Page")).toBeInTheDocument();
  });

  it("should render route with multiple elements when authenticated", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "123" } },
      user: { id: "123" },
      loading: false,
    });

    renderWithRouter("/another");

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
  });
});
