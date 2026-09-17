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
import type { Booking, Lead, Quote, RecordLink } from "@/types/database";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function formatDay(value: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en", {
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
) {
  if (product === "avyro") {
    const lead = leads.find((item) => item.id === id);
    return lead?.name ?? "Lead";
  }
  if (product === "velto") {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return "Booking";
    const when = formatDay(booking.starts_on);
    return when ? `${booking.service} · ${when}` : booking.service;
  }
  const quote = quotes.find((item) => item.id === id);
  if (!quote) return "Quote";
  return quote.title;
}

function recordHint(
  product: RecordProduct,
  id: string,
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
) {
  if (product === "avyro") {
    return leads.find((item) => item.id === id)?.email ?? "";
  }
  if (product === "velto") {
    return bookings.find((item) => item.id === id)?.customer_name ?? "";
  }
  return quotes.find((item) => item.id === id)?.customer_name ?? "";
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
}: {
  product: RecordProduct;
  recordId: string;
  links: RecordLink[];
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
}) {
  const router = useRouter();
  const { toast } = useToast();
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
    return quotes
      .filter((quote) => !linkedKeys.has(`rovyn:${quote.id}`))
      .map((quote) => ({
        id: quote.id,
        label: `${quote.customer_name} · ${quote.title}`,
      }));
  }, [attachProduct, bookings, leads, linkedKeys, quotes]);

  const canAttach = targets.some((target) => {
    if (target.product === "avyro") return leads.some((lead) => !linkedKeys.has(`avyro:${lead.id}`));
    if (target.product === "velto") {
      return bookings.some((booking) => !linkedKeys.has(`velto:${booking.id}`));
    }
    return quotes.some((quote) => !linkedKeys.has(`rovyn:${quote.id}`));
  });

  return (
    <div className="flex min-w-[12rem] flex-col items-start gap-2">
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">Connected</p>
      {linked.length === 0 ? (
        <p className="text-muted">Nothing connected</p>
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
                {recordLabel(side.product, side.id, leads, bookings, quotes)}
              </button>
              <p className="text-xs text-muted">
                {name}
                {recordHint(side.product, side.id, leads, bookings, quotes)
                  ? ` · ${recordHint(side.product, side.id, leads, bookings, quotes)}`
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
                  Open in {name}
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
                    toast({ title: "Unlinked", tone: "success" });
                    router.refresh();
                  }}
                >
                  {unlinkPending === side.linkId ? "Unlinking..." : "Unlink"}
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
            {target.createActionLabel}
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
            Attach
          </Button>
        ) : null}
      </div>

      <Modal
        open={attachOpen}
        title="Connect a record"
        description="Link another record from this workspace. Unlink later without deleting either record."
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
            toast({ title: "Records connected", tone: "success" });
            router.refresh();
          }}
          className="grid gap-4"
        >
          <input type="hidden" name="fromProduct" value={product} />
          <input type="hidden" name="fromId" value={recordId} />
          <div>
            <Label htmlFor={`attach-product-${recordId}`}>Product</Label>
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
            <Label htmlFor={`attach-record-${recordId}`}>Record</Label>
            <Select
              id={`attach-record-${recordId}`}
              key={attachProduct}
              name="toId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose a {getRecordEntity(attachProduct)?.noun ?? "record"}
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
              Cancel
            </Button>
            <Button type="submit" disabled={attachPending || attachOptions.length === 0}>
              {attachPending ? "Linking..." : "Attach"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
