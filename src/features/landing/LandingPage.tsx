import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Play, Zap, Shield, Sparkles, Sun, Moon } from "lucide-react";
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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Next Gen AI Video Engine v2.0</span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Turn your text into <span className="gradient-text">cinematic reality</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Create physics-accurate, high-fidelity videos from simple text descriptions. The most
            advanced AI video generation platform for creators.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              data-testid="start-creating-btn"
              onClick={() => setShowInterestForm(true)}
              size="lg"
              className="bg-primary px-8 py-6 text-base text-primary-foreground hover:bg-primary/90"
            >
              Start Creating
              <span className="ml-2">→</span>
            </Button>
            <Button
              data-testid="watch-demo-btn"
              variant="outline"
              size="lg"
              className="border-border px-8 py-6 text-base text-foreground hover:bg-secondary"
            >
              Watch Demo
            </Button>
          </div>
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
                  <Play className="h-3 w-3 text-red-500" />
                  <span>Videaa</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Home</span>
                <span>Features</span>
                <span>Pricing</span>
                <Button size="sm" variant="ghost" className="h-6 text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Create Video
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Sign In
                </Button>
              </div>
            </div>

            {/* Browser content */}
            <div className="bg-gradient-to-b from-background to-card p-8">
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
                  <Play className="h-3 w-3 text-red-500" />
                  <span>Powered by Videaa AI</span>
                </div>
                <h2 className="mb-2 text-2xl font-bold">Create Stunning Videos with Videaa</h2>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Experience Videaa AI's revolutionary video generator with physics-accurate motion,
                  synchronized audio, and realistic effects.
                </p>
              </div>

              {/* Video creation interface mockup */}
              <div className="rounded-xl border border-border bg-card/50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Create Your Videaa Video</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">AI Model</span>
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Videaa</span>
                      </div>
                      <span className="text-xs text-muted-foreground">15 credits</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      High quality AI video generation with audio
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Generation Mode</span>
                    <div className="mt-2 flex gap-2">
                      <div className="flex-1 rounded-lg border border-primary bg-primary/10 p-3 text-center">
                        <span className="text-xs">Text to Video</span>
                      </div>
                      <div className="flex-1 rounded-lg border border-border bg-secondary/30 p-3 text-center">
                        <span className="text-xs text-muted-foreground">Image to Video</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Lightning Fast */}
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate 1080p video clips in seconds, not hours. Real-time preview available.
              </p>
            </div>

            {/* Commercial Rights */}
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Commercial Rights</h3>
              <p className="text-muted-foreground">
                Full ownership of your generated content. Use it for ads, social media, or film.
              </p>
            </div>

            {/* Physics Engine */}
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Physics Engine</h3>
              <p className="text-muted-foreground">
                Our AI understands gravity, light, and motion for hyper-realistic results.
              </p>
            </div>
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
            <h2 className="mb-3 text-center text-3xl font-bold">Join the Future</h2>
            <p className="mb-8 text-center text-muted-foreground">
              We're currently in private beta. Sign up to get early access and exclusive updates.
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

              {/* Row 2: Role & Early Access Priority (Required) */}
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
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="self_learner">Self-learner</SelectItem>
                      <SelectItem value="educator">Educator / Teacher</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="professional">Professional (upskilling)</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">
                    Early access interest <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={earlyAccessPriority}
                    onValueChange={setEarlyAccessPriority}
                    required
                  >
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="How interested are you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_interested">
                        Very interested - I'd use it daily
                      </SelectItem>
                      <SelectItem value="somewhat_interested">Somewhat interested</SelectItem>
                      <SelectItem value="just_exploring">Just exploring for now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Video Topics (Optional, Multi-select as chips) */}
              <div>
                <Label className="text-sm">
                  What topics interest you?{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: "technical_skills", label: "Tech & Coding" },
                    { value: "business_finance", label: "Business" },
                    { value: "academic", label: "Academic" },
                    { value: "creative_skills", label: "Creative" },
                    { value: "language_learning", label: "Languages" },
                    { value: "career_prep", label: "Career" },
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

              {/* Row 4: Use Case & AI Experience (Optional) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm">
                    How would you use it? <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select value={useCase} onValueChange={setUseCase}>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create_learning_videos">Create learning videos</SelectItem>
                      <SelectItem value="summarize_concepts">Summarize concepts</SelectItem>
                      <SelectItem value="study_faster">Study faster</SelectItem>
                      <SelectItem value="build_courses">Build courses</SelectItem>
                      <SelectItem value="content_creation">Content creation</SelectItem>
                      <SelectItem value="experimenting">Just experimenting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">
                    AI experience level <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select value={aiExperience} onValueChange={setAiExperience}>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - New to AI tools</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Use occasionally</SelectItem>
                      <SelectItem value="advanced">Advanced - Regular user</SelectItem>
                      <SelectItem value="power_user">Power user - Daily workflows</SelectItem>
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
                {formLoading ? "Submitting..." : "Join Waitlist"}
              </Button>
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
            <DialogTitle className="text-xl">Join the Videaa Beta</DialogTitle>
            <DialogDescription>
              Be among the first to experience the future of AI video generation.
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

            {/* Role & Early Access (Required) */}
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
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="self_learner">Self-learner</SelectItem>
                    <SelectItem value="educator">Educator / Teacher</SelectItem>
                    <SelectItem value="content_creator">Content Creator</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  Interest level <span className="text-destructive">*</span>
                </Label>
                <Select value={earlyAccessPriority} onValueChange={setEarlyAccessPriority} required>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="How interested?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_interested">Very interested</SelectItem>
                    <SelectItem value="somewhat_interested">Somewhat interested</SelectItem>
                    <SelectItem value="just_exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topics (Optional chips) */}
            <div>
              <Label className="text-sm">
                Topics of interest <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { value: "technical_skills", label: "Tech" },
                  { value: "business_finance", label: "Business" },
                  { value: "academic", label: "Academic" },
                  { value: "creative_skills", label: "Creative" },
                  { value: "language_learning", label: "Languages" },
                  { value: "career_prep", label: "Career" },
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

            {/* Use Case & AI Experience (Optional) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm">
                  Use case <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Select value={useCase} onValueChange={setUseCase}>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_learning_videos">Create videos</SelectItem>
                    <SelectItem value="summarize_concepts">Summarize concepts</SelectItem>
                    <SelectItem value="study_faster">Study faster</SelectItem>
                    <SelectItem value="build_courses">Build courses</SelectItem>
                    <SelectItem value="content_creation">Content creation</SelectItem>
                    <SelectItem value="experimenting">Experimenting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">
                  AI experience <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Select value={aiExperience} onValueChange={setAiExperience}>
                  <SelectTrigger className="mt-2 bg-secondary/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="power_user">Power user</SelectItem>
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
              {formLoading ? "Submitting..." : "Join Waitlist"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
