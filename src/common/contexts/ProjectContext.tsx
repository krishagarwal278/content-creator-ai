import React, { createContext, useContext, useState, type ReactNode } from "react";
import { type Project } from "@/common/hooks/useProjects";
import { type PexelsVideo } from "@/common/hooks/usePexelsVideos";

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  selectedVideo: PexelsVideo | null;
  setSelectedVideo: (video: PexelsVideo | null) => void;
  createNewProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PexelsVideo | null>(null);

  const createNewProject = () => {
    setSelectedProject(null);
    setSelectedVideo(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        selectedVideo,
        setSelectedVideo,
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
