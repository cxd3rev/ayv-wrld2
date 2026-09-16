import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50 focus:ring-2 focus:ring-accent/15",
        className,
      )}
      {...props}
    />
  );
}
