"use client";

import { ConnectedRecords, IncomingLinkFields } from "@/components/connections/connected-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { recordProductName, type RecordPrefill } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { invoiceStatuses, quoteCurrencies } from "@/lib/validations";
import {
  createInvoice,
  deleteInvoice,
  updateInvoiceReminder,
  updateInvoiceStatus,
} from "@/products/orvyn/actions";
import type {
  Booking,
  Invoice,
  InvoiceStatus,
  Lead,
  Quote,
  RecordLink,
} from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<InvoiceStatus, "neutral" | "accent" | "warning" | "success"> = {
  draft: "neutral",
  sent: "accent",
  overdue: "warning",
  paid: "success",
  void: "neutral",
};

const statusKeys: Record<InvoiceStatus, "statusDraft" | "statusSent" | "statusOverdue" | "statusPaid" | "statusVoid"> = {
  draft: "statusDraft",
  sent: "statusSent",
  overdue: "statusOverdue",
  paid: "statusPaid",
  void: "statusVoid",
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isOpen(invoice: Invoice) {
  return invoice.status === "sent" || invoice.status === "overdue";
}

function isDue(invoice: Invoice) {
  return isOpen(invoice) && invoice.due_on < todayIsoDate();
}

function formatMoney(value: Invoice["amount"], currency: string, locale: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)
    : "—";
}

