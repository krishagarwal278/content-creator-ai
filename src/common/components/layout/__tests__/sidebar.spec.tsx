/**
 * Sidebar Tests (session / last-project for PR #7)
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../sidebar";
import { ProjectProvider } from "@/common/contexts/ProjectContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});
vi.mock("@/common/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", email: "test@example.com" },
    signOut: vi.fn(),
  })),
}));
vi.mock("@/api/account-service", () => ({
  accountService: { getAccountInfo: vi.fn().mockResolvedValue({ planName: "Free Plan" }) },
  DEFAULT_ACCOUNT_INFO: { planName: "Free Plan", isBetaUser: false },
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dashboard link uses last project", () => {
    it("should link Dashboard to /project/:lastProjectId when lastProjectId is set", () => {
      localStorage.setItem("videaa_last_project_id", "proj-abc");
      render(
        <MemoryRouter>
          <ProjectProvider>
            <Sidebar />
          </ProjectProvider>
        </MemoryRouter>,
      );
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/project/proj-abc");
      localStorage.removeItem("videaa_last_project_id");
    });

    it("should link Dashboard to /dashboard when lastProjectId is not set", () => {
      render(
        <MemoryRouter>
          <ProjectProvider>
            <Sidebar />
          </ProjectProvider>
        </MemoryRouter>,
      );
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });
  });

  describe("New Project", () => {
    it("should have New Project button that navigates to /dashboard", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ProjectProvider>
            <Sidebar />
          </ProjectProvider>
        </MemoryRouter>,
      );
      const newProjectBtn = screen.getByRole("button", { name: /New Project/i });
      await user.click(newProjectBtn);

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Navigation items", () => {
    it("should render Dashboard, Projects, History, Settings", () => {
      render(
        <MemoryRouter>
          <ProjectProvider>
            <Sidebar />
          </ProjectProvider>
        </MemoryRouter>,
      );
      expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Projects/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /History/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Settings/i })).toBeInTheDocument();
    });
  });
});
