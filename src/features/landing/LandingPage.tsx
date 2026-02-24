import { useState, useEffect } from "react";
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
  Languages,
  BookOpen,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/api/client";
import { submitInterestForm } from "@/api/interest-service";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showBetaLogin, setShowBetaLogin] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);

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

      {/* Demo Preview Section */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-5xl">
          {/* Browser mockup */}
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
                  <GraduationCap className="h-3 w-3 text-primary" />
                  <span>Videaa Course Creator</span>
                </div>
              </div>
            </div>

            {/* Browser content - Course creation interface */}
            <div className="bg-gradient-to-b from-background to-card p-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left side - Upload */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-8 text-center">
                    <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
                    <p className="mb-1 text-sm font-medium">Drop your course content here</p>
                    <p className="text-xs text-muted-foreground">PDF, PPTX, DOCX up to 50MB</p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Introduction_to_Python.pdf</span>
                      <span className="ml-auto text-xs text-primary">Uploaded ✓</span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>• 12 chapters detected</p>
                      <p>• 45 key concepts extracted</p>
                      <p>• Estimated: 8 video modules</p>
                    </div>
                  </div>
                </div>

                {/* Right side - Settings */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <span className="mb-3 block text-xs font-medium text-muted-foreground">
                      VOICEOVER
                    </span>
                    <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/10 p-3">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-primary" />
                        <span className="text-sm">Clone my voice</span>
                      </div>
                      <span className="text-xs text-primary">Active</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <span className="mb-3 block text-xs font-medium text-muted-foreground">
                      EXPORT FORMAT
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-primary bg-primary/10 p-2 text-center text-xs">
                        Udemy MP4
                      </div>
                      <div className="rounded-lg border border-border p-2 text-center text-xs text-muted-foreground">
                        SCORM 2004
                      </div>
                      <div className="rounded-lg border border-border p-2 text-center text-xs text-muted-foreground">
                        Coursera
                      </div>
                      <div className="rounded-lg border border-border p-2 text-center text-xs text-muted-foreground">
                        Raw MP4
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-primary text-primary-foreground">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Course Videos
                  </Button>
                </div>
              </div>
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

            {/* Multilingual */}
            <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">35+ Languages</h3>
              <p className="text-sm text-muted-foreground">
                Reach global audiences with AI dubbing. Same course, multiple languages, one click.
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
                  <span>One language at a time</span>
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
                  <span>35+ languages with one click</span>
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
                      <SelectItem value="content_creation">Multilingual content</SelectItem>
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
                    <SelectItem value="content_creation">Multi-language</SelectItem>
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
