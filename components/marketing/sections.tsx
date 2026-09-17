import { ArrowRight, LayoutGrid, Repeat, ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { bundleFullMonthly, bundleMonthly, formatPrice } from "@/config/products";

const featureIcons = [LayoutGrid, Zap, Repeat, Users, ShieldCheck, Wallet] as const;
const featureKeys = ["login", "live", "automations", "teams", "secure", "pricing"] as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="relative mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
      <p className="kicker">{t("kicker")}</p>
      <h2 className="display mt-7 max-w-3xl text-4xl leading-[1.02] lg:text-6xl text-balance">
        {t.rich("title", {
          muted: (chunks) => <span className="text-muted">{chunks}</span>,
        })}
      </h2>
      <div className="mt-16 flex flex-col">
        {featureKeys.map((key, index) => {
          const Icon = featureIcons[index];
          return (
            <div
              key={key}
              className="group grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-4 border-t border-border py-10 last:border-b sm:grid-cols-[3rem_1fr_auto] lg:gap-x-12"
            >
              <span className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
              <div className="col-start-2 sm:col-start-2">
                <h3 className="display text-2xl leading-tight lg:text-3xl">{t(`${key}Title`)}</h3>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted text-pretty">{t(`${key}Body`)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 sm:col-start-3 sm:justify-self-end">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-card transition-colors duration-300 group-hover:border-accent/40">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const steps = [
  { numeral: "I", key: "step1" },
  { numeral: "II", key: "step2" },
  { numeral: "III", key: "step3" },
] as const;

const codeLines = [
  "avyro.automate('new-lead', {",
  "  when: 'form.submitted',",
  "  do: [",
  "    'reply.instant',",
  "    'reminder.24h',",
  "    'notify.team',",
  "  ],",
  "})",
];

export function HowItWorks() {
  const t = useTranslations("how");

  return (
    <section id="how" className="relative overflow-hidden bg-[#141210] text-[#f5f3ef]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
          maskImage: "radial-gradient(80% 70% at 30% 30%, black, transparent 80%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <p className="kicker text-white/60">{t("kicker")}</p>
        <h2 className="display mt-7 max-w-3xl text-4xl leading-[1.02] lg:text-6xl text-balance">
          {t.rich("title", {
            muted: (chunks) => <span className="text-white/55">{chunks}</span>,
          })}
        </h2>
        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:items-center">
          <ol className="flex flex-col">
            {steps.map((step) => (
              <li key={step.numeral} className="border-t border-white/10 py-8 first:border-t-0 first:pt-0">
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-sm text-white/45">{step.numeral}</span>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight lg:text-2xl">{t(`${step.key}Title`)}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60 text-pretty lg:text-base">
                      {t(`${step.key}Body`)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/50 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <span className="font-mono text-xs text-white/40">avyro.config.ts</span>
            </div>
            <pre className="overflow-x-auto px-6 py-6 font-mono text-sm leading-relaxed">
              <code>
                {codeLines.map((line, index) => (
                  <span key={index} className="grid grid-cols-[1.5rem_1fr] gap-4">
                    <span className="select-none text-white/25">{index + 1}</span>
                    <span className="text-white/85">{line}</span>
                  </span>
                ))}
              </code>
            </pre>
            <div className="flex items-center gap-2 border-t border-white/10 px-6 py-3.5">
              <span className="h-2 w-2 rounded-full bg-[#00c853]" />
              <span className="font-mono text-xs text-white/50">{t("ready")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BundleOffer() {
  const t = useTranslations("bundle");
  const tCommon = useTranslations("common");

  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-card p-8 lg:p-12">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <p className="kicker">{t("kicker")}</p>
            <Badge tone="accent">{tCommon("save50")}</Badge>
          </div>
          <h3 className="display mt-5 text-3xl tracking-tight lg:text-4xl">{t("title")}</h3>
          <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{t("body")}</p>
        </div>
        <div className="flex flex-col items-start gap-5 lg:items-end">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-lg text-muted line-through">{formatPrice(bundleFullMonthly)}</span>
            <span className="display text-4xl tracking-tight lg:text-5xl">{formatPrice(bundleMonthly)}</span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{tCommon("perMonth")}</span>
          </div>
          <Link
            href="/signup"
            className="group inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {t("cta")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FinalCta() {
  const t = useTranslations("cta");
  const tNav = useTranslations("nav");

  return (
    <section className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-20 text-center lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(60% 80% at 50% 0%, rgba(22,19,15,0.05), transparent 65%)",
          }}
        />
        <div className="relative">
          <h2 className="display mx-auto max-w-3xl text-4xl leading-[1.02] lg:text-7xl text-balance">{t("title")}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">{t("body")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              {tNav("signup")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-card px-8 text-base font-medium transition-colors hover:bg-card-hover"
            >
              {tNav("login")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
