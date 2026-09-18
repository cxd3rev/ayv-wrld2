"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getRecordEntity,
  otherRecordEntities,
  otherSide,
  recordProductName,
  type RecordProduct,
} from "@/lib/record-entities";
import {
  createRecordLinkFromForm,
  deleteRecordLink,
} from "@/services/record-links";
import { openLinkedWorkspace } from "@/services/product-switch";
import { cn } from "@/lib/utils";
import type { Booking, Invoice, Lead, Quote, RecordLink } from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const journeyProducts: RecordProduct[] = ["avyro", "velto", "rovyn", "orvyn"];

function formatDay(value: string | null, locale: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function recordLabel(
  product: RecordProduct,
  id: string,
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
  invoices: Invoice[],
  locale: string,
  fallbacks: { lead: string; booking: string; quote: string; invoice: string },
) {
  if (product === "avyro") {
    const lead = leads.find((item) => item.id === id);
    return lead?.name ?? fallbacks.lead;
  }
  if (product === "velto") {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return fallbacks.booking;
    const when = formatDay(booking.starts_on, locale);
    return when ? `${booking.service} · ${when}` : booking.service;
  }
  if (product === "rovyn") {
    const quote = quotes.find((item) => item.id === id);
    return quote?.title ?? fallbacks.quote;
  }
  const invoice = invoices.find((item) => item.id === id);
  return invoice ? `${invoice.invoice_number} · ${invoice.customer_name}` : fallbacks.invoice;
}

function recordHint(
  product: RecordProduct,
  id: string,
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
  invoices: Invoice[],
) {
  if (product === "avyro") {
    return leads.find((item) => item.id === id)?.email ?? "";
  }
  if (product === "velto") {
    return bookings.find((item) => item.id === id)?.customer_name ?? "";
  }
  if (product === "rovyn") return quotes.find((item) => item.id === id)?.customer_name ?? "";
  return invoices.find((item) => item.id === id)?.description ?? "";
}

export function IncomingLinkFields({
  prefillProduct,
  prefillId,
}: {
  prefillProduct?: RecordProduct;
  prefillId?: string;
}) {
  if (!prefillProduct || !prefillId) return null;
  return (
    <>
      <input type="hidden" name="linkProduct" value={prefillProduct} />
      <input type="hidden" name="linkId" value={prefillId} />
    </>
  );
}

export function ConnectedRecords({
  product,
  recordId,
  links,
  leads,
  bookings,
  quotes,
  invoices = [],
}: {
  product: RecordProduct;
  recordId: string;
  links: RecordLink[];
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  invoices?: Invoice[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("connections");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const current = getRecordEntity(product)!;
  const targets = otherRecordEntities(product);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachProduct, setAttachProduct] = useState<RecordProduct>(targets[0]?.product ?? "avyro");
  const [attachError, setAttachError] = useState("");
  const [attachPending, setAttachPending] = useState(false);
  const [unlinkPending, setUnlinkPending] = useState<string | null>(null);

  const linked = useMemo(() => {
    return links
      .map((link) => otherSide(link, product, recordId))
      .filter((side): side is NonNullable<typeof side> => Boolean(side));
  }, [links, product, recordId]);

  const linkedKeys = useMemo(
    () => new Set(linked.map((side) => `${side.product}:${side.id}`)),
    [linked],
  );
  const journey = useMemo(() => {
    const visited = new Set([`${product}:${recordId}`]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const link of links) {
        const from = `${link.from_product}:${link.from_id}`;
        const to = `${link.to_product}:${link.to_id}`;
        if (visited.has(from) && !visited.has(to)) {
          visited.add(to);
          changed = true;
        } else if (visited.has(to) && !visited.has(from)) {
          visited.add(from);
          changed = true;
        }
      }
    }
    const completed = journeyProducts.filter((step) =>
      [...visited].some((key) => key.startsWith(`${step}:`)),
    );
    return { completed };
  }, [links, product, recordId]);
  const nextProduct = journeyProducts
    .slice(journeyProducts.indexOf(product) + 1)
    .find((step) => !journey.completed.includes(step));
  const readyForHandoff =
    product === "avyro"
      ? leads.find((lead) => lead.id === recordId)?.status !== "lost"
      : product === "velto"
        ? bookings.find((booking) => booking.id === recordId)?.status === "completed"
        : product === "rovyn"
          ? quotes.find((quote) => quote.id === recordId)?.status === "won"
          : false;

  const attachOptions = useMemo(() => {
    const entity = getRecordEntity(attachProduct);
    if (!entity) return [];
    if (entity.product === "avyro") {
      return leads
        .filter((lead) => !linkedKeys.has(`avyro:${lead.id}`))
        .map((lead) => ({
          id: lead.id,
          label: lead.email ? `${lead.name} · ${lead.email}` : lead.name,
        }));
    }
    if (entity.product === "velto") {
      return bookings
        .filter((booking) => !linkedKeys.has(`velto:${booking.id}`))
        .map((booking) => ({
          id: booking.id,
          label: `${booking.customer_name} · ${booking.service}`,
        }));
    }
    if (entity.product === "rovyn") {
      return quotes
        .filter((quote) => !linkedKeys.has(`rovyn:${quote.id}`))
        .map((quote) => ({ id: quote.id, label: `${quote.customer_name} · ${quote.title}` }));
    }
    return invoices
      .filter((invoice) => !linkedKeys.has(`orvyn:${invoice.id}`))
      .map((invoice) => ({ id: invoice.id, label: `${invoice.invoice_number} · ${invoice.customer_name}` }));
  }, [attachProduct, bookings, invoices, leads, linkedKeys, quotes]);

  const canAttach = targets.some((target) => {
    if (target.product === "avyro") return leads.some((lead) => !linkedKeys.has(`avyro:${lead.id}`));
    if (target.product === "velto") {
      return bookings.some((booking) => !linkedKeys.has(`velto:${booking.id}`));
    }
    if (target.product === "rovyn") {
      return quotes.some((quote) => !linkedKeys.has(`rovyn:${quote.id}`));
    }
    return invoices.some((invoice) => !linkedKeys.has(`orvyn:${invoice.id}`));
  });

  const createLabel = {
    avyro: t("addInAvyro"),
    velto: t("bookInVelto"),
    rovyn: t("quoteInRovyn"),
    orvyn: t("invoiceInOrvyn"),
  } as const;
  const nounLabel = {
    avyro: t("nounLead"),
    velto: t("nounBooking"),
    rovyn: t("nounQuote"),
    orvyn: t("nounInvoice"),
  } as const;
  const fallbacks = {
    lead: t("fallbackLead"),
    booking: t("fallbackBooking"),
    quote: t("fallbackQuote"),
    invoice: t("fallbackInvoice"),
  };

  return (
    <div className="flex min-w-[12rem] flex-col items-start gap-2">
      <div className="w-full border-l-2 border-foreground/15 pl-3">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
          {t("workflow")}
        </p>
        <div className="mt-2 flex items-center gap-1" aria-label={t("journeyProgress", { count: journey.completed.length })}>
          {journeyProducts.map((step) => (
            <span
              key={step}
              title={recordProductName(step)}
              className={cn(
                "h-1.5 flex-1",
                journey.completed.includes(step) ? "bg-accent" : "bg-foreground/10",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {t("stepsConnected", { count: journey.completed.length })}
        </p>
        {nextProduct && readyForHandoff ? (
          <p className="mt-1 text-xs font-medium">
            {t("nextBestAction", { name: recordProductName(nextProduct) })}
          </p>
        ) : nextProduct ? (
          <p className="mt-1 text-xs font-medium">{t("handoffPending")}</p>
        ) : journey.completed.length === journeyProducts.length ? (
          <p className="mt-1 text-xs font-medium text-success">{t("journeyComplete")}</p>
        ) : (
          <p className="mt-1 text-xs font-medium">{t("finalStep")}</p>
        )}
      </div>
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{t("connected")}</p>
      {linked.length === 0 ? (
        <p className="text-muted">{t("nothing")}</p>
      ) : (
        linked.map((side) => {
          const entity = getRecordEntity(side.product);
          if (!entity) return null;
          const name = recordProductName(side.product);
          return (
            <div key={side.linkId} className="flex flex-col items-start gap-1">
              <button
                type="button"
                className="text-left text-sm hover:text-accent"
                onClick={() =>
                  openLinkedWorkspace(side.product, { [entity.focusParam]: side.id })
                }
              >
                {recordLabel(side.product, side.id, leads, bookings, quotes, invoices, locale, fallbacks)}
              </button>
              <p className="text-xs text-muted">
                {name}
                {recordHint(side.product, side.id, leads, bookings, quotes, invoices)
                  ? ` · ${recordHint(side.product, side.id, leads, bookings, quotes, invoices)}`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    openLinkedWorkspace(side.product, { [entity.focusParam]: side.id })
                  }
                >
                  {t("openIn", { name })}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={unlinkPending === side.linkId}
                  onClick={async () => {
                    setUnlinkPending(side.linkId);
                    const result = await deleteRecordLink(side.linkId);
                    setUnlinkPending(null);
                    if (!result.ok) {
                      toast({ title: result.error ?? "Could not unlink", tone: "error" });
                      return;
                    }
                    toast({ title: t("unlinked"), tone: "success" });
                    router.refresh();
                  }}
                >
                  {unlinkPending === side.linkId ? t("unlinking") : t("unlink")}
                </Button>
              </div>
            </div>
          );
        })
      )}
      <div className="flex flex-wrap gap-2">
        {targets.map((target) => (
          <Button
            key={target.product}
            size="sm"
            variant="secondary"
            onClick={() =>
              openLinkedWorkspace(target.product, { [current.fromParam]: recordId })
            }
          >
            {createLabel[target.product]}
          </Button>
        ))}
        {canAttach ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAttachError("");
              setAttachProduct(targets[0]?.product ?? "avyro");
              setAttachOpen(true);
            }}
          >
            {t("attach")}
          </Button>
        ) : null}
      </div>

      <Modal
        open={attachOpen}
        title={t("title")}
        description={t("description")}
        onClose={() => setAttachOpen(false)}
      >
        <form
          action={async (formData) => {
            setAttachError("");
            setAttachPending(true);
            const result = await createRecordLinkFromForm(formData);
            setAttachPending(false);
            if (!result.ok) {
              setAttachError(result.error ?? "Could not connect those records.");
              return;
            }
            setAttachOpen(false);
            toast({ title: t("connectedToast"), tone: "success" });
            router.refresh();
          }}
          className="grid gap-4"
        >
          <input type="hidden" name="fromProduct" value={product} />
          <input type="hidden" name="fromId" value={recordId} />
          <div>
            <Label htmlFor={`attach-product-${recordId}`}>{t("product")}</Label>
            <Select
              id={`attach-product-${recordId}`}
              name="toProduct"
              value={attachProduct}
              onChange={(event) => setAttachProduct(event.target.value as RecordProduct)}
            >
              {targets.map((target) => (
                <option key={target.product} value={target.product}>
                  {recordProductName(target.product)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`attach-record-${recordId}`}>{t("record")}</Label>
            <Select
              id={`attach-record-${recordId}`}
              key={attachProduct}
              name="toId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                {t("choose", { noun: nounLabel[attachProduct] })}
              </option>
              {attachOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <FormError message={attachError} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAttachOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={attachPending || attachOptions.length === 0}>
              {attachPending ? t("linking") : t("attach")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

