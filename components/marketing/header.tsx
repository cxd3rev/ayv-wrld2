"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { products } from "@/config/products";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

export function MarketingHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    { href: "/#products", label: t("products") },
    { href: "/#features", label: t("platform") },
    { href: "/#how", label: t("how") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <nav
        className={cn(
          "mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 transition-all duration-300 sm:px-6",
          scrolled
            ? "max-w-[1120px] rounded-full border border-border bg-card/85 shadow-sm backdrop-blur-xl"
            : "border border-transparent",
        )}
      >
        <Link href="/" aria-label="AYV WRLD home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-sm text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
            {t("login")}
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-full bg-card px-5 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-card-hover"
          >
            {t("signup")}
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="p-2"
            aria-label={open ? tCommon("closeMenu") : tCommon("openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="fixed inset-0 top-0 z-40 bg-background px-8 pt-24 pb-8 md:hidden">
          <div className="flex flex-col gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display text-5xl text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-16 flex gap-4 border-t border-border pt-8">
            <Link
              href="/login"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full border border-border text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {t("login")}
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground"
              onClick={() => setOpen(false)}
            >
              {t("signup")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="relative z-10 border-t border-border px-6 py-16 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">{t("blurb")}</p>
        </div>
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{t("products")}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm text-foreground/80 transition-colors hover:text-accent"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{t("platform")}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li>
                <Link href="/#features" className="transition-colors hover:text-accent">
                  {tNav("features")}
                </Link>
              </li>
              <li>
                <Link href="/#how" className="transition-colors hover:text-accent">
                  {tNav("how")}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-accent">
                  {tNav("signup")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{t("account")}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li>
                <Link href="/login" className="transition-colors hover:text-accent">
                  {tNav("login")}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-accent">
                  {t("signup")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 flex w-full max-w-[1400px] flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">AYV WRLD</p>
        <p className="text-xs text-muted">{t("rights", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
