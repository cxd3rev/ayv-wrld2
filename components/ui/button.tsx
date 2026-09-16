import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90",
  secondary: "bg-transparent text-foreground hover:bg-foreground/5 border border-foreground/20",
  ghost: "bg-transparent text-foreground hover:bg-foreground/5",
  outline: "border border-foreground/20 bg-transparent hover:bg-foreground/5",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-14 px-8 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
