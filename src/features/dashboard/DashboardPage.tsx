import * as React from "react";
import { useParams } from "react-router-dom";
import { GenerationPanel } from "./generation-panel";
import { ChatPanel } from "./chat-panel";
import { useProjectContext, useAuth } from "@/common/contexts";
import { useProject } from "@/common/hooks/useProjects";
import { videoGenerationService, type Screenplay } from "@/api/video-generation-service";

const Index = () => {
  const { id } = useParams();
  const { selectedVideo, setSelectedProject } = useProjectContext();
  const { data: project } = useProject(id || null);
  const { user } = useAuth();
  const [screenplay, setScreenplay] = React.useState<Screenplay | null>(null);
  const [generatedProjectId, setGeneratedProjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  // Load existing screenplay when viewing a project
  React.useEffect(() => {
    async function loadProjectScreenplay() {
      if (!id) {
        return;
      }

      try {
        const screenplays = await videoGenerationService.getProjectScreenplays(id);
        if (screenplays.length > 0) {
          setScreenplay(screenplays[0].screenplay);
          setGeneratedProjectId(id);
        }
      } catch (error) {
        console.error("Failed to load project screenplay:", error);
      }
    }

    loadProjectScreenplay();
  }, [id]);

  const handleScreenplayGenerated = (newScreenplay: Screenplay, projectId: string) => {
    setScreenplay(newScreenplay);
    setGeneratedProjectId(projectId);
  };

  const handleScreenplayUpdate = (updatedScreenplay: Screenplay) => {
    setScreenplay(updatedScreenplay);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-6">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-pulse-slow absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="animate-pulse-slow absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="mb-2 text-3xl font-bold">
            {project ? (
              <span className="gradient-text">{project.name}</span>
            ) : (
              <>
                Create <span className="gradient-text">AI Video</span> Content
              </>
            )}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {project
              ? "Manage and update your project assets and generation settings."
              : "Transform your documents, slides, and notebooks into engaging short-form videos, reels, and cinematic content with AI."}
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Panel - Generation Controls */}
          <div
            className="glass-strong animate-fade-in overflow-y-auto rounded-2xl border border-border/50 p-6"
            style={{ animationDelay: "0.1s", height: "max(600px, calc(100vh - 140px))" }}
          >
            <GenerationPanel
              selectedVideo={selectedVideo}
              existingProject={project}
              onScreenplayGenerated={handleScreenplayGenerated}
            />
          </div>

          {/* Right Panel - Chat Interface */}
          <div
            className="glass-strong flex animate-fade-in flex-col rounded-2xl border border-border/50 p-6"
            style={{ animationDelay: "0.2s", height: "max(600px, calc(100vh - 140px))" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-semibold">Screenplay Studio</h2>
              {screenplay && <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
            </div>
            <ChatPanel
              screenplay={screenplay}
              projectId={generatedProjectId}
              userId={user?.id}
              onScreenplayUpdate={handleScreenplayUpdate}
              onScreenplayGenerated={handleScreenplayGenerated}
            />
          </div>
        </div>

        {/* Features Hint */}
        <div
          className="mt-8 grid animate-fade-in grid-cols-1 gap-4 md:grid-cols-3"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            {
              title: "Multi-Model Support",
              desc: "GPT-4o, Gemini, and more",
            },
            {
              title: "Smart Extraction",
              desc: "Auto-generates scripts from docs",
            },
            {
              title: "VFX & Captions",
              desc: "Professional-grade output",
            },
          ].map((feature, i) => (
            <div key={i} className="glass rounded-xl border border-border/30 p-4">
              <h3 className="text-sm font-medium">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
