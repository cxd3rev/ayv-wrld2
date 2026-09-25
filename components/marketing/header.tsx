"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { automationBrand } from "@/config/brands";
import { products } from "@/config/products";
import { getStackCopy, stackMarketing } from "@/config/stack-marketing";
import { resolveLocale } from "@/i18n/config";
import { Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src={automationBrand.logo} alt="" width={32} height={32} className="h-8 w-8 object-contain" priority />
      <span className="text-sm font-semibold tracking-tight">AYV Stack</span>
    </span>
  );
}

export function MarketingHeader() {
  const c = getStackCopy(resolveLocale(useLocale()));
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/#modules", label: c.nav.modules },
    { href: "/#pricing", label: c.nav.pricing },
    { href: "/#how", label: c.nav.how },
    { href: "/#contact", label: c.nav.contact },
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 lg:px-8" aria-label="Primary navigation">
        <Link href="/" aria-label="AYV Automation Stack home">
          <BrandMark />
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm text-white/70 transition-colors hover:text-white">{c.nav.login}</Link>
          <Link href="/signup" className="button-primary h-10 min-h-10 px-4">{c.nav.start}</Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button type="button" className="p-2" aria-label={open ? c.nav.close : c.nav.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      {open ? (
        <div className="border-t border-white/10 bg-black px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-2xl font-semibold" onClick={() => setOpen(false)}>{link.label}</Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {products.map((product) => (
                <Link key={product.id} href={product.marketingRoute} onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 px-3 py-3 text-sm">
                  {stackMarketing[product.id].name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="button-secondary flex-1" onClick={() => setOpen(false)}>{c.nav.login}</Link>
            <Link href="/signup" className="button-primary flex-1" onClick={() => setOpen(false)}>{c.nav.start}</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  const c = getStackCopy(resolveLocale(useLocale()));
  const links = [
    { href: "/#modules", label: c.nav.modules },
    { href: "/#pricing", label: c.nav.pricing },
    { href: "/#how", label: c.nav.how },
    { href: "/signup", label: c.nav.start },
  ];

  return (
    <footer id="contact" className="border-t border-white/10 px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{c.footer.blurb}</p>
          {/* PLACEHOLDER: add a real contact email here. */}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">{c.footer.product}</p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            {links.map((link) => (
              <li key={link.href}><Link href={link.href} className="hover:text-white">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">{c.footer.modules}</p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            {products.map((product) => (
              <li key={product.id}>
                <Link href={product.marketingRoute} className="hover:text-white">{stackMarketing[product.id].name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* PLACEHOLDER: social profile links. */}
      <div className="mx-auto mt-12 flex w-full max-w-6xl items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45">
        <p>© {new Date().getFullYear()} AYV Automation Stack. {c.footer.rights}</p>
        <div className="flex gap-3" aria-hidden>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">in</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">x</span>
        </div>
      </div>
    </footer>
  );
}
