import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductIcon } from "@/components/product-icon";
import { getProduct } from "@/config/products";
import { getActiveProductId } from "@/lib/product-cookie";
import { AvyroLeadsWorkspace } from "@/products/avyro/leads-workspace";
import { listLeads } from "@/products/avyro/actions";
import { VeltoBookingsWorkspace } from "@/products/velto/bookings-workspace";
import { listBookings } from "@/products/velto/actions";

export default async function ProductDashboardPage() {
  const productId = await getActiveProductId();
  const product = getProduct(productId)!;
  const showAvyro = product.id === "avyro" && Boolean(product.featureFlags.leadCapture);
  const showVelto = product.id === "velto" && Boolean(product.featureFlags.bookings);
  const leads = showAvyro ? await listLeads() : [];
  const bookings = showVelto ? await listBookings() : [];

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
          description="This product is configured in the foundation, but its features are not built yet. Switch back to Avyro or Velto to continue."
        />
      ) : showAvyro ? (
        <AvyroLeadsWorkspace leads={leads} />
      ) : showVelto ? (
        <VeltoBookingsWorkspace bookings={bookings} />
      ) : (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={`${product.name} is not ready yet`}
          description="Switch back to Avyro or Velto to keep working."
        />
      )}
    </div>
  );
}
