"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { whatsappUrl } from "@/lib/business";
import { automationBrand } from "@/config/brands";
import { legacyModulesEnabled } from "@/config/features";
import { CONTACT_EMAIL, CONTACT_PHONE, PRODUCT_NAME } from "@/config/site";
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
      <span className="text-sm font-semibold tracking-tight">{legacyModulesEnabled ? "AYV Stack" : PRODUCT_NAME}</span>
    </span>
  );
}

export function MarketingHeader() {
  const c = getStackCopy(resolveLocale(useLocale()));
  const [open, setOpen] = useState(false);
  const links = legacyModulesEnabled
    ? [
        { href: "/#modules", label: c.nav.modules },
        { href: "/#pricing", label: c.nav.pricing },
        { href: "/#how", label: c.nav.how },
        { href: "/#contact", label: c.nav.contact },
      ]
    : [
        { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
        { href: "/#functies", label: "Functies" },
        { href: "/prijzen", label: "Prijzen" },
        { href: "/#vragen", label: "Vragen" },
      ];
  const loginLabel = legacyModulesEnabled ? c.nav.login : "Inloggen";
  const startLabel = legacyModulesEnabled ? c.nav.start : "Gratis proberen";

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
        <Link href="/" aria-label={PRODUCT_NAME}>
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
          {legacyModulesEnabled ? <LanguageSwitcher /> : null}
          <Link href="/login" className="text-sm text-white/70 transition-colors hover:text-white">{loginLabel}</Link>
          <Link href="/signup" className="button-primary h-10 min-h-10 px-4">{startLabel}</Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {legacyModulesEnabled ? <LanguageSwitcher /> : null}
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
              {legacyModulesEnabled ? products.map((product) => (
                <Link key={product.id} href={product.marketingRoute} onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 px-3 py-3 text-sm">
                  {stackMarketing[product.id].name}
                </Link>
              )) : null}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="button-secondary flex-1" onClick={() => setOpen(false)}>{loginLabel}</Link>
            <Link href="/signup" className="button-primary flex-1" onClick={() => setOpen(false)}>{startLabel}</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  const c = getStackCopy(resolveLocale(useLocale()));
  const whatsapp = whatsappUrl();
  const testCustomer = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Testklant ${PRODUCT_NAME}`)}`;

  if (!legacyModulesEnabled) {
    return (
      <footer className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-12 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li><Link href="/#functies" className="hover:text-white">Functies</Link></li>
              <li><Link href="/prijzen" className="hover:text-white">Prijzen</Link></li>
              <li><Link href="/login" className="hover:text-white">Inloggen</Link></li>
              <li><Link href="/signup" className="hover:text-white">Gratis proberen</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li><a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">{CONTACT_EMAIL}</a></li>
              <li><a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="hover:text-white">{CONTACT_PHONE}</a></li>
              <li><a href={testCustomer} className="hover:text-white">Word testklant</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Juridisch</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li><Link href="/privacy" className="hover:text-white">Privacybeleid</Link></li>
              <li><Link href="/voorwaarden" className="hover:text-white">Algemene voorwaarden</Link></li>
              <li><Link href="/verwerkersovereenkomst" className="hover:text-white">Verwerkersovereenkomst</Link></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-12 w-full max-w-6xl border-t border-white/10 pt-6 text-xs text-white/45">
          © {new Date().getFullYear()} {PRODUCT_NAME} · <a href="https://www.ayvwrld.com" className="hover:text-white">Gemaakt door AYV WRLD</a>
        </p>
      </footer>
    );
  }

  return (
    <footer className="border-t border-white/10 px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-3">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{c.footer.blurb}</p>
          {whatsapp ? (
            <a href={whatsapp} className="mt-2 inline-flex text-sm text-white/80 hover:text-white" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">{c.footer.product}</p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li><Link href="/#modules" className="hover:text-white">{c.nav.modules}</Link></li>
            <li><Link href="/#pricing" className="hover:text-white">{c.nav.pricing}</Link></li>
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
    </footer>
  );
}
