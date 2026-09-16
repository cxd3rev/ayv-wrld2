import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md border border-foreground/15 bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
        className,
      )}
      {...props}
    />
  );
}
