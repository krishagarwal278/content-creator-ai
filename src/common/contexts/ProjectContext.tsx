import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { type Project } from "@/common/hooks/useProjects";
import { type PexelsVideo } from "@/common/hooks/usePexelsVideos";

const LAST_PROJECT_ID_KEY = "videaa_last_project_id";

function getStoredLastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_PROJECT_ID_KEY);
  } catch {
    return null;
  }
}

function setStoredLastProjectId(projectId: string | null) {
  try {
    if (projectId) {
      localStorage.setItem(LAST_PROJECT_ID_KEY, projectId);
    } else {
      localStorage.removeItem(LAST_PROJECT_ID_KEY);
    }
  } catch {
    // ignore
  }
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  selectedVideo: PexelsVideo | null;
  setSelectedVideo: (video: PexelsVideo | null) => void;
  /** Last opened project id (persisted). Use for "Dashboard" link and restoring session. */
  lastProjectId: string | null;
  setLastProjectId: (id: string | null) => void;
  createNewProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PexelsVideo | null>(null);
  const [lastProjectId, setLastProjectIdState] = useState<string | null>(getStoredLastProjectId);

  const setLastProjectId = useCallback((id: string | null) => {
    setLastProjectIdState(id);
    setStoredLastProjectId(id);
  }, []);

  // When user selects a project (or lands on a project), persist its id so we can restore session
  useEffect(() => {
    const id = selectedProject?.id ?? null;
    if (id) {
      setLastProjectIdState(id);
      setStoredLastProjectId(id);
    }
  }, [selectedProject?.id]);

  const createNewProject = useCallback(() => {
    setSelectedProject(null);
    setSelectedVideo(null);
    setLastProjectIdState(null);
    setStoredLastProjectId(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        selectedVideo,
        setSelectedVideo,
        lastProjectId,
        setLastProjectId,
        createNewProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}
