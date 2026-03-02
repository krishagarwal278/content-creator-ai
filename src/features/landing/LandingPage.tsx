import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles,
  Sun,
  Moon,
  FileText,
  Mic,
  Upload,
  Download,
  Volume2,
  BookOpen,
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
import { submitInterestForm } from "@/api/interest-service";
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
  const [isDemoGenerating, setIsDemoGenerating] = useState(false);

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
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Videaa"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-black/10 dark:shadow-black/30"
            />
            <span className="text-xl font-bold text-foreground">Videaa</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              data-testid="beta-login-btn"
              onClick={() => setShowBetaLogin(true)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </button>
            <Button
              data-testid="join-beta-btn"
              onClick={() => setShowInterestForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Built for Udemy & Coursera Instructors</span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Turn your course notes into <span className="gradient-text">engaging videos</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Upload your lecture notes, slides, or PDFs. Our AI generates professional course videos
            with voiceover narration, quizzes, and SCORM export — ready for Udemy, Coursera, or any
            LMS.
          </p>

          {/* Quick value props */}
          <div className="mx-auto mb-10 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No recording required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Clone your own voice</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>SCORM 1.2 & 2004 export</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              data-testid="start-creating-btn"
              onClick={() => setShowInterestForm(true)}
              size="lg"
              className="bg-primary px-8 py-6 text-base text-primary-foreground hover:bg-primary/90"
            >
              Upload Your First Document
              <span className="ml-2">→</span>
            </Button>
            <Button
              data-testid="watch-demo-btn"
              variant="outline"
              onClick={() => setShowDemo(true)}
              size="lg"
              className="border-border px-8 py-6 text-base text-foreground hover:bg-secondary"
            >
              See How It Works
            </Button>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            Trusted by 2,000+ course creators worldwide
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

                  {/* Slideshow Preview */}
                  <SlideshowPreview slides={demoSlides} autoPlay />

                  {/* CTA after demo */}
                  <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Like what you see? Get full slideshows with up to 15 slides, AI voiceover, and
                      LMS export.
                    </p>
                    <Button
                      onClick={() => setShowInterestForm(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Get Full Access — Free Beta
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              From document to course video in 3 steps
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Stop spending weeks recording and editing. Upload your existing content and let AI do
              the heavy lifting.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1: Upload */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Upload Your Content</h3>
              <p className="text-muted-foreground">
                Drop your PDF, PowerPoint, Word doc, or lecture notes. We extract and structure your
                content automatically.
              </p>
            </div>

            {/* Step 2: AI Generates */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">AI Creates Your Video</h3>
              <p className="text-muted-foreground">
                Our AI generates explainer videos with professional voiceover narration, visuals,
                and auto-generated quiz questions.
              </p>
            </div>

            {/* Step 3: Export */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <Download className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Export Anywhere</h3>
              <p className="text-muted-foreground">
                Download as MP4 for Udemy, SCORM packages for any LMS, or Coursera-ready formats
                with chapter markers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything course creators need</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The only platform that takes your existing course content and produces actual
              instructional videos — not just outlines.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Document Upload */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Document Upload</h3>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, PPTX — upload any format. We extract your content intelligently.
              </p>
            </div>

            {/* AI Voiceover */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Voiceover & Voice Cloning</h3>
              <p className="text-sm text-muted-foreground">
                40+ professional voices or clone your own. Upload 2 minutes of audio and we'll match
                it.
              </p>
            </div>

            {/* SCORM Export */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">SCORM 1.2 & 2004 Export</h3>
              <p className="text-sm text-muted-foreground">
                Export LMS-ready packages for any platform. Udemy MP4, Coursera chapters, or SCORM
                for corporate LMS.
              </p>
            </div>

            {/* Quiz Generation */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Auto-Generated Quizzes</h3>
              <p className="text-sm text-muted-foreground">
                AI creates assessment questions from your content. Multiple choice, true/false, and
                short answer.
              </p>
            </div>

            {/* English voiceover */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Professional English Voiceover</h3>
              <p className="text-sm text-muted-foreground">
                Natural-sounding narration in English. We focus on quality first — more languages
                coming soon.
              </p>
            </div>

            {/* Bloom's Taxonomy */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Learning Objective Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Bloom's Taxonomy alignment for professional certification courses. EC-Council and
                CompTIA ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Videaa vs. recording yourself?
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Traditional */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="mb-6 text-lg font-semibold text-muted-foreground">
                Recording Yourself
              </h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-destructive">✗</span>
                  <span>Hours of recording, editing, and re-takes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-destructive">✗</span>
                  <span>Expensive equipment and software needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-destructive">✗</span>
                  <span>Can't easily update when content changes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-destructive">✗</span>
                  <span>Manual recording in one language only</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-destructive">✗</span>
                  <span>$50K-$200K per course for professional production</span>
                </li>
              </ul>
            </div>

            {/* Videaa */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
              <h3 className="mb-6 text-lg font-semibold text-primary">With Videaa</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Upload once, video generated in minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>No equipment needed — just your documents</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Update content anytime, regenerate instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Professional English narration — no recording needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Starting at $39/month — unlimited updates</span>
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
            <h2 className="mb-3 text-center text-3xl font-bold">
              Start Creating Course Videos Today
            </h2>
            <p className="mb-8 text-center text-muted-foreground">
              Join 2,000+ course creators already using Videaa. Get early access and 50% off launch
              pricing.
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

      {/* Beta Login Modal */}
      <Dialog open={showBetaLogin} onOpenChange={setShowBetaLogin}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Beta Tester Login</DialogTitle>
            <DialogDescription>
              Sign in with your beta tester credentials to access Videaa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBetaLogin} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="beta-email">Email</Label>
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
              <Label htmlFor="beta-password">Password</Label>
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

      {/* Interest Form Modal */}
      <Dialog open={showInterestForm} onOpenChange={setShowInterestForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Get Early Access to Videaa</DialogTitle>
            <DialogDescription>
              Join 2,000+ course creators. Turn your lecture notes into professional videos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInterestSubmit} className="mt-4 space-y-4">
            {/* Name & Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="modal-name">
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
                <Label htmlFor="modal-email">
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
                <Label>
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
                <Label>
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
              <Label className="text-sm">
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
                <Label className="text-sm">
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
                <Label className="text-sm">
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
