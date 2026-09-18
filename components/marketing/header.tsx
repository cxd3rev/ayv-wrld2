"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { products } from "@/config/products";
import { getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import { ChevronDown, Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MarketingHeader() {
  const c = getPublicCopy(resolveLocale(useLocale()));
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/projects", label: c.nav.projects },
    { href: "/one-man-army", label: c.nav.army },
    { href: "/about", label: c.nav.about },
  ];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 w-full max-w-[1400px] items-center justify-between px-5 lg:px-10" aria-label="Primary navigation">
        <Link href="/" aria-label="AYV WRLD home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {links.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-sm text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
              {c.nav.automation}<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-1/2 top-9 w-[420px] -translate-x-1/2 border border-border bg-card p-3 shadow-2xl">
              <Link href="/automation" className="block border-b border-border p-3 text-sm font-medium hover:bg-card-hover">{c.nav.automation}</Link>
              <div className="grid grid-cols-2 gap-1 pt-2">
                {products.map((product) => (
                  <Link key={product.id} href={product.marketingRoute} className="p-3 text-sm text-muted hover:bg-card-hover hover:text-foreground">{product.name}</Link>
                ))}
              </div>
              <Link href="/automation/stack" className="mt-2 flex items-center justify-between border border-border p-3 text-sm font-medium hover:bg-card-hover">
                AYV Automation Stack <span className="text-xs text-muted">{c.common.bundle}</span>
              </Link>
            </div>
          </details>
          <Link href="/about" className="nav-link text-sm text-muted hover:text-foreground">{c.nav.about}</Link>
        </div>
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
            {c.nav.login}
          </Link>
          <Link
            href={pathname === "/" ? "#paths" : "/#paths"}
            className="inline-flex h-10 items-center bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-white"
          >
            {c.nav.explore}
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="p-2 text-foreground"
            aria-label={open ? c.nav.close : c.nav.menu}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-navigation" className="fixed inset-x-0 top-18 z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-border bg-background px-6 py-8 lg:hidden">
          <div className="flex flex-col gap-5">
            {links.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display text-3xl text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-y border-border py-5">
              <Link href="/automation" onClick={() => setOpen(false)} className="display text-3xl">{c.nav.automation}</Link>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{c.nav.products}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {products.map((product) => (
                  <Link key={product.id} href={product.marketingRoute} onClick={() => setOpen(false)} className="border border-border p-3 text-sm">{product.name}</Link>
                ))}
              </div>
              <Link href="/automation/stack" onClick={() => setOpen(false)} className="mt-3 block border border-border bg-card p-4 text-sm font-medium">AYV Automation Stack · {c.common.bundle}</Link>
            </div>
            <Link href="/about" className="display text-3xl" onClick={() => setOpen(false)}>{c.nav.about}</Link>
          </div>
          <div className="mt-10 flex gap-3 border-t border-border pt-6">
            <Link
              href="/login"
              className="inline-flex h-12 flex-1 items-center justify-center border border-border text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {c.nav.login}
            </Link>
            <Link
              href="/#paths"
              className="inline-flex h-12 flex-1 items-center justify-center bg-foreground text-sm font-medium text-background"
              onClick={() => setOpen(false)}
            >
              {c.nav.explore}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  const c = getPublicCopy(resolveLocale(useLocale()));

  return (
    <footer className="relative z-10 border-t border-border px-6 py-16 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">{c.footer.body}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{c.footer.automation}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={product.marketingRoute}
                    className="text-sm text-foreground/80 transition-colors hover:text-accent"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{c.footer.paths}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li><Link href="/one-man-army" className="transition-colors hover:text-accent">One Man Army Stack</Link></li>
              <li><Link href="/automation" className="transition-colors hover:text-accent">AYV Automation</Link></li>
              <li><Link href="/automation/stack" className="transition-colors hover:text-accent">AYV Automation Stack</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{c.footer.company}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li><Link href="/projects" className="transition-colors hover:text-accent">{c.nav.projects}</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-accent">{c.nav.about}</Link></li>
              <li><Link href="/login" className="transition-colors hover:text-accent">{c.nav.login}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 flex w-full max-w-[1400px] flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">AYV WRLD</p>
        <p className="text-xs text-muted">© {new Date().getFullYear()} AYV WRLD. {c.footer.rights}</p>
      </div>
    </footer>
  );
}
