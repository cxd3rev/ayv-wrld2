import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductIcon } from "@/components/product-icon";
import { getProduct } from "@/config/products";
import { getActiveProductId } from "@/lib/product-cookie";

export default async function ProductDashboardPage() {
  const productId = await getActiveProductId();
  const product = getProduct(productId)!;

  return (
    <div>
      <PageHeader
        title={product.dashboard.title}
        description={product.dashboard.description}
        action={<Badge tone={product.status === "active" ? "accent" : "neutral"}>{product.marketingStatus}</Badge>}
      />

      {product.status === "coming_soon" ? (
        <EmptyState
          icon={<ProductIcon product={product} size={64} className="h-16 w-16" />}
          title={`${product.name} is coming soon`}
          description="This product is configured in the foundation, but its features are not built yet. Switch back to Avyro to continue."
        />
      ) : (
        <Card className="flex min-h-64 flex-col items-center justify-center border-foreground/10 py-20 text-center">
          <ProductIcon product={product} size={72} className="h-[72px] w-[72px]" />
          <h2 className="display mt-8 text-4xl tracking-tight lg:text-5xl">{product.name} is ready to build on</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
            The shared AYV WRLD foundation is in place: auth, organizations, billing, email, and
            settings. Avyro-specific tools will be added in the next product build — not here.
          </p>
        </Card>
      )}
    </div>
  );
}
