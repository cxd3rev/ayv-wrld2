export function Logo({
  className,
  markOnly,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M12 3 4.5 20h3.1l1.5-3.6h6.8L17.4 20H20.5L12 3Zm.1 6.2 2.3 5.3H9.8l2.3-5.3Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {markOnly ? null : (
        <span className="text-sm font-medium tracking-[0.14em]">AYV WRLD</span>
      )}
    </span>
  );
}
