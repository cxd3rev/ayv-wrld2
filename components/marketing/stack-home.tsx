import { automationBrand } from "@/config/brands";
import { formatPrice, products } from "@/config/products";
import { getStackCopy, stackMarketing } from "@/config/stack-marketing";
import type { AppLocale } from "@/i18n/config";
import { CalendarClock, Check, MessageSquareText, Receipt, RefreshCw, Sparkles, Star, UserRoundPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const moduleIcons = {
  avyro: UserRoundPlus,
  velto: CalendarClock,
  rovyn: MessageSquareText,
  orvyn: Receipt,
  nexro: RefreshCw,
  ravelo: Star,
} as const;

export function StackHome({ locale }: { locale: AppLocale }) {
  const c = getStackCopy(locale);
  // Display prices only. Stripe checkout still bills the existing per-module
  // prices (Avyro and Velto €40, Rovyn and Orvyn €70). There is no Stripe
  // price for Starter €39, Growth €79, or Full Stack €149.
  const tiers = [
    { key: "starter" as const, name: c.pricing.starter, body: c.pricing.starterBody, price: formatPrice(39, locale), features: c.pricing.starterFeatures, href: "/signup", cta: c.pricing.starterCta, featured: false },
    { key: "growth" as const, name: c.pricing.growth, body: c.pricing.growthBody, price: formatPrice(79, locale), features: c.pricing.growthFeatures, href: "/signup", cta: c.pricing.growthCta, featured: true },
    { key: "full" as const, name: c.pricing.stack, body: c.pricing.stackBody, price: formatPrice(149, locale), features: c.pricing.stackFeatures, href: "/signup", cta: c.pricing.stackCta, featured: false },
  ];

  return (
    <main id="main-content">
      <section className="relative overflow-hidden">
        <div className="bloom-pink" aria-hidden />
        <div className="bloom-navy" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
          <div className="fade-up">
            <p className="inline-flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4" />
              {c.hero.eyebrow}
            </p>
            <h1 className="display mt-5 max-w-xl text-5xl leading-[0.98] text-balance sm:text-6xl lg:text-7xl">{c.hero.title}</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65">{c.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="button-primary">{c.hero.primary}</Link>
              <Link href="#modules" className="button-secondary">{c.hero.secondary}</Link>
            </div>
          </div>
          {/* PLACEHOLDER: swap this styled frame for a real product screenshot. */}
          <div className="fade-up relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(190,90,180,0.35),transparent_68%)] blur-2xl" aria-hidden />
            <div className="glass-card relative rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Image src={automationBrand.logo} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                  <span className="text-sm font-medium">Workspace</span>
                </div>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60">Live</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs text-white/50">{stackMarketing[product.id].name}</p>
                    <p className="mt-3 text-lg font-semibold">{product.status === "active" ? "On" : "Soon"}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -left-2 bottom-10 z-10 hidden min-w-40 rounded-2xl border border-white/15 bg-black/85 px-4 py-3 text-sm whitespace-nowrap shadow-xl sm:block">
              <p className="text-white/50">New lead</p>
              <p className="font-medium">Follow-up sent</p>
            </div>
            <div className="absolute -right-1 top-8 z-10 hidden min-w-40 rounded-2xl border border-white/15 bg-black/85 px-4 py-3 text-sm whitespace-nowrap shadow-xl md:block">
              <p className="text-white/50">Invoice</p>
              <p className="font-medium">Reminder queued</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLACEHOLDER: trusted-by logos. Uncomment when real client marks exist.
      <section aria-label="Trusted by" className="border-y border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 opacity-60">
          <span>Client</span>
        </div>
      </section>
      */}

      <section id="modules" className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-sm text-white/60"><Sparkles className="h-4 w-4" />{c.modules.eyebrow}</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">{c.modules.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/65">{c.modules.body}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = moduleIcons[product.id];
            const marketing = c.moduleCopy[product.id];
            return (
              <article key={product.id} className="glass-card flex min-h-64 flex-col justify-between rounded-3xl p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{stackMarketing[product.id].name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{marketing.line}</p>
                  <ul className="mt-4 space-y-2 text-sm text-white/75">
                    {marketing.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" />{feature}</li>
                    ))}
                  </ul>
                </div>
                <Link href={product.marketingRoute} className="mt-8 inline-flex text-sm font-medium text-white/90 hover:text-white">
                  {c.modules.learn}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden border-y border-white/10 py-20 lg:py-28">
        <div className="bloom-pink" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm text-white/60"><Sparkles className="h-4 w-4" />{c.pricing.eyebrow}</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">{c.pricing.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/65">{c.pricing.body}</p>
          </div>
          <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article key={tier.key} className={tier.featured ? "glass-card is-featured relative z-10 flex flex-col rounded-3xl p-7" : "glass-card flex flex-col rounded-3xl p-7"}>
                {tier.featured ? <p className="text-xs font-medium uppercase tracking-[0.16em] text-white">{c.pricing.growthBadge}</p> : null}
                <h3 className="mt-3 text-lg text-white">{tier.name}</h3>
                <p className="display mt-4 text-5xl text-white">{tier.price}<span className="ml-1 text-lg font-medium text-white/50">{c.pricing.month}</span></p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{tier.body}</p>
                <ul className="mt-8 space-y-3 text-sm text-white/60">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />{feature}</li>
                  ))}
                </ul>
                <Link href={tier.href} className={tier.featured ? "button-primary mt-8" : "button-secondary mt-8"}>{tier.cta}</Link>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-white/60">{c.pricing.note}</p>
        </div>
      </section>

      <section id="how" className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
        <p className="inline-flex items-center gap-2 text-sm text-white/60"><Sparkles className="h-4 w-4" />{c.how.eyebrow}</p>
        <h2 className="display mt-4 max-w-2xl text-4xl sm:text-5xl">{c.how.title}</h2>
        <ol className="mt-12 grid gap-4 lg:grid-cols-3">
          {c.how.steps.map((step, index) => (
            <li key={step.title} className="glass-card rounded-3xl p-7">
              <span className="text-sm text-white/45">0{index + 1}</span>
              <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* PLACEHOLDER: replace these quotes with real customer testimonials. */}
      <section className="border-y border-white/10 py-20">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <p className="text-sm text-white/50">{c.proof.eyebrow}</p>
          <h2 className="display mt-3 text-4xl">{c.proof.title}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {["A", "B", "C"].map((slot) => (
              <article key={slot} className="glass-card rounded-3xl p-6 text-sm leading-relaxed text-white/55">
                Testimonial {slot}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
        <p className="inline-flex items-center gap-2 text-sm text-white/60"><Sparkles className="h-4 w-4" />{c.faq.eyebrow}</p>
        <h2 className="display mt-4 text-4xl">{c.faq.title}</h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {c.faq.items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none text-lg font-medium">{item.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
