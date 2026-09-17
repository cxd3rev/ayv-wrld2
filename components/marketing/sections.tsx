import { ArrowRight, LayoutGrid, Repeat, ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: LayoutGrid,
    title: "One login, every tool",
    body: "Access every AYV product from a single account and a shared workspace. No juggling logins or stitching tools together.",
  },
  {
    icon: Zap,
    title: "Live in minutes",
    body: "Create an account, tell us about your business, and start. Each tool is built to be running the same day you sign up.",
  },
  {
    icon: Repeat,
    title: "Automations that run themselves",
    body: "Set the rules once. Follow-ups, reminders, and requests go out on their own so nothing slips through the cracks.",
  },
  {
    icon: Users,
    title: "Built for small teams",
    body: "No enterprise overhead. Everything is designed for owners and lean teams who need results, not a manual.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Your customer data stays protected with modern authentication and per-account isolation from day one.",
  },
  {
    icon: Wallet,
    title: "Fair, simple pricing",
    body: "Pay for the tools you actually use. Clear pricing lands with each product as it becomes available.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
      <p className="kicker">The platform</p>
      <h2 className="display mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight lg:text-6xl text-balance">
        Everything you need.
        <span className="mt-1 block text-muted">Nothing you don&apos;t.</span>
      </h2>
      <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="bg-card p-8 transition-colors duration-300 hover:bg-card-hover">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background">
              <feature.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-lg font-medium tracking-tight">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Create your account",
    body: "Sign up in seconds with your email. One AYV WRLD account unlocks every tool as it launches.",
  },
  {
    title: "Set up your business",
    body: "Tell us who you serve and how you work. We tailor each tool to your industry and workflow.",
  },
  {
    title: "Let it run",
    body: "Turn on the automations that fit you. Leads, bookings, quotes, and payments handle themselves.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden border-y border-border">
      <div className="arch-grid" />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <p className="kicker">How it works</p>
        <h2 className="display mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight lg:text-6xl text-balance">
          Three steps from signup to running.
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="border-t border-border pt-6">
              <span className="display text-5xl text-accent">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-xl font-medium tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
      <div className="hero-frame relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-20 text-center lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 80% at 50% 0%, rgba(216,173,85,0.12), transparent 65%)",
          }}
        />
        <div className="relative">
          <h2 className="display mx-auto max-w-3xl text-4xl leading-[1.02] tracking-tight lg:text-7xl text-balance">
            Start turning work into <span className="headline-mark">revenue.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Create your AYV WRLD account today and be ready the moment each tool goes live.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-14 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Get started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full border border-border px-8 text-base font-medium hover:bg-card-hover"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
