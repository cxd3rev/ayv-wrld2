import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function PrimaryAction({
  pending,
  children,
}: {
  pending?: boolean;
  children: ReactNode;
}) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-14 w-full text-base">
      {children}
    </Button>
  );
}

export function ActionFeedback({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-2 text-sm" role="status">
      <Check className="h-5 w-5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function AdvancedPanel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <details className="mt-10 rounded-2xl border border-foreground/10 px-5 py-4">
      <summary className="cursor-pointer text-sm font-medium">{label}</summary>
      <div className="mt-6 space-y-6">{children}</div>
    </details>
  );
}
