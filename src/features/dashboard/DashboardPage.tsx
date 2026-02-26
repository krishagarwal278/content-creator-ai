import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GenerationPanel } from "./generation-panel";
import { ChatPanel } from "./chat-panel";
import { useProjectContext } from "@/common/contexts/ProjectContext";
import { useAuth } from "@/common/contexts/AuthContext";
import { useProject } from "@/common/hooks/useProjects";
import {
  videoGenerationService,
  type Screenplay,
  type VideoFormat,
} from "@/api/video-generation-service";

const Index = () => {
  const { id } = useParams();
  const { selectedVideo, setSelectedProject } = useProjectContext();
  const { data: project } = useProject(id || null);
  const { user } = useAuth();
  const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null);
  const [selectedAiModel, setSelectedAiModel] = useState("gpt-4o");
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>("reel");

  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  // Load existing screenplay when viewing a project
  useEffect(() => {
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

      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <h1 className="mb-2 text-3xl font-bold">
            {project ? (
              <span className="gradient-text">{project.name}</span>
            ) : (
              <>
                Create <span className="gradient-text">Course Videos</span>
              </>
            )}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {project
              ? "Manage and update your course content and generation settings."
              : "Upload your lecture notes, slides, or PDFs. Generate professional course videos with AI voiceover — ready for Udemy, Coursera, or any LMS."}
          </p>
        </header>

        {/* Dashboard Grid - Wider left panel for content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Left Panel - Generation Controls (wider) */}
          <div
            className="glass-strong animate-fade-in overflow-y-auto rounded-2xl border border-border/50 p-4 md:p-6"
            style={{ animationDelay: "0.1s", height: "max(650px, calc(100vh - 120px))" }}
          >
            <GenerationPanel
              selectedVideo={selectedVideo}
              existingProject={project}
              onScreenplayGenerated={handleScreenplayGenerated}
              onAiModelChange={setSelectedAiModel}
              onFormatChange={setSelectedFormat}
            />
          </div>

          {/* Right Panel - Chat Interface */}
          <div
            className="glass-strong flex animate-fade-in flex-col rounded-2xl border border-border/50 p-4 md:p-6"
            style={{ animationDelay: "0.2s", height: "max(650px, calc(100vh - 120px))" }}
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
              aiModel={selectedAiModel}
              format={selectedFormat}
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
              title: "Document to Video",
              desc: "Upload PDF, PPTX, DOCX",
            },
            {
              title: "AI Voiceover",
              desc: "30+ voices or clone yours",
            },
            {
              title: "LMS-Ready Export",
              desc: "SCORM, Udemy MP4, Coursera",
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
