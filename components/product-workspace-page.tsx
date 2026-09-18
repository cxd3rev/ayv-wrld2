import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { getProduct } from "@/config/products";
import { resolveRecordPrefill, type RecordProduct } from "@/lib/record-entities";
import { AvyroLeadsWorkspace } from "@/products/avyro/leads-workspace";
import { listLeads } from "@/products/avyro/actions";
import { RovynQuotesWorkspace } from "@/products/rovyn/quotes-workspace";
import { listQuotes } from "@/products/rovyn/actions";
import { OrvynInvoicesWorkspace } from "@/products/orvyn/invoices-workspace";
import { listInvoices } from "@/products/orvyn/actions";
import { VeltoBookingsWorkspace } from "@/products/velto/bookings-workspace";
import { listBookings } from "@/products/velto/actions";
import { listRecordLinks } from "@/services/record-links";
import { getTranslations } from "next-intl/server";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function ProductWorkspacePage({
  productId,
  searchParams,
}: {
  productId: RecordProduct;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const product = getProduct(productId)!;
  const t = await getTranslations();
  const params = await searchParams;
  const [leads, bookings, quotes, invoices, links] = await Promise.all([
    listLeads(),
    listBookings(),
    listQuotes(),
    listInvoices(),
    listRecordLinks(),
  ]);
  const prefill = resolveRecordPrefill(
    firstParam(params.fromLead),
    firstParam(params.fromBooking),
    firstParam(params.fromQuote),
    firstParam(params.fromInvoice),
    leads,
    bookings,
    quotes,
    invoices,
  );

  return (
    <div style={{ "--product-accent": product.accent } as React.CSSProperties}>
      <div className="mb-6 border-l-4 pl-5" style={{ borderColor: product.accent }}>
        <PageHeader
          title={product.dashboard.title}
          description={t(`catalog.${product.id}.dashboardDescription`)}
          action={<Badge tone="accent">{t(`catalog.${product.id}.tagline`)}</Badge>}
        />
      </div>

      {productId === "avyro" ? (
        <AvyroLeadsWorkspace
          leads={leads}
          bookings={bookings}
          quotes={quotes}
          invoices={invoices}
          links={links}
          prefill={prefill}
          focusLeadId={firstParam(params.lead)}
        />
      ) : productId === "velto" ? (
        <VeltoBookingsWorkspace
          bookings={bookings}
          leads={leads}
          quotes={quotes}
          invoices={invoices}
          links={links}
          prefill={prefill}
          focusBookingId={firstParam(params.booking)}
        />
      ) : productId === "rovyn" ? (
        <RovynQuotesWorkspace
          quotes={quotes}
          leads={leads}
          bookings={bookings}
          invoices={invoices}
          links={links}
          prefill={prefill}
          focusQuoteId={firstParam(params.quote)}
        />
      ) : (
        <OrvynInvoicesWorkspace
          invoices={invoices}
          leads={leads}
          bookings={bookings}
          quotes={quotes}
          links={links}
          prefill={prefill}
          focusInvoiceId={firstParam(params.invoice)}
        />
      )}
    </div>
  );
}
