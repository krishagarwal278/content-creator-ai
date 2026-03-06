import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles,
  Sun,
  Moon,
  FileText,
  Mic,
  Upload,
  Download,
  GraduationCap,
  CheckCircle2,
  Loader2,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SlideshowPreview } from "@/components/ui/slideshow-preview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/api/client";
import { submitInterestForm, getInterestStats } from "@/api/interest-service";
import { generateSlideshowPreview, type SlideData } from "@/api/slideshow-service";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showBetaLogin, setShowBetaLogin] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const liveDemoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (showDemo && liveDemoRef.current) {
      liveDemoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showDemo]);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Update localStorage
    try {
      const stored = localStorage.getItem("userPreferences");
      const prefs = stored ? JSON.parse(stored) : {};
      prefs.theme = isDark ? "dark" : "light";
      localStorage.setItem("userPreferences", JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [isDark]);

  // Beta login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Interest form state - Required fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [earlyAccessPriority, setEarlyAccessPriority] = useState("");

  // Interest form state - Optional fields
  const [videoTopics, setVideoTopics] = useState<string[]>([]);
  const [useCase, setUseCase] = useState("");
  const [aiExperience, setAiExperience] = useState("");

  const [formLoading, setFormLoading] = useState(false);

  // Demo slideshow state
  const [demoTopic, setDemoTopic] = useState("");
  const [demoSlides, setDemoSlides] = useState<SlideData[] | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isDemoGenerating, setIsDemoGenerating] = useState(false);

  // Fetch waitlist count on load (for hero and CTAs — no demo required)
  useEffect(() => {
    getInterestStats()
      .then((stats) => setWaitlistCount(stats.total))
      .catch(() => setWaitlistCount(null));
  }, []);

  const handleDemoGenerate = async () => {
    if (!demoTopic.trim()) {
      toast.error("Please enter a topic for your demo");
      return;
    }

    setIsDemoGenerating(true);
    setDemoSlides(null);

    try {
      toast.info("Generating your demo slideshow...");

      const result = await generateSlideshowPreview(demoTopic, {
        style: "modern",
      });

      if (result.success && result.slides) {
        setDemoSlides(result.slides.slice(0, 4));
        toast.success("Demo slideshow ready!");
      } else {
        // Fallback to mock demo slides when backend is unavailable
        console.log("Using demo fallback slides");
        const mockSlides: SlideData[] = [
          {
            slideNumber: 1,
            title: `Introduction to ${demoTopic}`,
            bulletPoints: [
              "Understanding the core concepts and fundamentals",
              "Why this topic matters in today's landscape",
              "What you'll learn in this course module",
            ],
            narration: `Welcome to our course on ${demoTopic}. In this module, we'll explore the fundamental concepts that form the foundation of this subject.`,
            imageUrl:
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
          },
          {
            slideNumber: 2,
            title: "Key Concepts & Terminology",
            bulletPoints: [
              "Essential vocabulary and definitions",
              "Common frameworks and methodologies",
              "Industry best practices overview",
            ],
            narration:
              "Let's start by establishing a common vocabulary. Understanding these key terms will help you navigate more advanced topics.",
            imageUrl:
              "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
          },
          {
            slideNumber: 3,
            title: "Practical Applications",
            bulletPoints: [
              "Real-world use cases and examples",
              "Step-by-step implementation guide",
              "Common pitfalls to avoid",
            ],
            narration:
              "Now let's look at how these concepts apply in real-world scenarios. We'll walk through practical examples you can apply immediately.",
            imageUrl:
              "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
          },
          {
            slideNumber: 4,
            title: "Summary & Next Steps",
            bulletPoints: [
              "Key takeaways from this module",
              "Recommended resources for deeper learning",
              "Preview of upcoming advanced topics",
            ],
            narration:
              "To wrap up, let's review what we've covered and discuss how you can continue building on this foundation.",
            imageUrl:
              "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop",
          },
        ];
        setDemoSlides(mockSlides);
        toast.success("Demo slideshow ready!");
      }
    } catch (error) {
      console.error("Demo generation error:", error);
      // Fallback to mock demo slides on error
      const mockSlides: SlideData[] = [
        {
          slideNumber: 1,
          title: `Introduction to ${demoTopic}`,
          bulletPoints: [
            "Understanding the core concepts and fundamentals",
            "Why this topic matters in today's landscape",
            "What you'll learn in this course module",
          ],
          narration: `Welcome to our course on ${demoTopic}. In this module, we'll explore the fundamental concepts.`,
          imageUrl:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
        },
        {
          slideNumber: 2,
          title: "Key Concepts & Terminology",
          bulletPoints: [
            "Essential vocabulary and definitions",
            "Common frameworks and methodologies",
            "Industry best practices overview",
          ],
          narration: "Let's establish a common vocabulary for navigating this subject.",
          imageUrl:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
        },
        {
          slideNumber: 3,
          title: "Practical Applications",
          bulletPoints: [
            "Real-world use cases and examples",
            "Step-by-step implementation guide",
            "Common pitfalls to avoid",
          ],
          narration: "Now let's look at practical applications you can use immediately.",
          imageUrl:
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
        },
        {
          slideNumber: 4,
          title: "Summary & Next Steps",
          bulletPoints: [
            "Key takeaways from this module",
            "Recommended resources for deeper learning",
            "Preview of upcoming advanced topics",
          ],
          narration: "Let's review what we've covered and discuss next steps.",
          imageUrl:
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop",
        },
      ];
      setDemoSlides(mockSlides);
      toast.success("Demo slideshow ready!");
    } finally {
      setIsDemoGenerating(false);
    }
  };

  const handleBetaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        throw error;
      }
      toast.success("Welcome back, Beta Tester!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await submitInterestForm({
        fullName,
        email,
        role,
        earlyAccessPriority,
        videoTopics: videoTopics.length > 0 ? videoTopics : undefined,
        useCase: useCase || undefined,
        aiExperience: aiExperience || undefined,
      });
      toast.success("Thanks for joining! We'll be in touch soon.");
      setShowInterestForm(false);
      // Reset form
      setFullName("");
      setEmail("");
      setRole("");
      setEarlyAccessPriority("");
      setVideoTopics([]);
      setUseCase("");
      setAiExperience("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleVideoTopic = (topic: string) => {
    setVideoTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl transition-shadow duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link
              to="/"
              className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
            >
              <img
                src="/logo.png"
                alt="Videaa"
                className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-black/10 dark:shadow-black/30"
              />
              <span className="text-xl font-semibold tracking-tight text-foreground">Videaa</span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <NavLink
                to="/features"
                className={({ isActive }) =>
                  `text-[15px] font-medium transition-all duration-200 hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                Features
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-[15px] font-medium transition-all duration-200 hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  `text-[15px] font-medium transition-all duration-200 hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                Pricing
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              data-testid="beta-login-btn"
              onClick={() => setShowBetaLogin(true)}
              className="rounded-lg px-3 py-2 text-[15px] font-medium text-muted-foreground transition-all duration-200 hover:text-foreground"
            >
              Login
            </button>
            <Button
              data-testid="join-beta-btn"
              onClick={() => setShowInterestForm(true)}
              className="bg-primary text-[15px] font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90"
            >
              Join Beta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        {/* Gradient background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Instructors, Creators, & Learners
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
            One platform. <span className="gradient-text">Every format.</span>
          </h1>

          {/* Subheadline — short */}
          <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground md:text-lg">
            Course videos, reels, short-form, and cinematic content — from slides or a prompt. Built
            for creators who want more than a generic AI.
          </p>

          {/* One-line value props */}
          <p className="mx-auto mb-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Reels & short-form
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> High-VFX & cinematic
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> LMS & SCORM export
            </span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button
              data-testid="start-creating-btn"
              onClick={() => setShowInterestForm(true)}
              size="lg"
              className="h-12 bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign up — 100 credits free
            </Button>
            <Button
              data-testid="watch-demo-btn"
              variant="outline"
              onClick={() => setShowDemo(true)}
              size="lg"
              className="h-12 border-border px-6 text-base font-medium hover:bg-secondary"
            >
              See demo
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {waitlistCount != null && waitlistCount >= 100
              ? `${waitlistCount.toLocaleString()} on the list`
              : "Early creators are already testing it — join the launch cohort."}
          </p>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section ref={liveDemoRef} className="relative px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Try it now — <span className="gradient-text">no signup required</span>
            </h2>
            <p className="text-muted-foreground">
              Enter any course topic and see AI generate professional slides instantly
            </p>
          </div>

          {/* Demo Interface */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Browser header */}
            <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex flex-1 justify-center">
                <div className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-1 text-xs text-muted-foreground">
                  <Presentation className="h-3 w-3 text-primary" />
                  <span>Videaa Live Demo</span>
                </div>
              </div>
            </div>

            {/* Demo Content */}
            <div className="bg-gradient-to-b from-background to-card p-6 md:p-8">
              {!demoSlides ? (
                <div className="mx-auto max-w-xl space-y-6">
                  {/* Topic Input */}
                  <div className="space-y-3">
                    <Label htmlFor="demo-topic" className="text-sm font-medium">
                      What would you like to teach?
                    </Label>
                    <Input
                      id="demo-topic"
                      placeholder="e.g., Introduction to Machine Learning, Python Basics, Digital Marketing 101..."
                      value={demoTopic}
                      onChange={(e) => setDemoTopic(e.target.value)}
                      className="h-12 border-border bg-secondary/50 text-base"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isDemoGenerating) {
                          handleDemoGenerate();
                        }
                      }}
                    />
                  </div>

                  {/* Quick Topic Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Try:</span>
                    {[
                      "Python for Beginners",
                      "AWS Cloud Fundamentals",
                      "UX Design Principles",
                      "Financial Modeling",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setDemoTopic(suggestion)}
                        className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleDemoGenerate}
                    disabled={!demoTopic.trim() || isDemoGenerating}
                    className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
                  >
                    {isDemoGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Demo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate 4-Slide Preview
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Free demo • No account needed • Results in ~10 seconds
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Demo Result Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Presentation className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">Demo: {demoTopic}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {demoSlides.length} slides
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDemoSlides(null);
                        setDemoTopic("");
                      }}
                    >
                      Try Another Topic
                    </Button>
                  </div>

                  {/* "Preview ready" message */}
                  <p className="text-center font-medium text-foreground">
                    Yayy! Your slides are ready!
                  </p>

                  {/* Slideshow Preview */}
                  <SlideshowPreview slides={demoSlides} autoPlay />

                  {/* What Beta users get + urgency CTA */}
                  <div className="mt-6 space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
                    <p className="text-sm font-medium text-foreground">Beta users get:</p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li>→ 15-slide presentations</li>
                      <li>→ Screenplay + narration script</li>
                      <li>→ Compliance framework mapping</li>
                      <li>→ LMS-ready export</li>
                    </ul>
                    <p className="text-sm font-medium text-foreground">
                      {waitlistCount != null && waitlistCount >= 100
                        ? `Join ${waitlistCount.toLocaleString()} people waiting for full access.`
                        : "Be among the first to get full access."}
                    </p>
                    <Button
                      onClick={() => setShowInterestForm(true)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Get early access
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
            Document → video in 3 steps
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">Upload</h3>
              <p className="text-sm text-muted-foreground">
                PDF, PPTX, or doc. We extract and structure it.
              </p>
            </div>
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">AI generates</h3>
              <p className="text-sm text-muted-foreground">
                Slides, script, voiceover, and quizzes.
              </p>
            </div>
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">Export</h3>
              <p className="text-sm text-muted-foreground">MP4, SCORM, or Coursera-ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section — short copy + reels/short-form/VFX */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
            From reels to cinematic — one platform
          </h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Course videos, vertical reels, short-form, and high-VFX cinematic. More than slides and
            export.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Presentation className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">Reels & short-form</h3>
              <p className="text-sm text-muted-foreground">
                Vertical reels and quick explainers from a prompt or doc.
              </p>
            </div>
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">High-VFX & cinematic</h3>
              <p className="text-sm text-muted-foreground">
                Cinematic and VFX-style content — beyond generic AI output.
              </p>
            </div>
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">Document upload</h3>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, PPTX — we extract and structure.
              </p>
            </div>
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">AI voiceover</h3>
              <p className="text-sm text-muted-foreground">40+ voices or clone your own.</p>
            </div>
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">SCORM export</h3>
              <p className="text-sm text-muted-foreground">
                LMS-ready for Udemy, Coursera, corporate.
              </p>
            </div>
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">Learning objectives</h3>
              <p className="text-sm text-muted-foreground">
                Bloom's Taxonomy, EC-Council & CompTIA ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison — short */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Why Videaa?</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Recording yourself
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span> Hours of re-takes
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span> Costly gear & software
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span> Hard to update
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-primary">With Videaa</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Course videos, reels,
                  short-form, cinematic
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Upload or prompt →
                  video in minutes
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> No equipment · update &
                  regenerate anytime
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Logos Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Export ready for all major platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-2xl font-bold text-muted-foreground/50">
            <span>Udemy</span>
            <span>Coursera</span>
            <span>Teachable</span>
            <span>Thinkific</span>
            <span>Kajabi</span>
          </div>
        </div>
      </section>

      {/* Interest Form Section */}
      <section className="relative px-6 py-20">
        {/* Gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="rounded-2xl border border-primary/20 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-2 text-center text-2xl font-bold">Get early access</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {waitlistCount != null && waitlistCount >= 100
                ? `${waitlistCount.toLocaleString()} on the list · `
                : ""}
              100 credits free when you sign up
            </p>

            <form onSubmit={handleInterestSubmit} className="space-y-5">
              {/* Row 1: Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="landing-name" className="text-sm">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="landing-name"
                    data-testid="interest-name-input"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-2 border-border bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="landing-email" className="text-sm">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="landing-email"
                    data-testid="interest-email-input"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 border-border bg-secondary/50"
                  />
                </div>
              </div>

              {/* Row 2: Role & Platform (Required) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm">
                    I am a... <span className="text-destructive">*</span>
                  </Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="udemy_instructor">Udemy Instructor</SelectItem>
                      <SelectItem value="coursera_creator">Coursera Creator</SelectItem>
                      <SelectItem value="teachable_creator">Teachable Creator</SelectItem>
                      <SelectItem value="corporate_trainer">Corporate Trainer / L&D</SelectItem>
                      <SelectItem value="instructional_designer">Instructional Designer</SelectItem>
                      <SelectItem value="certification_body">Certification Body</SelectItem>
                      <SelectItem value="educator">Educator / Professor</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">
                    Courses created <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={earlyAccessPriority}
                    onValueChange={setEarlyAccessPriority}
                    required
                  >
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="How many courses?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_interested">10+ courses (Power creator)</SelectItem>
                      <SelectItem value="somewhat_interested">1-10 courses</SelectItem>
                      <SelectItem value="just_exploring">Planning my first course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Course Topics (Optional, Multi-select as chips) */}
              <div>
                <Label className="text-sm">
                  What do you teach? <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: "technical_skills", label: "Programming & Tech" },
                    { value: "business_finance", label: "Business & Finance" },
                    { value: "academic", label: "Academic Subjects" },
                    { value: "creative_skills", label: "Creative & Design" },
                    { value: "language_learning", label: "Languages" },
                    { value: "career_prep", label: "Professional Certs" },
                    { value: "personal_development", label: "Personal Dev" },
                  ].map((topic) => (
                    <button
                      key={topic.value}
                      type="button"
                      onClick={() => toggleVideoTopic(topic.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        videoTopics.includes(topic.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Use Case & Current Pain (Optional) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm">
                    Biggest challenge? <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select value={useCase} onValueChange={setUseCase}>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="Select challenge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create_learning_videos">
                        Recording takes too long
                      </SelectItem>
                      <SelectItem value="summarize_concepts">Editing is tedious</SelectItem>
                      <SelectItem value="study_faster">Voice quality issues</SelectItem>
                      <SelectItem value="build_courses">Keeping content updated</SelectItem>
                      <SelectItem value="content_creation">Scaling content</SelectItem>
                      <SelectItem value="experimenting">Production costs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">
                    Export needs <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select value={aiExperience} onValueChange={setAiExperience}>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Udemy (MP4)</SelectItem>
                      <SelectItem value="intermediate">SCORM for LMS</SelectItem>
                      <SelectItem value="advanced">Coursera format</SelectItem>
                      <SelectItem value="power_user">Multiple platforms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                data-testid="join-waitlist-btn"
                disabled={formLoading || !fullName || !email || !role || !earlyAccessPriority}
                className="w-full bg-primary py-6 text-base text-primary-foreground hover:bg-primary/90"
              >
                {formLoading ? "Submitting..." : "Get Early Access"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Free during beta. No credit card required.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Videaa"
              className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-black/10 dark:shadow-black/30"
            />
            <span className="font-semibold">Videaa</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Videaa AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Beta Login Modal — high contrast in light/dark */}
      <Dialog open={showBetaLogin} onOpenChange={setShowBetaLogin}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Beta Tester Login
            </DialogTitle>
            <DialogDescription className="text-foreground/85">
              Sign in with your beta tester credentials to access Videaa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBetaLogin} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="beta-email" className="text-foreground">
                Email
              </Label>
              <Input
                id="beta-email"
                data-testid="beta-email-input"
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="mt-2 bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="beta-password" className="text-foreground">
                Password
              </Label>
              <Input
                id="beta-password"
                data-testid="beta-password-input"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="mt-2 bg-secondary/50"
              />
            </div>
            <Button
              type="submit"
              data-testid="beta-login-submit-btn"
              disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground"
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Don't have beta access?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowBetaLogin(false);
                  setShowInterestForm(true);
                }}
                className="text-primary hover:underline"
              >
                Join the waitlist
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interest Form Modal — high contrast in light/dark */}
      <Dialog open={showInterestForm} onOpenChange={setShowInterestForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Get Early Access to Videaa
            </DialogTitle>
            <DialogDescription className="text-foreground/85">
              {waitlistCount != null && waitlistCount >= 100
                ? `${waitlistCount.toLocaleString()} on the list · `
                : ""}
              100 credits free when you sign up
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInterestSubmit} className="mt-4 space-y-4">
            {/* Name & Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="modal-name" className="text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-name"
                  data-testid="modal-name-input"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-2 bg-secondary/50"
                />
              </div>
              <div>
                <Label htmlFor="modal-email" className="text-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-email"
                  data-testid="modal-email-input"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-secondary/50"
                />
              </div>
            </div>

            {/* Role & Courses Created (Required) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground">
                  I am a... <span className="text-destructive">*</span>
                </Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="udemy_instructor">Udemy Instructor</SelectItem>
                    <SelectItem value="coursera_creator">Coursera Creator</SelectItem>
                    <SelectItem value="teachable_creator">Teachable Creator</SelectItem>
                    <SelectItem value="corporate_trainer">Corporate Trainer</SelectItem>
                    <SelectItem value="instructional_designer">Instructional Designer</SelectItem>
                    <SelectItem value="educator">Educator / Professor</SelectItem>
                    <SelectItem value="content_creator">Content Creator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">
                  Courses created <span className="text-destructive">*</span>
                </Label>
                <Select value={earlyAccessPriority} onValueChange={setEarlyAccessPriority} required>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="How many?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_interested">10+ courses</SelectItem>
                    <SelectItem value="somewhat_interested">1-10 courses</SelectItem>
                    <SelectItem value="just_exploring">Planning first course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topics (Optional chips) */}
            <div>
              <Label className="text-sm text-foreground">
                What do you teach? <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { value: "technical_skills", label: "Tech" },
                  { value: "business_finance", label: "Business" },
                  { value: "academic", label: "Academic" },
                  { value: "creative_skills", label: "Creative" },
                  { value: "language_learning", label: "Languages" },
                  { value: "career_prep", label: "Pro Certs" },
                ].map((topic) => (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => toggleVideoTopic(topic.value)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                      videoTopics.includes(topic.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenges & Export Format (Optional) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm text-foreground">
                  Challenge <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Select value={useCase} onValueChange={setUseCase}>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_learning_videos">Recording time</SelectItem>
                    <SelectItem value="summarize_concepts">Editing tedium</SelectItem>
                    <SelectItem value="study_faster">Voice quality</SelectItem>
                    <SelectItem value="build_courses">Keeping updated</SelectItem>
                    <SelectItem value="content_creation">Scaling content</SelectItem>
                    <SelectItem value="experimenting">Costs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-foreground">
                  Export format <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Select value={aiExperience} onValueChange={setAiExperience}>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Udemy MP4</SelectItem>
                    <SelectItem value="intermediate">SCORM for LMS</SelectItem>
                    <SelectItem value="advanced">Coursera format</SelectItem>
                    <SelectItem value="power_user">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="modal-submit-btn"
              disabled={formLoading || !fullName || !email || !role || !earlyAccessPriority}
              className="w-full bg-primary text-primary-foreground"
            >
              {formLoading ? "Submitting..." : "Get Early Access"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Free during beta. No credit card required.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
