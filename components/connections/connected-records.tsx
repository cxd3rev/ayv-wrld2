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
import type { Booking, Invoice, Lead, Quote, Reactivation, RecordLink, Review } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const journeyProducts: RecordProduct[] = ["avyro", "velto", "rovyn", "orvyn", "nexro", "ravelo"];

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
  reactivations = [],
  reviews = [],
}: {
  product: RecordProduct;
  recordId: string;
  links: RecordLink[];
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  invoices?: Invoice[];
  reactivations?: Reactivation[];
  reviews?: Review[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("connections");
  const tCommon = useTranslations("common");
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
    if (entity.product === "orvyn") {
      return invoices
        .filter((invoice) => !linkedKeys.has(`orvyn:${invoice.id}`))
        .map((invoice) => ({ id: invoice.id, label: `${invoice.invoice_number} · ${invoice.customer_name}` }));
    }
    if (entity.product === "nexro") {
      return reactivations
        .filter((item) => !linkedKeys.has(`nexro:${item.id}`))
        .map((item) => ({ id: item.id, label: `${item.customer_name} · ${item.message}` }));
    }
    return reviews
      .filter((item) => !linkedKeys.has(`ravelo:${item.id}`))
      .map((item) => ({ id: item.id, label: item.customer_name }));
  }, [attachProduct, bookings, invoices, leads, linkedKeys, quotes, reactivations, reviews]);

  const canAttach = targets.some((target) => {
    if (target.product === "avyro") return leads.some((lead) => !linkedKeys.has(`avyro:${lead.id}`));
    if (target.product === "velto") {
      return bookings.some((booking) => !linkedKeys.has(`velto:${booking.id}`));
    }
    if (target.product === "rovyn") {
      return quotes.some((quote) => !linkedKeys.has(`rovyn:${quote.id}`));
    }
    if (target.product === "orvyn") {
      return invoices.some((invoice) => !linkedKeys.has(`orvyn:${invoice.id}`));
    }
    if (target.product === "nexro") {
      return reactivations.some((item) => !linkedKeys.has(`nexro:${item.id}`));
    }
    return reviews.some((item) => !linkedKeys.has(`ravelo:${item.id}`));
  });

  const createLabel = {
    avyro: t("addInAvyro"),
    velto: t("bookInVelto"),
    rovyn: t("quoteInRovyn"),
    orvyn: t("invoiceInOrvyn"),
    nexro: t("reachOutInNexro"),
    ravelo: t("askInRavelo"),
  } as const;
  const nounLabel = {
    avyro: t("nounLead"),
    velto: t("nounBooking"),
    rovyn: t("nounQuote"),
    orvyn: t("nounInvoice"),
    nexro: t("nounReactivation"),
    ravelo: t("nounReview"),
  } as const;

  const linkClass = "text-xs text-muted hover:text-foreground disabled:opacity-50";

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted">{t("stepsConnected", { count: journey.completed.length })}</p>
      {linked.map((side) => {
        const entity = getRecordEntity(side.product);
        if (!entity) return null;
        const name = recordProductName(side.product);
        return (
          <div key={side.linkId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm">{name}</span>
            <button
              type="button"
              className={linkClass}
              onClick={() => openLinkedWorkspace(side.product, { [entity.focusParam]: side.id })}
            >
              {t("openIn", { name })}
            </button>
            <button
              type="button"
              className={linkClass}
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
            </button>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {targets.map((target) => (
          <button
            key={target.product}
            type="button"
            className={linkClass}
            onClick={() => openLinkedWorkspace(target.product, { [current.fromParam]: recordId })}
          >
            {createLabel[target.product]}
          </button>
        ))}
        {canAttach ? (
          <button
            type="button"
            className={linkClass}
            onClick={() => {
              setAttachError("");
              setAttachProduct(targets[0]?.product ?? "avyro");
              setAttachOpen(true);
            }}
          >
            {t("attach")}
          </button>
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

