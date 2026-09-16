import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  value,
  hint,
  className,
}: {
  title: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-6", className)}>
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-3 text-3xl tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
