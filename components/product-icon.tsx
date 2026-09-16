import Image from "next/image";
import { cn } from "@/lib/utils";
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
      alt={product.name}
      width={size}
      height={size}
      className={cn("object-contain", className)}
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
      alt={product.name}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
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
