import {
  CalendarDays,
  CreditCard,
  FileText,
  RefreshCw,
  Star,
  Zap,
} from "lucide-react";
import type { ProductConfig } from "@/config/products";

const icons = {
  zap: Zap,
  calendar: CalendarDays,
  "file-text": FileText,
  "credit-card": CreditCard,
  refresh: RefreshCw,
  star: Star,
};

export function ProductIcon({
  product,
  className,
}: {
  product: ProductConfig;
  className?: string;
}) {
  const Icon = icons[product.icon];
  return <Icon className={className} style={{ color: product.accent }} />;
}
