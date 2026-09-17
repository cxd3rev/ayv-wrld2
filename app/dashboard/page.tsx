import { DashboardRecordButton } from "@/components/dashboard-record-button";
import { Badge } from "@/components/ui/badge";
import { requireWorkspace } from "@/lib/auth/session";
import {
  calculateDashboardMetrics,
  type ClientHealth,
  type ConversionMetric,
} from "@/lib/dashboard-metrics";
import { getDashboardRecords } from "@/services/dashboard";
import { openProductWorkspace } from "@/services/product-switch";
import { ArrowRight, CalendarClock, CircleDollarSign, Link2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

function formatPercent(metric: ConversionMetric, noData: string) {
  return metric.rate == null ? noData : `${metric.rate.toFixed(1)}%`;
}

export default async function DashboardPage() {
  const { organization, profile } = await requireWorkspace();
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const records = await getDashboardRecords(organization.id);
  const today = new Date().toISOString().slice(0, 10);
  const metrics = calculateDashboardMetrics(
    records.leads,
    records.bookings,
    records.quotes,
    records.links,
    today,
  );
  const firstName = profile?.full_name?.split(" ")[0];
  const hasRecords = metrics.raw.leads + metrics.raw.bookings + metrics.raw.quotes > 0;
  const number = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const funnelMax = Math.max(...Object.values(metrics.funnel), 1);
  const productActivity = [
    { product: "avyro", count: metrics.raw.leads, label: t("command.leads") },
    { product: "velto", count: metrics.raw.bookings, label: t("command.bookings") },
    { product: "rovyn", count: metrics.raw.quotes, label: t("command.quotes") },
  ] as const;
  const healthTone = {
    on_track: "success",
    needs_attention: "warning",
    at_risk: "danger",
  } as const;
  const attentionLabels = {
    avyro: t("command.attentionavyro"),
    velto: t("command.attentionvelto"),
    rovyn: t("command.attentionrovyn"),
  };
  const healthLabels = {
    on_track: t("command.health_on_track"),
    needs_attention: t("command.health_needs_attention"),
    at_risk: t("command.health_at_risk"),
  };
  const reasonLabels: Record<ClientHealth["reason"], string> = {
    won: t("command.reason_won"),
    lost: t("command.reason_lost"),
    no_show: t("command.reason_no_show"),
    lost_quote: t("command.reason_lost_quote"),
    severely_overdue: t("command.reason_severely_overdue"),
    overdue: t("command.reason_overdue"),
    cancelled: t("command.reason_cancelled"),
    not_connected: t("command.reason_not_connected"),
    progressing: t("command.reason_progressing"),
  };

  return (
    <div>
      <p className="kicker">{t("command.kicker")}</p>
      <h1 className="display mt-4 text-4xl tracking-tight sm:text-6xl">
        {firstName ? t("command.titleNamed", { name: firstName }) : t("command.title")}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {t("command.subtitle", { organization: organization.name })}
      </p>

      {!hasRecords ? (
        <section className="mt-10 border border-foreground/10 bg-card p-6 sm:p-8">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
            {t("command.emptyKicker")}
          </p>
          <h2 className="display mt-3 text-3xl">{t("command.emptyTitle")}</h2>
          <p className="mt-2 max-w-xl text-muted">{t("command.emptyBody")}</p>
        </section>
      ) : null}

      <section className="mt-10 border-t border-foreground/10 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
              {t("command.connectedJourney")}
            </p>
            <h2 className="display mt-2 text-3xl">{t("command.funnelTitle")}</h2>
          </div>
          <p className="max-w-md text-sm text-muted">{t("command.funnelHelp")}</p>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          {[
            {
              key: "leads",
              label: t("command.leads"),
              value: metrics.funnel.leads,
              raw: metrics.raw.leads,
              brand: "Avyro",
            },
            {
              key: "linkedBookings",
              label: t("command.linkedBookings"),
              value: metrics.funnel.linkedBookings,
              raw: metrics.raw.bookings,
              brand: "Velto",
            },
            {
              key: "linkedQuotes",
              label: t("command.linkedQuotes"),
              value: metrics.funnel.linkedQuotes,
              raw: metrics.raw.quotes,
              brand: "Rovyn",
            },
            {
              key: "wonCustomers",
              label: t("command.wonCustomers"),
              value: metrics.funnel.wonCustomers,
              raw: metrics.raw.wonQuotes,
              brand: "Rovyn",
            },
          ].map((stage) => (
            <article key={stage.key} className="border border-foreground/10 bg-card p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                {stage.brand}
              </p>
              <p className="display mt-5 text-4xl">{number.format(stage.value)}</p>
              <p className="mt-1 text-sm">{stage.label}</p>
              <div className="mt-5 h-1.5 bg-foreground/5" aria-hidden="true">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(stage.value / funnelMax) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted">
                {t("command.rawTotal", { count: stage.raw })}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 border-t border-foreground/10 pt-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
            {t("command.conversions")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                key: "leadToBooking",
                label: t("command.leadToBooking"),
                formula: "command.leadToBookingFormula" as const,
                metric: metrics.conversions.leadToBooking,
              },
              {
                key: "bookingToQuote",
                label: t("command.bookingToQuote"),
                formula: "command.bookingToQuoteFormula" as const,
                metric: metrics.conversions.bookingToQuote,
              },
              {
                key: "quoteWin",
                label: t("command.quoteWin"),
                formula: "command.quoteWinFormula" as const,
                metric: metrics.conversions.quoteWin,
              },
            ].map(({ key, label, formula, metric }) => {
              return (
                <article key={String(key)} className="border border-foreground/10 bg-card p-5">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="display mt-4 text-3xl">
                    {formatPercent(metric, t("command.noData"))}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {t(formula, {
                      numerator: metric.numerator,
                      denominator: metric.denominator,
                    })}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
        <article className="border border-foreground/10 bg-foreground p-5 text-background">
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] uppercase opacity-70">
            <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
            {t("command.pipeline")}
          </div>
          <div className="mt-5 space-y-2">
            {metrics.pipeline.byCurrency.length ? (
              metrics.pipeline.byCurrency.map(({ currency, amount }) => (
                <p key={currency} className="display text-3xl">
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency,
                  }).format(amount)}
                </p>
              ))
            ) : (
              <p className="display text-3xl">{t("command.noData")}</p>
            )}
          </div>
          <p className="mt-4 text-xs opacity-70">
            {t("command.pipelineFormula", {
              valued: metrics.pipeline.valuedQuotes,
              missing: metrics.pipeline.missingAmounts,
            })}
          </p>
        </article>
      </section>

      <section className="mt-10 grid gap-8 border-t border-foreground/10 pt-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
                {t("command.attention")}
              </p>
              <h2 className="display mt-2 text-3xl">{t("command.attentionTitle")}</h2>
            </div>
            <CalendarClock className="h-6 w-6 text-muted" aria-hidden="true" />
          </div>
          <div className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
            {metrics.attention.length ? (
              metrics.attention.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <DashboardRecordButton product={item.product} recordId={item.recordId}>
                      <span className="truncate">{item.name}</span>
                    </DashboardRecordButton>
                    <p className="mt-1 text-xs text-muted">
                      {attentionLabels[item.product]} ·{" "}
                      {date.format(new Date(`${item.date}T00:00:00`))}
                    </p>
                  </div>
                  <Badge tone={item.timing === "upcoming" ? "neutral" : "warning"}>
                    {item.timing === "overdue"
                      ? t("command.daysOverdue", { count: Math.abs(item.days) })
                      : item.timing === "today"
                        ? t("command.today")
                        : t("command.inDays", { count: item.days })}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-sm text-muted">{t("command.attentionEmpty")}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
                {t("command.clientHealth")}
              </p>
              <h2 className="display mt-2 text-3xl">{t("command.clientTitle")}</h2>
            </div>
            <details className="max-w-52 text-right text-xs text-muted">
              <summary className="cursor-pointer font-medium text-foreground">
                {t("command.howCalculated")}
              </summary>
              <p className="mt-2">{t("command.healthRules")}</p>
            </details>
          </div>
          <div className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
            {metrics.clients.length ? (
              metrics.clients.slice(0, 8).map((client) => (
                <div key={client.lead.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <DashboardRecordButton product="avyro" recordId={client.lead.id}>
                      <span className="truncate">{client.lead.name}</span>
                    </DashboardRecordButton>
                    <p className="mt-1 text-xs text-muted">
                      {t("command.connectedCounts", {
                        bookings: client.bookingCount,
                        quotes: client.quoteCount,
                      })}{" "}
                      · {reasonLabels[client.reason]}
                    </p>
                  </div>
                  <Badge tone={healthTone[client.status]}>
                    {healthLabels[client.status]}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-sm text-muted">{t("command.clientsEmpty")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-foreground/10 pt-8">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted" aria-hidden="true" />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
            {t("command.productActivity")}
          </p>
        </div>
        <div className="mt-4 grid border border-foreground/10 sm:grid-cols-3">
          {productActivity.map((item, index) => (
            <form
              key={item.product}
              action={openProductWorkspace}
              className={index < 2 ? "border-b border-foreground/10 sm:border-r sm:border-b-0" : ""}
            >
              <input type="hidden" name="productId" value={item.product} />
              <button
                type="submit"
                className="group flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-card"
              >
                <div>
                  <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                    {item.product === "avyro" ? "Avyro" : item.product === "velto" ? "Velto" : "Rovyn"}
                  </p>
                  <p className="display mt-2 text-3xl">{number.format(item.count)}</p>
                  <p className="text-sm text-muted">{item.label}</p>
                </div>
                <ArrowRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
