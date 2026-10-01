import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
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
    <details className="group rounded-xl border border-foreground/10 bg-foreground/[0.02]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-6 border-t border-foreground/10 px-4 py-5">{children}</div>
    </details>
  );
}

export function AdvancedStats({
  items,
}: {
  items: { label: string; value: string; hint: string }[];
}) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-background px-4 py-4">
          <dt className="text-xs font-medium text-muted">{item.label}</dt>
          <dd className="mt-2 font-mono text-2xl leading-none tracking-tight break-words">{item.value}</dd>
          <p className="mt-2 text-xs leading-5 text-muted">{item.hint}</p>
        </div>
      ))}
    </dl>
  );
}
