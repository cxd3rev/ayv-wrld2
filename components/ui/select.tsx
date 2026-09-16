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
        "h-12 w-full rounded-md border border-foreground/15 bg-card px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
