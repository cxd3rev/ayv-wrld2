"use client";

import { DashboardRecordButton } from "@/components/dashboard-record-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ClientHealth } from "@/lib/dashboard-metrics";
import type { BookingStatus, QuoteStatus } from "@/types/database";
import { CalendarClock, ChevronDown, Mail, Phone, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type HealthFilter = "all" | ClientHealth["status"];

const healthTone = {
  on_track: "success",
  needs_attention: "warning",
  at_risk: "danger",
} as const;

const bookingStatusKeys: Record<
  BookingStatus,
  "statusScheduled" | "statusConfirmed" | "statusCompleted" | "statusCancelled" | "statusNoShow"
> = {
  scheduled: "statusScheduled",
  confirmed: "statusConfirmed",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
  no_show: "statusNoShow",
};

const quoteStatusKeys: Record<
  QuoteStatus,
  "statusSent" | "statusFollowedUp" | "statusWon" | "statusLost"
> = {
  sent: "statusSent",
  followed_up: "statusFollowedUp",
  won: "statusWon",
  lost: "statusLost",
};

function parseDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date(value);
}

export function ClientDirectory({ clients }: { clients: ClientHealth[] }) {
  const t = useTranslations("dashboard.command");
  const tVelto = useTranslations("velto");
  const tRovyn = useTranslations("rovyn");
  const tOrvyn = useTranslations("orvyn");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<HealthFilter>("all");
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const date = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }),
    [locale],
  );

  const healthLabels = {
    on_track: t("health_on_track"),
    needs_attention: t("health_needs_attention"),
    at_risk: t("health_at_risk"),
  };
  const reasonLabels: Record<ClientHealth["reason"], string> = {
    won: t("reason_won"),
    lost: t("reason_lost"),
    no_show: t("reason_no_show"),
    lost_quote: t("reason_lost_quote"),
    severely_overdue: t("reason_severely_overdue"),
    overdue: t("reason_overdue"),
    cancelled: t("reason_cancelled"),
    not_connected: t("reason_not_connected"),
    progressing: t("reason_progressing"),
  };
  const counts = {
    all: clients.length,
    on_track: clients.filter((client) => client.status === "on_track").length,
    needs_attention: clients.filter((client) => client.status === "needs_attention").length,
    at_risk: clients.filter((client) => client.status === "at_risk").length,
  };
  const filteredClients = clients.filter((client) => {
    const matchesHealth = health === "all" || client.status === health;
    const searchable = [client.lead.name, client.lead.email, client.lead.phone]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase(locale);
    return matchesHealth && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  return (
    <section className="mt-10 border-t border-foreground/10 pt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
            {t("clientHealth")}
          </p>
          <h2 className="display mt-2 text-3xl">{t("directoryTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{t("directoryHelp")}</p>
        </div>
        <details className="text-sm text-muted lg:max-w-sm lg:text-right">
          <summary className="cursor-pointer font-medium text-foreground">
            {t("howCalculated")}
          </summary>
          <p className="mt-2">{t("healthRules")}</p>
        </details>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {(["all", "on_track", "needs_attention", "at_risk"] as const).map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={health === status}
            onClick={() => setHealth(status)}
            className={`workspace-card px-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
              health === status ? "border-white/30 bg-white/[0.08]" : ""
            }`}
          >
            <span className="display block text-2xl">{counts[status]}</span>
            <span className="mt-1 block text-xs text-muted">
              {status === "all" ? t("filterAll") : healthLabels[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="relative block">
          <span className="sr-only">{t("searchLabel")}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-11"
          />
        </label>
        <label>
          <span className="sr-only">{t("healthFilterLabel")}</span>
          <Select value={health} onChange={(event) => setHealth(event.target.value as HealthFilter)}>
            <option value="all">{t("filterAllHealth")}</option>
            <option value="on_track">{healthLabels.on_track}</option>
            <option value="needs_attention">{healthLabels.needs_attention}</option>
            <option value="at_risk">{healthLabels.at_risk}</option>
          </Select>
        </label>
      </div>

      <p className="mt-4 text-xs text-muted" aria-live="polite">
        {t("resultsCount", { count: filteredClients.length })}
      </p>

      <div className="workspace-card mt-2 divide-y divide-white/10 px-4">
        {filteredClients.length ? (
          filteredClients.map((client) => {
            const activeQuoteValues = new Map<string, number>();
            client.quotes
              .filter((quote) => quote.status === "sent" || quote.status === "followed_up")
              .forEach((quote) => {
                const amount = Number(quote.amount);
                if (quote.amount !== null && quote.amount !== "" && Number.isFinite(amount)) {
                  activeQuoteValues.set(
                    quote.currency,
                    (activeQuoteValues.get(quote.currency) ?? 0) + amount,
                  );
                }
              });
            const valueLabel = [...activeQuoteValues]
              .map(([currency, amount]) =>
                new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount),
              )
              .join(" · ");
            const nextActions = [
              client.lead.follow_up_on &&
              (client.lead.status === "new" || client.lead.status === "contacted")
                ? { date: client.lead.follow_up_on, label: t("nextLeadFollowUp") }
                : null,
              ...client.bookings
                .filter(
                  (booking) =>
                    booking.status === "scheduled" || booking.status === "confirmed",
                )
                .map((booking) => ({
                  date: booking.reminder_on ?? booking.starts_on,
                  label: booking.reminder_on ? t("nextBookingReminder") : t("nextBooking"),
                })),
              ...client.quotes
                .filter((quote) => quote.status === "sent" || quote.status === "followed_up")
                .filter((quote) => Boolean(quote.follow_up_on))
                .map((quote) => ({
                  date: quote.follow_up_on!,
                  label: t("nextQuoteFollowUp"),
                })),
              ...client.invoices
                .filter((invoice) => invoice.status === "sent" || invoice.status === "overdue")
                .filter((invoice) => Boolean(invoice.next_reminder_on))
                .map((invoice) => ({
                  date: invoice.next_reminder_on!,
                  label: t("nextInvoiceReminder"),
                })),
            ]
              .filter((item): item is { date: string; label: string } => Boolean(item))
              .sort((a, b) => a.date.localeCompare(b.date))[0];
            const latestActivity = [
              client.lead.updated_at,
              ...client.bookings.map((booking) => booking.updated_at),
              ...client.quotes.map((quote) => quote.updated_at),
              ...client.invoices.map((invoice) => invoice.updated_at),
            ].sort((a, b) => b.localeCompare(a))[0];
            const stage = client.quotes.length
              ? t("stageQuote")
              : client.bookings.length
                ? t("stageBooking")
                : t("stageLead");

            return (
              <details key={client.lead.id} className="group">
                <summary className="grid cursor-pointer list-none gap-4 px-1 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:grid-cols-[minmax(0,1.4fr)_minmax(9rem,0.7fr)_minmax(10rem,0.9fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{client.lead.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      {client.lead.email ? <span>{client.lead.email}</span> : null}
                      {client.lead.phone ? <span>{client.lead.phone}</span> : null}
                      {!client.lead.email && !client.lead.phone ? <span>{t("noContact")}</span> : null}
                    </div>
                  </div>
                  <div>
                    <Badge tone={healthTone[client.status]}>{healthLabels[client.status]}</Badge>
                    <p className="mt-1 text-xs text-muted">{stage} · {reasonLabels[client.reason]}</p>
                  </div>
                  <div className="text-sm">
                    {nextActions ? (
                      <>
                        <p className="font-medium">{nextActions.label}</p>
                        <p className="mt-1 text-xs text-muted">{date.format(parseDate(nextActions.date))}</p>
                      </>
                    ) : (
                      <p className="text-muted">{t("noNextAction")}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="text-xs text-muted">
                      {t("connectedCounts", {
                        bookings: client.bookingCount,
                        quotes: client.quoteCount,
                        invoices: client.invoiceCount,
                      })}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                </summary>

                <div className="grid gap-6 bg-card px-4 py-5 sm:px-6 lg:grid-cols-4">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                      {t("clientDetails")}
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      {client.lead.email ? (
                        <a className="flex items-center gap-2 hover:text-accent" href={`mailto:${client.lead.email}`}>
                          <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                          <span className="truncate">{client.lead.email}</span>
                        </a>
                      ) : null}
                      {client.lead.phone ? (
                        <a className="flex items-center gap-2 hover:text-accent" href={`tel:${client.lead.phone}`}>
                          <Phone className="h-4 w-4 text-muted" aria-hidden="true" />
                          {client.lead.phone}
                        </a>
                      ) : null}
                      <p className="flex items-center gap-2 text-muted">
                        <CalendarClock className="h-4 w-4" aria-hidden="true" />
                        {t("lastActivity", { date: date.format(new Date(latestActivity)) })}
                      </p>
                      {valueLabel ? (
                        <p>
                          <span className="text-muted">{t("openValue")}: </span>
                          <span className="font-medium">{valueLabel}</span>
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <DashboardRecordButton product="avyro" recordId={client.lead.id}>
                        {t("reviewLead")}
                      </DashboardRecordButton>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                      Velto · {t("bookings")}
                    </p>
                    <div className="mt-3 space-y-3">
                      {client.bookings.length ? (
                        client.bookings.map((booking) => (
                          <div key={booking.id}>
                            <DashboardRecordButton product="velto" recordId={booking.id}>
                              {booking.service}
                            </DashboardRecordButton>
                            <p className="mt-1 text-xs text-muted">
                              {date.format(parseDate(booking.starts_on))} ·{" "}
                              {tVelto(bookingStatusKeys[booking.status])}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted">{t("noBookings")}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                      Rovyn · {t("quotes")}
                    </p>
                    <div className="mt-3 space-y-3">
                      {client.quotes.length ? (
                        client.quotes.map((quote) => {
                          const amount = Number(quote.amount);
                          const formattedAmount =
                            quote.amount !== null &&
                            quote.amount !== "" &&
                            Number.isFinite(amount)
                              ? new Intl.NumberFormat(locale, {
                                  style: "currency",
                                  currency: quote.currency,
                                }).format(amount)
                              : null;
                          return (
                            <div key={quote.id}>
                              <DashboardRecordButton product="rovyn" recordId={quote.id}>
                                {quote.title}
                              </DashboardRecordButton>
                              <p className="mt-1 text-xs text-muted">
                                {tRovyn(quoteStatusKeys[quote.status])}
                                {formattedAmount ? ` · ${formattedAmount}` : ""}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted">{t("noQuotes")}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                      Orvyn · {t("invoices")}
                    </p>
                    <div className="mt-3 space-y-3">
                      {client.invoices.length ? client.invoices.map((invoice) => (
                        <div key={invoice.id}>
                          <DashboardRecordButton product="orvyn" recordId={invoice.id}>
                            {invoice.invoice_number}
                          </DashboardRecordButton>
                          <p className="mt-1 text-xs text-muted">
                            {tOrvyn(invoice.status === "draft" ? "statusDraft" : invoice.status === "sent" ? "statusSent" : invoice.status === "overdue" ? "statusOverdue" : invoice.status === "paid" ? "statusPaid" : "statusVoid")}
                          </p>
                        </div>
                      )) : <p className="text-sm text-muted">{t("noInvoices")}</p>}
                    </div>
                  </div>
                </div>
              </details>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="font-medium">{clients.length ? t("noResultsTitle") : t("clientsEmpty")}</p>
            <p className="mt-1 text-sm text-muted">
              {clients.length ? t("noResultsBody") : t("clientsEmptyHelp")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
