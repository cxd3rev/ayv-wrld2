import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductIcon } from "@/components/product-icon";
import { getProduct } from "@/config/products";
import { getActiveProductId } from "@/lib/product-cookie";
import { AvyroLeadsWorkspace } from "@/products/avyro/leads-workspace";
import { listLeads } from "@/products/avyro/actions";
import { RovynQuotesWorkspace } from "@/products/rovyn/quotes-workspace";
import { listQuotes } from "@/products/rovyn/actions";
import { VeltoBookingsWorkspace } from "@/products/velto/bookings-workspace";
import { listBookings } from "@/products/velto/actions";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductDashboardPage({
  searchParams,
}: PageProps<"/dashboard/product">) {
  const productId = await getActiveProductId();
  const product = getProduct(productId)!;
  const params = await searchParams;
  const showAvyro = product.id === "avyro" && Boolean(product.featureFlags.leadCapture);
  const showVelto = product.id === "velto" && Boolean(product.featureFlags.bookings);
  const showRovyn = product.id === "rovyn" && Boolean(product.featureFlags.quotes);
  const [leads, bookings, quotes] = await Promise.all([
    showAvyro || showVelto ? listLeads() : Promise.resolve([]),
    showAvyro || showVelto ? listBookings() : Promise.resolve([]),
    showRovyn ? listQuotes() : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader
        title={product.dashboard.title}
        description={product.dashboard.description}
        action={
          <Badge tone={product.status === "active" ? "accent" : "neutral"}>
            {product.status === "active" ? product.tagline : product.marketingStatus}
          </Badge>
        }
      />

      {product.status === "coming_soon" ? (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={`${product.name} is coming soon`}
          description="This product is configured in the foundation, but its features are not built yet. Switch back to Avyro, Velto, or Rovyn to continue."
        />
      ) : showAvyro ? (
        <AvyroLeadsWorkspace
          leads={leads}
          bookings={bookings}
          focusLeadId={firstParam(params.lead)}
        />
      ) : showVelto ? (
        <VeltoBookingsWorkspace
          bookings={bookings}
          leads={leads}
          fromLeadId={firstParam(params.fromLead)}
          focusBookingId={firstParam(params.booking)}
        />
      ) : showRovyn ? (
        <RovynQuotesWorkspace quotes={quotes} />
      ) : (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={`${product.name} is not ready yet`}
          description="Switch back to Avyro, Velto, or Rovyn to keep working."
        />
      )}
    </div>
  );
}
