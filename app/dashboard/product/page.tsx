import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductIcon } from "@/components/product-icon";
import { getProduct } from "@/config/products";
import { getActiveProductId } from "@/lib/product-cookie";
import { AvyroLeadsWorkspace } from "@/products/avyro/leads-workspace";
import { listLeads } from "@/products/avyro/actions";

export default async function ProductDashboardPage() {
  const productId = await getActiveProductId();
  const product = getProduct(productId)!;
  const leads = product.id === "avyro" && product.featureFlags.leadCapture ? await listLeads() : [];

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
          description="This product is configured in the foundation, but its features are not built yet. Switch back to Avyro to continue."
        />
      ) : product.id === "avyro" && product.featureFlags.leadCapture ? (
        <AvyroLeadsWorkspace leads={leads} />
      ) : (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={`${product.name} is not ready yet`}
          description="Switch back to Avyro to follow up with new leads."
        />
      )}
    </div>
  );
}
