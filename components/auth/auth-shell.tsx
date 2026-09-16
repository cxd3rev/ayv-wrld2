import { Atmosphere } from "@/components/atmosphere";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Atmosphere>
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-sm text-white/55 hover:text-foreground"
      >
        ← Home
      </Link>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-[420px] text-center">
          <Logo className="justify-center" />
          {title ? <h1 className="display mt-8 text-4xl">{title}</h1> : null}
          {description ? <p className="mt-3 text-sm text-muted">{description}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </Atmosphere>
  );
}

export function AuthMessage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-muted" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <h1 className="display text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
