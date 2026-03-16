/**
 * DashboardPage Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useParams, useNavigate } from "react-router-dom";
import DashboardPage from "../DashboardPage";
import { ProjectProvider } from "@/common/contexts/ProjectContext";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});
vi.mock("@/common/hooks/useProjects", () => ({
  useProject: vi.fn(() => ({ data: null })),
}));
vi.mock("@/common/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({ user: { id: "user-1" } })),
}));
vi.mock("@/api/video-generation-service", () => ({
  videoGenerationService: {
    getProjectScreenplays: vi.fn().mockResolvedValue([]),
  },
}));

const mockNavigate = vi.fn();

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  describe("session restore (redirect to last project)", () => {
    it("should redirect to /project/:lastProjectId when id is undefined and lastProjectId is set", async () => {
      vi.mocked(useParams).mockReturnValue({ id: undefined });
      localStorage.setItem("videaa_last_project_id", "proj-456");

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <ProjectProvider>
            <DashboardPage />
          </ProjectProvider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/project/proj-456", {
          replace: true,
        });
      });

      localStorage.removeItem("videaa_last_project_id");
    });

    it("should not redirect when id is defined (viewing a project)", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "proj-123" });

      render(
        <MemoryRouter initialEntries={["/project/proj-123"]}>
          <ProjectProvider>
            <DashboardPage />
          </ProjectProvider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Screenplay Studio/ })).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("rendering", () => {
    it("should render header and generation panel when project id is provided", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "proj-123" });

      render(
        <MemoryRouter initialEntries={["/project/proj-123"]}>
          <ProjectProvider>
            <DashboardPage />
          </ProjectProvider>
        </MemoryRouter>,
      );

      expect(screen.getByText("Screenplay Studio")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/What should this module cover/)).toBeInTheDocument();
    });
  });
});
