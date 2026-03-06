import { Link, NavLink } from "react-router-dom";
import { CheckCircle2, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLink = "text-[15px] font-medium transition-all duration-200 hover:text-foreground";
const emailAddress: string = "krishagarwal278@gmail.com";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core creation tools.",
    features: ["Slideshow generation", "Screenplay generation", "Limited slides per project"],
    cta: "Get started",
    email: emailAddress,
    highlighted: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "/month",
    description: "For individual creators and small teams.",
    features: [
      "Everything in Free",
      "Reels & short-form video",
      "More slides per project",
      "AI voiceover",
      "Basic export options",
    ],
    cta: "Start free trial",
    href: "/",
    highlighted: true,
    icon: Zap,
  },
  {
    name: "Pro+",
    price: "$26.99",
    period: "/month",
    description: "Most powerful models — reels, short-form, cinematic content.",
    features: [
      "Everything in Pro",
      "Latest and most powerful AI models",
      "High-VFX & cinematic-style content",
      "12-slide full presentations",
      "Screenplay + narration script",
      "Compliance mapping, LMS (SCORM) export",
      "Voice cloning",
    ],
    cta: "Start free trial",
    href: "/",
    highlighted: false,
    icon: Zap,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams — full formats, custom needs.",
    features: [
      "Everything in Pro+",
      "Reels, short-form, cinematic at scale",
      "Dedicated support",
      "Custom integrations & SLA",
    ],
    cta: "Contact us",
    email: emailAddress,
    contact: true,
    highlighted: false,
    icon: Building2,
  },
];

export function PricingPage() {
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

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Simple, transparent pricing</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            From course videos to reels, short-form, and cinematic. Start free; upgrade for more
            formats, voiceover, and our most powerful models.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  tier.highlighted ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Popular
                  </div>
                )}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="mb-1 text-xl font-semibold">{tier.name}</h2>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
                <p className="mb-6 text-sm text-muted-foreground">{tier.description}</p>
                <ul className="mb-6 flex-1 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={`mailto:${tier.email}`} className="block">
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Free tier</strong>: slideshow and screenplay only. Pro adds reels, short-form,
            and voiceover. <strong>Pro+</strong>: latest models, high-VFX and cinematic, full
            presentations, LMS export. We're built to overdeliver — more value than a
            general-purpose AI.
            <br />
            <span className="mt-2 inline-block text-primary">
              New users get 100 free credits when you sign up.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
