import * as React from "react";
import { useParams } from "react-router-dom";
import { GenerationPanel } from "@/components/dashboard/generation-panel";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { useProjectContext } from "@/context/ProjectContext";
import { useProject } from "@/hooks/useProjects";

const Index = () => {
  const { id } = useParams();
  const { selectedVideo, setSelectedVideo, setSelectedProject } = useProjectContext();
  const { data: project } = useProject(id || null);

  React.useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">
            {project ? (
              <span className="gradient-text">{project.name}</span>
            ) : (
              <>
                Create <span className="gradient-text">AI Video</span> Content
              </>
            )}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {project ? "Manage and update your project assets and generation settings." :
              "Transform your documents, slides, and notebooks into engaging short-form videos, reels, and cinematic content with AI."}
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Generation Controls */}
          <div
            className="glass-strong rounded-2xl p-6 border border-border/50 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <GenerationPanel selectedVideo={selectedVideo} existingProject={project} />
          </div>

          {/* Right Panel - Preview */}
          <div
            className="glass-strong rounded-2xl p-6 border border-border/50 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <PreviewPanel onSelectVideo={setSelectedVideo} />
          </div>
        </div>

        {/* Features Hint */}
        <div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in"
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
            <div
              key={i}
              className="glass rounded-xl p-4 border border-border/30"
            >
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
