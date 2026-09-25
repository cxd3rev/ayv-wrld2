import Image from "next/image";
import { cn } from "@/lib/utils";
import { ayvBrand } from "@/config/brands";
import type { ProductConfig } from "@/config/products";

export function ProductIcon({
  product,
  className,
  size = 32,
}: {
  product: ProductConfig;
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={product.assets.icon}
      alt={`${product.name} logo`}
      width={size}
      height={size}
      className={cn("rounded-md object-contain", className)}
    />
  );
}

export function ProductLogo({
  product,
  className,
  size = 120,
}: {
  product: ProductConfig;
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={product.assets.logo}
      alt={`${product.name} logo`}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}

export function AyvAutomationParentBadge() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-black/10 bg-[#f8f6f0] p-2">
        <Image
          src={ayvBrand.automationParentMark}
          alt="AYV WRLD parent company logo"
          width={48}
          height={48}
          sizes="48px"
          className="h-12 w-12 object-contain"
        />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        AYV WRLD / Parent brand
      </span>
    </div>
  );
}

export function ProductWordmark({
  product,
  className,
}: {
  product: ProductConfig;
  className?: string;
}) {
  if (!product.assets.hasWordmark) {
    return <span className={className}>{product.name}</span>;
  }

  return (
    <Image
      src={product.assets.name}
      alt={product.name}
      width={320}
      height={96}
      className={cn("h-12 w-auto object-contain object-left", className)}
    />
  );
}
