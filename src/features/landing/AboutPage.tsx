import { Link, NavLink } from "react-router-dom";
import { GraduationCap, CheckCircle2, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLink = "text-[15px] font-medium transition-all duration-200 hover:text-foreground";

export function AboutPage() {
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

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">About Videaa</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            One platform for course videos, reels, short-form, and high-VFX cinematic content —
            built for creators who want more than a generic AI.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
            <Target className="h-6 w-6 text-primary" />
            Our mission
          </h2>
          <p className="text-muted-foreground">
            Videaa helps course creators, marketers, and storytellers scale without burning out.
            We're building a full creative suite: from slides and LMS-ready course videos to
            vertical reels, short-form explainers, and high-VFX cinematic content. Upload your
            content or describe your idea — get professional output that overdelivers on what
            general-purpose tools offer.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            Built for creators who want more
          </h2>
          <p className="mb-4 text-muted-foreground">
            Instructors, L&D teams, and content creators use Videaa for:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Course videos: slideshow, screenplay, narration script, compliance mapping, LMS
                export
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Reels and short-form video — vertical and quick explainers from a prompt or doc
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>High-VFX and cinematic-style content — beyond generic AI output</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Voice cloning and professional AI voiceover; SCORM 1.2 & 2004, Udemy/Coursera-ready
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Sparkles className="h-6 w-6 text-primary" />
            Why Videaa?
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Recording = re-takes and hard updates. Generic AI = text or basic assets. Videaa = full
            video platform. Quick comparison:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 font-semibold text-foreground">You get</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Recording / generic AI
                  </th>
                  <th className="px-4 py-3 font-semibold text-primary">Videaa</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="px-4 py-2.5 font-medium text-foreground">Output</td>
                  <td className="px-4 py-2.5">Re-takes, or text only</td>
                  <td className="px-4 py-2.5 text-foreground">
                    Course videos, reels, short-form, cinematic
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-2.5 font-medium text-foreground">Speed</td>
                  <td className="px-4 py-2.5">Hours of editing</td>
                  <td className="px-4 py-2.5 text-foreground">Upload or prompt → minutes</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-2.5 font-medium text-foreground">Updates</td>
                  <td className="px-4 py-2.5">Re-record</td>
                  <td className="px-4 py-2.5 text-foreground">Regenerate anytime</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Value</td>
                  <td className="px-4 py-2.5">One-off or generic</td>
                  <td className="px-4 py-2.5 text-foreground">
                    Dedicated platform, built to overdeliver
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-center gap-4">
          <Link to="/features">
            <Button variant="outline">See features</Button>
          </Link>
          <Link to="/pricing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              View pricing
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
