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
    <div className={cn("workspace-card px-5 py-6", className)}>
      <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{title}</p>
      <p className="display mt-3 text-3xl tracking-tight lg:text-4xl">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
