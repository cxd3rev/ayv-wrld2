import { cn } from "@/lib/utils";

export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto border border-foreground/10", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-foreground/[0.03] font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-white/2">{children}</tr>;
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}
