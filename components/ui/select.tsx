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
        "h-12 w-full rounded-md border border-foreground/15 bg-transparent px-4 text-sm text-foreground outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
