import { Logo } from "@/components/logo";
import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-6">
      <Link href="/" aria-label="AYV WRLD home">
        <Logo />
      </Link>
      <nav className="flex items-center gap-5 text-sm text-white/70">
        <Link href="/#products" className="hidden hover:text-foreground sm:inline">
          Products
        </Link>
        <Link href="/login" className="hover:text-foreground">
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-white/15 px-4 py-2 text-foreground hover:bg-white/5"
        >
          Get started
        </Link>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="px-4 py-10 text-center text-sm text-muted">
      <p>AYV WRLD — focused tools for everyday business work.</p>
    </footer>
  );
}