export function OrvynInvoicesWorkspace({
  invoices,
  leads,
  bookings,
  quotes,
  links,
  prefill,
  focusInvoiceId,
}: {
  invoices: Invoice[];
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  links: RecordLink[];
  prefill?: RecordPrefill;
  focusInvoiceId?: string;
}) {
  const t = useTranslations("orvyn");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const today = todayIsoDate();

  const counts = useMemo(
    () => {
      const outstanding = new Map<string, number>();
      invoices.filter(isOpen).forEach((invoice) => {
        outstanding.set(
          invoice.currency,
          (outstanding.get(invoice.currency) ?? 0) + (Number(invoice.amount) || 0),
        );
      });
      return {
        open: invoices.filter(isOpen).length,
        overdue: invoices.filter(isDue).length,
        paid: invoices.filter((invoice) => invoice.status === "paid").length,
        outstanding: [...outstanding.entries()],
      };
    },
    [invoices],
  );
  const visibleInvoices = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle) return invoices;
    return invoices.filter((invoice) =>
      [invoice.invoice_number, invoice.customer_name, invoice.description, invoice.email, invoice.phone, invoice.notes].some((value) =>
        value?.toLocaleLowerCase(locale).includes(needle),
      ),
    );
  }, [invoices, locale, query]);

  useEffect(() => {
    if (!focusInvoiceId) return;
    document.getElementById(`invoice-${focusInvoiceId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusInvoiceId]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createInvoice(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("orvyn-add-invoice") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title={t("open")} value={String(counts.open)} hint={t("openHint")} />
        <DashboardCard title={t("overdue")} value={String(counts.overdue)} hint={t("overdueHint")} />
        <DashboardCard title={t("paid")} value={String(counts.paid)} hint={t("paidHint")} />
        <DashboardCard
          title={t("outstanding")}
          value={counts.outstanding.length
            ? counts.outstanding.map(([currency, amount]) =>
                new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount),
              ).join(" · ")
            : "—"}
          hint={t("outstandingHint")}
        />
      </div>

      <form id="orvyn-add-invoice" action={onAdd} className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4">
          <IncomingLinkFields prefillProduct={prefill?.product} prefillId={prefill?.id} />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addInvoice")}</p>
          {prefill ? <p className="mt-2 text-sm text-muted">{t("prefill", { name: prefill.name, product: recordProductName(prefill.product) })}</p> : null}
        </div>
        <div>
          <Label htmlFor="customerName">{t("customer")}</Label>
          <Input id="customerName" name="customerName" required defaultValue={prefill?.name ?? ""} />
        </div>
        <div>
          <Label htmlFor="invoiceNumber">{t("invoiceNumber")}</Label>
          <Input id="invoiceNumber" name="invoiceNumber" required placeholder="INV-2026-001" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Input id="description" name="description" required defaultValue={prefill?.title ?? ""} />
        </div>
        <div>
          <Label htmlFor="amount">{t("amount")}</Label>
          <div className="flex gap-2">
            <Input id="amount" name="amount" required inputMode="decimal" placeholder="1200" />
            <select name="currency" aria-label={t("currency")} defaultValue="EUR" className="h-10 rounded-md border border-foreground/15 bg-card px-2 text-sm">
              {quoteCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="issuedOn">{t("issuedOn")}</Label>
          <Input id="issuedOn" name="issuedOn" type="date" required defaultValue={today} />
        </div>
        <div>
          <Label htmlFor="dueOn">{t("dueOn")}</Label>
          <Input id="dueOn" name="dueOn" type="date" required />
        </div>
        <div>
          <Label htmlFor="nextReminderOn">{t("nextReminderOn")}</Label>
          <Input id="nextReminderOn" name="nextReminderOn" type="date" />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={prefill?.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" placeholder={tCommon("optional")} defaultValue={prefill?.phone ?? ""} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between gap-4">
          <FormError message={error} />
          <Button type="submit" disabled={pending}>{pending ? t("adding") : t("add")}</Button>
        </div>
      </form>

      <div className="mt-8">
        {invoices.length ? (
          <div className="mb-4 max-w-sm">
            <Label htmlFor="orvyn-search">{tCommon("searchRecords")}</Label>
            <Input id="orvyn-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} />
          </div>
        ) : null}
        {invoices.length === 0 ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead><TR><TH>{t("colInvoice")}</TH><TH>{t("colAmount")}</TH><TH>{t("colStatus")}</TH><TH>{t("colDates")}</TH><TH>{t("colReminder")}</TH><TH>{t("colConnected")}</TH><TH className="text-right"> </TH></TR></THead>
            <TBody>
              {visibleInvoices.map((invoice) => (
                <TR key={invoice.id} id={`invoice-${invoice.id}`} className={cn(focusInvoiceId === invoice.id && "bg-accent-soft")}>
                  <TD><p className="font-medium">{invoice.invoice_number}</p><p>{invoice.customer_name}</p><p className="text-xs text-muted">{invoice.description}</p></TD>
                  <TD>{formatMoney(invoice.amount, invoice.currency, locale)}</TD>
                  <TD>
                    <Badge tone={statusTone[invoice.status]}>{t(statusKeys[invoice.status])}</Badge>
                    <select aria-label={t("statusFor", { number: invoice.invoice_number })} className="mt-2 block h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm" defaultValue={invoice.status} onChange={async (event) => {
                      const result = await updateInvoiceStatus(invoice.id, event.target.value);
                      toast({ title: result.ok ? t("statusUpdated") : result.error, tone: result.ok ? "success" : "error" });
                      if (result.ok) router.refresh();
                    }}>
                      {invoiceStatuses.map((status) => <option key={status} value={status}>{t(statusKeys[status])}</option>)}
                    </select>
                  </TD>
                  <TD><p>{t("issuedShort", { date: invoice.issued_on })}</p><p className={cn("text-xs text-muted", isDue(invoice) && "text-warning")}>{t("dueShort", { date: invoice.due_on })}</p></TD>
                  <TD>
                    <input type="date" aria-label={t("reminderFor", { number: invoice.invoice_number })} defaultValue={invoice.next_reminder_on ?? ""} disabled={!isOpen(invoice)} className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm" onChange={async (event) => {
                      const result = await updateInvoiceReminder(invoice.id, event.target.value);
                      toast({ title: result.ok ? t("reminderSaved") : result.error, tone: result.ok ? "success" : "error" });
                      if (result.ok) router.refresh();
                    }} />
                  </TD>
                  <TD><ConnectedRecords product="orvyn" recordId={invoice.id} links={links} leads={leads} bookings={bookings} quotes={quotes} invoices={invoices} /></TD>
                  <TD className="text-right"><Button variant="ghost" size="sm" onClick={() => setDeleteId(invoice.id)}>{t("remove")}</Button></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
      <ConfirmationDialog
        open={Boolean(deleteId)}
        title={t("removeTitle")}
        description={t("removeBody")}
        confirmLabel={t("remove")}
        cancelLabel={tCommon("cancel")}
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          const result = await deleteInvoice(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : result.error, tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
