/**
 * ProjectContext Tests (session / last-project persistence for PR #7)
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectProvider, useProjectContext } from "../ProjectContext";

const LAST_PROJECT_ID_KEY = "videaa_last_project_id";

function TestConsumer() {
  const { selectedProject, setSelectedProject, lastProjectId, setLastProjectId, createNewProject } =
    useProjectContext();
  return (
    <div>
      <span data-testid="last-project-id">{lastProjectId ?? "null"}</span>
      <span data-testid="selected-project-id">{selectedProject?.id ?? "null"}</span>
      <button data-testid="set-last" onClick={() => setLastProjectId("proj-abc")}>
        Set last
      </button>
      <button
        data-testid="set-project"
        onClick={() =>
          setSelectedProject({
            id: "proj-xyz",
            name: "Test",
            user_id: "u1",
            status: "draft",
            content_type: "reel",
            target_duration: 30,
            model: "gpt-4o",
            voiceover_enabled: true,
            captions_enabled: true,
            thumbnail_url: null,
            video_url: null,
            script: null,
            description: null,
            created_at: "",
            updated_at: "",
          })
        }
      >
        Set project
      </button>
      <button data-testid="create-new" onClick={createNewProject}>
        New project
      </button>
    </div>
  );
}

describe("ProjectContext", () => {
  beforeEach(() => {
    localStorage.removeItem(LAST_PROJECT_ID_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(LAST_PROJECT_ID_KEY);
  });

  describe("lastProjectId persistence", () => {
    it("should initialize lastProjectId from localStorage", () => {
      localStorage.setItem(LAST_PROJECT_ID_KEY, "stored-proj-id");
      render(
        <ProjectProvider>
          <TestConsumer />
        </ProjectProvider>,
      );
      expect(screen.getByTestId("last-project-id")).toHaveTextContent("stored-proj-id");
    });

    it("should initialize lastProjectId as null when localStorage is empty", () => {
      render(
        <ProjectProvider>
          <TestConsumer />
        </ProjectProvider>,
      );
      expect(screen.getByTestId("last-project-id")).toHaveTextContent("null");
    });

    it("should update lastProjectId and localStorage when setLastProjectId is called", async () => {
      const user = userEvent.setup();
      render(
        <ProjectProvider>
          <TestConsumer />
        </ProjectProvider>,
      );
      await user.click(screen.getByTestId("set-last"));
      expect(screen.getByTestId("last-project-id")).toHaveTextContent("proj-abc");
      expect(localStorage.getItem(LAST_PROJECT_ID_KEY)).toBe("proj-abc");
    });
  });

  describe("selectedProject sync to lastProjectId", () => {
    it("should update lastProjectId when selectedProject is set with an id", async () => {
      const user = userEvent.setup();
      render(
        <ProjectProvider>
          <TestConsumer />
        </ProjectProvider>,
      );
      await user.click(screen.getByTestId("set-project"));
      expect(screen.getByTestId("selected-project-id")).toHaveTextContent("proj-xyz");
      expect(screen.getByTestId("last-project-id")).toHaveTextContent("proj-xyz");
      expect(localStorage.getItem(LAST_PROJECT_ID_KEY)).toBe("proj-xyz");
    });
  });

  describe("createNewProject", () => {
    it("should clear selectedProject, lastProjectId and localStorage", async () => {
      const user = userEvent.setup();
      localStorage.setItem(LAST_PROJECT_ID_KEY, "proj-old");
      render(
        <ProjectProvider>
          <TestConsumer />
        </ProjectProvider>,
      );
      await user.click(screen.getByTestId("set-project"));
      expect(screen.getByTestId("last-project-id")).toHaveTextContent("proj-xyz");
      await user.click(screen.getByTestId("create-new"));
      expect(screen.getByTestId("selected-project-id")).toHaveTextContent("null");
      expect(screen.getByTestId("last-project-id")).toHaveTextContent("null");
      expect(localStorage.getItem(LAST_PROJECT_ID_KEY)).toBeNull();
    });
  });

  describe("useProjectContext", () => {
    it("should throw when used outside ProjectProvider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useProjectContext must be used within a ProjectProvider");
      consoleSpy.mockRestore();
    });
  });
});
