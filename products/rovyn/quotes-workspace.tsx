"use client";

import {
  ConnectedRecords,
  IncomingLinkFields,
} from "@/components/connections/connected-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { RecordPrefill } from "@/lib/record-entities";
import { recordProductName } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { quoteCurrencies, quoteStatuses } from "@/lib/validations";
import {
  createQuote,
  deleteQuote,
  updateQuoteFollowUp,
  updateQuoteStatus,
} from "@/products/rovyn/actions";
import type { Booking, Lead, Quote, QuoteStatus, RecordLink } from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<QuoteStatus, "accent" | "warning" | "success" | "danger"> = {
  sent: "accent",
  followed_up: "warning",
  won: "success",
  lost: "danger",
};

const statusKeys: Record<QuoteStatus, "statusSent" | "statusFollowedUp" | "statusWon" | "statusLost"> = {
  sent: "statusSent",
  followed_up: "statusFollowedUp",
  won: "statusWon",
  lost: "statusLost",
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatFollowUp(value: string | null, locale: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function isOpenQuote(quote: Quote) {
  return quote.status === "sent" || quote.status === "followed_up";
}

function isFollowUpDue(quote: Quote) {
  if (!quote.follow_up_on) return false;
  if (!isOpenQuote(quote)) return false;
  return quote.follow_up_on <= todayIsoDate();
}

function quoteAmount(value: Quote["amount"]) {
  if (value == null || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function formatQuoteAmount(value: Quote["amount"], currency: string, locale: string) {
  const amount = quoteAmount(value);
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function RovynQuotesWorkspace({
  quotes,
  leads,
  bookings,
  links,
  prefill,
  focusQuoteId,
}: {
  quotes: Quote[];
  leads: Lead[];
  bookings: Booking[];
  links: RecordLink[];
  prefill?: RecordPrefill;
  focusQuoteId?: string;
}) {
  const t = useTranslations("rovyn");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const counts = useMemo(() => {
    return {
      sent: quotes.filter((quote) => quote.status === "sent").length,
      followedUp: quotes.filter((quote) => quote.status === "followed_up").length,
      won: quotes.filter((quote) => quote.status === "won").length,
      due: quotes.filter(isFollowUpDue).length,
    };
  }, [quotes]);

  useEffect(() => {
    if (!focusQuoteId) return;
    document.getElementById(`quote-${focusQuoteId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusQuoteId]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createQuote(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add this quote.");
      return;
    }
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("rovyn-add-quote") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title={t("sent")} value={String(counts.sent)} hint={t("sentHint")} />
        <DashboardCard title={t("followedUp")} value={String(counts.followedUp)} hint={t("followedUpHint")} />
        <DashboardCard title={t("won")} value={String(counts.won)} hint={t("wonHint")} />
        <DashboardCard title={t("due")} value={String(counts.due)} hint={t("dueHint")} />
      </div>

      <form
        id="rovyn-add-quote"
        action={onAdd}
        className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="md:col-span-2 lg:col-span-4">
          <IncomingLinkFields prefillProduct={prefill?.product} prefillId={prefill?.id} />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addQuote")}</p>
          {prefill ? (
            <p className="mt-2 text-sm text-muted">
              {t("prefill", { name: prefill.name, product: recordProductName(prefill.product) })}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="customerName">{t("customer")}</Label>
          <Input
            id="customerName"
            name="customerName"
            placeholder="Sam Ortiz"
            required
            defaultValue={prefill?.name ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="title">{t("quoteFor")}</Label>
          <Input
            id="title"
            name="title"
            placeholder="Kitchen remodel"
            required
            defaultValue={prefill?.title ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="amount">{t("amount")}</Label>
          <div className="flex gap-2">
            <Input id="amount" name="amount" inputMode="decimal" placeholder="2400" />
            <select
              id="currency"
              name="currency"
              aria-label={t("currency")}
              defaultValue="EUR"
              className="h-10 rounded-md border border-foreground/15 bg-card px-2 text-sm"
            >
              {quoteCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="followUpOn">{t("followUpOn")}</Label>
          <Input id="followUpOn" name="followUpOn" type="date" />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="sam@business.com"
            defaultValue={prefill?.email ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder={tCommon("optional")}
            defaultValue={prefill?.phone ?? ""}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("adding") : t("add")}
          </Button>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-8">
        {quotes.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyBody")}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("colQuote")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH>{t("colFollowUp")}</TH>
                <TH>{t("colConnected")}</TH>
                <TH>{t("colNotes")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {quotes.map((quote) => {
                const focused = focusQuoteId === quote.id;
                return (
                  <TR
                    key={quote.id}
                    id={`quote-${quote.id}`}
                    className={cn(focused && "bg-accent-soft")}
                  >
                    <TD>
                      <p className="font-medium">{quote.customer_name}</p>
                      {quote.email ? <p className="mt-1 text-muted">{quote.email}</p> : null}
                      {quote.phone ? <p className="mt-1 text-xs text-muted">{quote.phone}</p> : null}
                      {isFollowUpDue(quote) ? (
                        <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-warning uppercase">
                          {t("followUpToday")}
                        </p>
                      ) : null}
                    </TD>
                    <TD>
                      <p>{quote.title}</p>
                      <p className="mt-1 text-muted">
                        {formatQuoteAmount(quote.amount, quote.currency, locale)}
                      </p>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone[quote.status]}>{t(statusKeys[quote.status])}</Badge>
                        <select
                          aria-label={t("statusFor", { name: quote.customer_name })}
                          className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                          defaultValue={quote.status}
                          onChange={async (event) => {
                            const result = await updateQuoteStatus(quote.id, event.target.value);
                            if (!result.ok) {
                              toast({ title: result.error ?? "Could not update status", tone: "error" });
                              return;
                            }
                            toast({ title: t("statusUpdated"), tone: "success" });
                            router.refresh();
                          }}
                        >
                          {quoteStatuses.map((status) => (
                            <option key={status} value={status}>
                              {t(statusKeys[status])}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TD>
                    <TD>
                      <input
                        type="date"
                        aria-label={t("followUpFor", { name: quote.customer_name })}
                        defaultValue={quote.follow_up_on ?? ""}
                        className={cn(
                          "h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm",
                          isFollowUpDue(quote) && "border-warning/40 text-warning",
                        )}
                        onChange={async (event) => {
                          const result = await updateQuoteFollowUp(quote.id, event.target.value);
                          if (!result.ok) {
                            toast({ title: result.error ?? "Could not save follow-up", tone: "error" });
                            return;
                          }
                          toast({ title: t("followUpSaved"), tone: "success" });
                          router.refresh();
                        }}
                      />
                      {quote.follow_up_on ? (
                        <p className="mt-1 text-xs text-muted">{formatFollowUp(quote.follow_up_on, locale)}</p>
                      ) : null}
                    </TD>
                    <TD>
                      <ConnectedRecords
                        product="rovyn"
                        recordId={quote.id}
                        links={links}
                        leads={leads}
                        bookings={bookings}
                        quotes={quotes}
                      />
                    </TD>
                    <TD className="max-w-xs text-muted">{quote.notes || "—"}</TD>
                    <TD className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const result = await deleteQuote(quote.id);
                          if (!result.ok) {
                            toast({ title: result.error ?? "Could not remove quote", tone: "error" });
                            return;
                          }
                          toast({ title: t("removed"), tone: "success" });
                          router.refresh();
                        }}
                      >
                        {t("remove")}
                      </Button>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
