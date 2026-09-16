"use client";

import { Logo } from "@/components/logo";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [{ href: "/#products", label: "Products" }];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-6 lg:px-12">
        <Link href="/" aria-label="AYV WRLD home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-12 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-sm text-foreground/70 hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/login" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Get started
          </Link>
        </div>
        <button
          type="button"
          className="p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-0 top-20 z-40 bg-background px-8 pt-16 pb-8 md:hidden">
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
          <div className="mt-16 flex gap-4 border-t border-foreground/10 pt-8">
            <Link
              href="/login"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full border border-foreground/20 text-base font-medium"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-foreground text-base font-medium text-background"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-foreground/10 px-6 py-16 text-center lg:px-12">
      <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">AYV WRLD</p>
      <p className="mt-4 text-sm text-muted">Focused tools for everyday business work.</p>
    </footer>
  );
}
