"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatPrice } from "@/config/products";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { quoteStatuses } from "@/lib/validations";
import {
  createQuote,
  deleteQuote,
  updateQuoteFollowUp,
  updateQuoteStatus,
} from "@/products/rovyn/actions";
import type { Quote, QuoteStatus } from "@/types/database";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const statusTone: Record<QuoteStatus, "accent" | "warning" | "success" | "danger"> = {
  sent: "accent",
  followed_up: "warning",
  won: "success",
  lost: "danger",
};

const statusLabel: Record<QuoteStatus, string> = {
  sent: "Sent",
  followed_up: "Followed up",
  won: "Won",
  lost: "Lost",
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatFollowUp(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en", {
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

function formatQuoteAmount(value: Quote["amount"]) {
  const amount = quoteAmount(value);
  return amount == null ? "—" : formatPrice(amount);
}

export function RovynQuotesWorkspace({ quotes }: { quotes: Quote[] }) {
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

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createQuote(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add this quote.");
      return;
    }
    toast({ title: "Quote added", tone: "success" });
    (document.getElementById("rovyn-add-quote") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title="Sent" value={String(counts.sent)} hint="Waiting on a reply" />
        <DashboardCard title="Followed up" value={String(counts.followedUp)} hint="Nudged already" />
        <DashboardCard title="Won" value={String(counts.won)} hint="Became booked work" />
        <DashboardCard title="Due" value={String(counts.due)} hint="Follow-up date reached" />
      </div>

      <form
        id="rovyn-add-quote"
        action={onAdd}
        className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="md:col-span-2 lg:col-span-4">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Add a quote</p>
        </div>
        <div>
          <Label htmlFor="customerName">Customer</Label>
          <Input id="customerName" name="customerName" placeholder="Sam Ortiz" required />
        </div>
        <div>
          <Label htmlFor="title">Quote for</Label>
          <Input id="title" name="title" placeholder="Kitchen remodel" required />
        </div>
        <div>
          <Label htmlFor="amount">Amount (€)</Label>
          <Input id="amount" name="amount" inputMode="decimal" placeholder="2400" />
        </div>
        <div>
          <Label htmlFor="followUpOn">Follow up on</Label>
          <Input id="followUpOn" name="followUpOn" type="date" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="sam@business.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="Optional" />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="What you quoted, anything to remember" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Adding..." : "Add quote"}
          </Button>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-8">
        {quotes.length === 0 ? (
          <EmptyState
            title="No quotes yet"
            description="Add a quote you just sent. Rovyn keeps the follow-up in this workspace so proposals do not go cold."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Customer</TH>
                <TH>Quote</TH>
                <TH>Status</TH>
                <TH>Follow up</TH>
                <TH>Notes</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {quotes.map((quote) => (
                <TR key={quote.id}>
                  <TD>
                    <p className="font-medium">{quote.customer_name}</p>
                    {quote.email ? <p className="mt-1 text-muted">{quote.email}</p> : null}
                    {quote.phone ? <p className="mt-1 text-xs text-muted">{quote.phone}</p> : null}
                    {isFollowUpDue(quote) ? (
                      <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-warning uppercase">
                        Follow up today
                      </p>
                    ) : null}
                  </TD>
                  <TD>
                    <p>{quote.title}</p>
                    <p className="mt-1 text-muted">{formatQuoteAmount(quote.amount)}</p>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone[quote.status]}>{statusLabel[quote.status]}</Badge>
                      <select
                        aria-label={`Status for ${quote.customer_name}`}
                        className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                        defaultValue={quote.status}
                        onChange={async (event) => {
                          const result = await updateQuoteStatus(quote.id, event.target.value);
                          if (!result.ok) {
                            toast({ title: result.error ?? "Could not update status", tone: "error" });
                            return;
                          }
                          toast({ title: "Status updated", tone: "success" });
                          router.refresh();
                        }}
                      >
                        {quoteStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TD>
                  <TD>
                    <input
                      type="date"
                      aria-label={`Follow-up date for ${quote.customer_name}`}
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
                        toast({ title: "Follow-up saved", tone: "success" });
                        router.refresh();
                      }}
                    />
                    {quote.follow_up_on ? (
                      <p className="mt-1 text-xs text-muted">{formatFollowUp(quote.follow_up_on)}</p>
                    ) : null}
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
                        toast({ title: "Quote removed", tone: "success" });
                        router.refresh();
                      }}
                    >
                      Remove
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
