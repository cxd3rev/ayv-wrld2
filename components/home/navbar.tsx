"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { getHomeCopy } from "@/components/home/home-copy";
import { resolveLocale } from "@/i18n/config";
import { Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const c = getHomeCopy(resolveLocale(useLocale()));
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/#products", label: c.products },
    { href: "/#how", label: c.how },
    { href: "/#pricing", label: c.pricing },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#F7F6F3]/90 backdrop-blur-md">
      <nav className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 lg:px-8" aria-label="Primary">
        <Link href="/" className="text-[13px] font-bold tracking-[0.16em] uppercase">
          AYV<sup className="ml-0.5 text-[0.62em] font-bold">©</sup>
        </Link>
        <div className="hidden items-center gap-8 pl-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-[#3a3a3a] hover:text-black">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center justify-end gap-4 md:flex">
          <LanguageSwitcher className="[&_select]:h-9 [&_select]:border-black/15 [&_select]:text-[#0A0A0A]" />
          <Link href="/login" className="text-sm text-[#0A0A0A]">{c.login}</Link>
          <Link href="/signup" className="inline-flex h-10 items-center rounded-full bg-[#0A0A0A] px-4 text-sm font-medium text-white">{c.tryNow}</Link>
        </div>
        <button type="button" className="col-start-3 justify-self-end p-2 md:hidden" aria-label={open ? c.close : c.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open ? (
        <div className="flex flex-col gap-4 border-t border-black/10 px-5 py-5 md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-lg font-medium" onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <LanguageSwitcher className="[&_select]:h-10 [&_select]:w-full [&_select]:border-black/15 [&_select]:text-[#0A0A0A]" />
          <Link href="/login" onClick={() => setOpen(false)}>{c.login}</Link>
          <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-medium text-white" onClick={() => setOpen(false)}>{c.tryNow}</Link>
        </div>
      ) : null}
    </header>
  );
}
