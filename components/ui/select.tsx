import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-2 focus:ring-accent/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
