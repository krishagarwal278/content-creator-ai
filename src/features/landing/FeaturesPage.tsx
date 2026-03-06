import { Link, NavLink } from "react-router-dom";
import {
  FileText,
  Mic,
  Download,
  BookOpen,
  Volume2,
  GraduationCap,
  Presentation,
  Sparkles,
  Film,
  Smartphone,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLink = "text-[15px] font-medium transition-all duration-200 hover:text-foreground";

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
          >
            <img src="/logo.png" alt="Videaa" className="h-10 w-10 rounded-xl object-cover" />
            <span className="text-xl font-semibold tracking-tight">Videaa</span>
          </Link>
          <nav className="flex items-center gap-8">
            <NavLink
              to="/features"
              className={({ isActive }) =>
                isActive ? `text-foreground ${navLink}` : `text-muted-foreground ${navLink}`
              }
            >
              Features
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? `text-foreground ${navLink}` : `text-muted-foreground ${navLink}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                isActive ? `text-foreground ${navLink}` : `text-muted-foreground ${navLink}`
              }
            >
              Pricing
            </NavLink>
            <Link to="/">
              <Button variant="outline" size="sm" className="text-[15px] font-medium">
                Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">From Reels to Cinematic Content</h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Course videos, reels, short-form, high-VFX — one platform. More value than a generic AI.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Reels & vertical short-form</h2>
            <p className="text-sm text-muted-foreground">
              Vertical reels and quick explainers from a prompt or your docs. Built for social and
              ads.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Short-form video</h2>
            <p className="text-sm text-muted-foreground">
              Punchy explainers and promo clips. Ideal for product demos, tips, and marketing.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">High-VFX & cinematic</h2>
            <p className="text-sm text-muted-foreground">
              Cinematic and VFX-style content. Beyond generic AI — built to overdeliver.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Presentation className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Slideshow & screenplay</h2>
            <p className="text-sm text-muted-foreground">
              AI slide decks and scripts; up to 12 slides on paid tiers.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Document upload</h2>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, PPTX — we extract and structure for video.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">AI voiceover & cloning</h2>
            <p className="text-sm text-muted-foreground">
              40+ voices or clone yours with ~2 min of audio.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Screenplay + narration</h2>
            <p className="text-sm text-muted-foreground">
              Full script per video; edit before voiceover.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Compliance mapping</h2>
            <p className="text-sm text-muted-foreground">
              Learning objectives, Bloom's Taxonomy; EC-Council & CompTIA ready.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">LMS-ready export</h2>
            <p className="text-sm text-muted-foreground">
              SCORM 1.2 & 2004; Udemy, Coursera, corporate.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">Auto quizzes</h2>
            <p className="text-sm text-muted-foreground">AI assessments from your content.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Volume2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">English voiceover</h2>
            <p className="text-sm text-muted-foreground">Natural narration; more languages soon.</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign up — 100 credits free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
