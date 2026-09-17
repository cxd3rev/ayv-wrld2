import { getProduct, type ProductId } from "@/config/products";
import type { Booking, Invoice, Lead, Quote } from "@/types/database";

/**
 * Product record registry for org-scoped connections (`record_links`).
 *
 * How a future app opts in (no N×N foreign keys):
 * 1. Ship the workspace table + dashboard CRUD, then add one entry below:
 *    product slug, Postgres table, noun, create-action label, focus query param,
 *    and `fromParam` used when another product prefills a create form.
 * 2. Add a numbered SQL migration that:
 *    - insert into public.record_link_types (product, entity_table)
 *    - create trigger <table>_cleanup_record_links after delete
 *      on public.<table> for each row
 *      execute function public.cleanup_record_links('<slug>');
 *    The new table must have `id uuid` and `organization_id uuid`.
 * 3. Import createRecordLink / listRecordLinks / deleteRecordLink from
 *    `@/services/record-links` and render `<ConnectedRecords />`.
 *
 * Only list products that have a live workspace so attach/open never 404.
 */
export const recordProducts = ["avyro", "velto", "rovyn", "orvyn"] as const;

export type RecordProduct = (typeof recordProducts)[number];

export type RecordEntityDef = {
  product: RecordProduct;
  table: "leads" | "bookings" | "quotes" | "invoices";
  noun: string;
  createActionLabel: string;
  focusParam: string;
  fromParam: string;
};

export const recordEntities: RecordEntityDef[] = [
  {
    product: "avyro",
    table: "leads",
    noun: "lead",
    createActionLabel: "Add in Avyro",
    focusParam: "lead",
    fromParam: "fromLead",
  },
  {
    product: "velto",
    table: "bookings",
    noun: "booking",
    createActionLabel: "Book in Velto",
    focusParam: "booking",
    fromParam: "fromBooking",
  },
  {
    product: "rovyn",
    table: "quotes",
    noun: "quote",
    createActionLabel: "Quote in Rovyn",
    focusParam: "quote",
    fromParam: "fromQuote",
  },
  {
    product: "orvyn",
    table: "invoices",
    noun: "invoice",
    createActionLabel: "Invoice in Orvyn",
    focusParam: "invoice",
    fromParam: "fromInvoice",
  },
];

export function isRecordProduct(value: string): value is RecordProduct {
  return recordProducts.includes(value as RecordProduct);
}

export function getRecordEntity(product: string) {
  return recordEntities.find((entity) => entity.product === product);
}

export function otherRecordEntities(product: RecordProduct) {
  return recordEntities.filter((entity) => entity.product !== product);
}

export function recordProductName(product: RecordProduct) {
  return getProduct(product)?.name ?? product;
}

export function isActiveRecordProduct(product: ProductId): product is RecordProduct {
  return isRecordProduct(product) && getProduct(product)?.status === "active";
}

export type RecordPrefill = {
  product: RecordProduct;
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  title?: string;
};

export type LinkedSide = {
  product: RecordProduct;
  id: string;
  linkId: string;
};

export function otherSide(
  link: {
    from_product: RecordProduct;
    from_id: string;
    to_product: RecordProduct;
    to_id: string;
    id: string;
  },
  product: RecordProduct,
  id: string,
): LinkedSide | null {
  if (link.from_product === product && link.from_id === id) {
    return { product: link.to_product, id: link.to_id, linkId: link.id };
  }
  if (link.to_product === product && link.to_id === id) {
    return { product: link.from_product, id: link.from_id, linkId: link.id };
  }
  return null;
}

export function resolveRecordPrefill(
  fromLeadId: string | undefined,
  fromBookingId: string | undefined,
  fromQuoteId: string | undefined,
  fromInvoiceId: string | undefined,
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
  invoices: Invoice[],
): RecordPrefill | undefined {
  const lead = fromLeadId ? leads.find((item) => item.id === fromLeadId) : undefined;
  if (lead) {
    return {
      product: "avyro",
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    };
  }

  const booking = fromBookingId
    ? bookings.find((item) => item.id === fromBookingId)
    : undefined;
  if (booking) {
    return {
      product: "velto",
      id: booking.id,
      name: booking.customer_name,
      email: booking.email,
      phone: booking.phone,
      title: booking.service,
    };
  }

  const quote = fromQuoteId ? quotes.find((item) => item.id === fromQuoteId) : undefined;
  if (quote) {
    return {
      product: "rovyn",
      id: quote.id,
      name: quote.customer_name,
      email: quote.email,
      phone: quote.phone,
      title: quote.title,
    };
  }

  const invoice = fromInvoiceId
    ? invoices.find((item) => item.id === fromInvoiceId)
    : undefined;
  if (invoice) {
    return {
      product: "orvyn",
      id: invoice.id,
      name: invoice.customer_name,
      email: invoice.email,
      phone: invoice.phone,
      title: invoice.description,
    };
  }

  return undefined;
}
