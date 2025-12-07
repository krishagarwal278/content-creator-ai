import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  FolderOpen,
  Settings,
  History,
  Sparkles,
  PlusCircle,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectHistory } from "@/components/dashboard/project-history";
import { type Project } from "@/hooks/useProjects";

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: FolderOpen, label: "Projects", id: "projects" },
  { icon: History, label: "History", id: "history" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface SidebarProps {
  onNewProject?: () => void;
  onSelectProject?: (project: Project) => void;
  selectedProjectId?: string | null;
}

export function Sidebar({ onNewProject, onSelectProject, selectedProjectId }: SidebarProps) {
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [showProjects, setShowProjects] = React.useState(false);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-strong border-r border-border/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        {showProjects ? (
          <button
            onClick={() => setShowProjects(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            All Projects
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">ContentAI</h1>
              <p className="text-xs text-muted-foreground">Video Generator</p>
            </div>
          </div>
        )}
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Button
          onClick={onNewProject}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium gap-2 transition-all hover:shadow-[0_0_20px_hsl(174_72%_56%/0.3)]"
        >
          <PlusCircle className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {showProjects ? (
        /* Projects List */
        <div className="flex-1 overflow-y-auto p-4">
          <ProjectHistory
            onSelectProject={onSelectProject}
            selectedProjectId={selectedProjectId}
          />
        </div>
      ) : (
        /* Navigation */
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === "projects" || item.id === "history") {
                    setShowProjects(true);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Guest User</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
