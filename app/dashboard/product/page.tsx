import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductIcon } from "@/components/product-icon";
import { getProduct } from "@/config/products";
import { getActiveProductId } from "@/lib/product-cookie";
import { resolveRecordPrefill } from "@/lib/record-entities";
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

export default async function ProductDashboardPage({
  searchParams,
}: PageProps<"/dashboard/product">) {
  const productId = await getActiveProductId();
  const product = getProduct(productId)!;
  const t = await getTranslations();
  const params = await searchParams;
  const showAvyro = product.id === "avyro" && Boolean(product.featureFlags.leadCapture);
  const showVelto = product.id === "velto" && Boolean(product.featureFlags.bookings);
  const showRovyn = product.id === "rovyn" && Boolean(product.featureFlags.quotes);
  const showOrvyn = product.id === "orvyn" && Boolean(product.featureFlags.invoices);
  const loadRecords = showAvyro || showVelto || showRovyn || showOrvyn;
  const [leads, bookings, quotes, invoices, links] = await Promise.all([
    loadRecords ? listLeads() : Promise.resolve([]),
    loadRecords ? listBookings() : Promise.resolve([]),
    loadRecords ? listQuotes() : Promise.resolve([]),
    loadRecords ? listInvoices() : Promise.resolve([]),
    loadRecords ? listRecordLinks() : Promise.resolve([]),
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
    <div>
      <PageHeader
        title={product.dashboard.title}
        description={t(`catalog.${product.id}.dashboardDescription`)}
        action={
          <Badge tone={product.status === "active" ? "accent" : "neutral"}>
            {product.status === "active"
              ? t(`catalog.${product.id}.tagline`)
              : t("common.comingSoon")}
          </Badge>
        }
      />

      {product.status === "coming_soon" ? (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={t("dashboard.comingSoonTitle", { name: product.name })}
          description={t("dashboard.comingSoonBody")}
        />
      ) : showAvyro ? (
        <AvyroLeadsWorkspace
          leads={leads}
          bookings={bookings}
          quotes={quotes}
          invoices={invoices}
          links={links}
          prefill={prefill}
          focusLeadId={firstParam(params.lead)}
        />
      ) : showVelto ? (
        <VeltoBookingsWorkspace
          bookings={bookings}
          leads={leads}
          quotes={quotes}
          invoices={invoices}
          links={links}
          prefill={prefill}
          focusBookingId={firstParam(params.booking)}
        />
      ) : showRovyn ? (
        <RovynQuotesWorkspace
          quotes={quotes}
          leads={leads}
          bookings={bookings}
          invoices={invoices}
          links={links}
          prefill={prefill}
          focusQuoteId={firstParam(params.quote)}
        />
      ) : showOrvyn ? (
        <OrvynInvoicesWorkspace
          invoices={invoices}
          leads={leads}
          bookings={bookings}
          quotes={quotes}
          links={links}
          prefill={prefill}
          focusInvoiceId={firstParam(params.invoice)}
        />
      ) : (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={t("dashboard.notReadyTitle", { name: product.name })}
          description={t("dashboard.notReadyBody")}
        />
      )}
    </div>
  );
}
