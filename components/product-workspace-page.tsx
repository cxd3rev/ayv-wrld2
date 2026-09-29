import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { getProduct } from "@/config/products";
import { resolveRecordPrefill, type RecordProduct } from "@/lib/record-entities";
import { AvyroLeadsWorkspace } from "@/products/avyro/leads-workspace";
import { listLeads } from "@/products/avyro/actions";
import { NexroReactivationsWorkspace } from "@/products/nexro/reactivations-workspace";
import { listContacts, listReactivations } from "@/products/nexro/actions";
import { RovynQuotesWorkspace } from "@/products/rovyn/quotes-workspace";
import { listQuotes } from "@/products/rovyn/actions";
import { OrvynInvoicesWorkspace } from "@/products/orvyn/invoices-workspace";
import { listInvoices } from "@/products/orvyn/actions";
import { RaveloReviewsWorkspace } from "@/products/ravelo/reviews-workspace";
import { listReviews } from "@/products/ravelo/actions";
import { VeltoBookingsWorkspace } from "@/products/velto/bookings-workspace";
import { listBookings } from "@/products/velto/actions";
import { listRecordLinks } from "@/services/record-links";
import { requireWorkspace } from "@/lib/auth/session";
import { getPlanAccess } from "@/lib/plan-access";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

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
  const { organization } = await requireWorkspace();
  const t = await getTranslations();
  const access = await getPlanAccess(organization);
  if (!access.canUse(productId)) {
    return (
      <div style={{ "--product-accent": product.accent } as React.CSSProperties}>
        <div className="mb-6 border-l-4 pl-5" style={{ borderColor: product.accent }}>
          <PageHeader title={t("billing.lockedTitle")} description={t("billing.lockedBody")} />
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background"
        >
          {t("billing.lockedCta")}
        </Link>
      </div>
    );
  }
  const params = await searchParams;
  const [leads, bookings, quotes, invoices, reactivations, reviews, links] = await Promise.all([
    listLeads(),
    listBookings(),
    listQuotes(),
    listInvoices(),
    listReactivations(),
    listReviews(),
    listRecordLinks(),
  ]);
  const prefill = resolveRecordPrefill(
    firstParam(params.fromLead),
    firstParam(params.fromBooking),
    firstParam(params.fromQuote),
    firstParam(params.fromInvoice),
    firstParam(params.fromReactivation),
    firstParam(params.fromReview),
    leads,
    bookings,
    quotes,
    invoices,
    reactivations,
    reviews,
  );
  const contacts = productId === "nexro" ? await listContacts() : [];
  const shared = { leads, bookings, quotes, invoices, reactivations, reviews, links, prefill };

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
        <AvyroLeadsWorkspace {...shared} focusLeadId={firstParam(params.lead)} />
      ) : productId === "velto" ? (
        <VeltoBookingsWorkspace {...shared} focusBookingId={firstParam(params.booking)} />
      ) : productId === "rovyn" ? (
        <RovynQuotesWorkspace {...shared} focusQuoteId={firstParam(params.quote)} />
      ) : productId === "orvyn" ? (
        <OrvynInvoicesWorkspace {...shared} focusInvoiceId={firstParam(params.invoice)} />
      ) : productId === "nexro" ? (
        <NexroReactivationsWorkspace {...shared} contacts={contacts} organizationName={organization.name} focusReactivationId={firstParam(params.reactivation)} />
      ) : (
        <RaveloReviewsWorkspace {...shared} focusReviewId={firstParam(params.review)} />
      )}
    </div>
  );
}
