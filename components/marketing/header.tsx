"use client";

import { Logo } from "@/components/logo";
import { products } from "@/config/products";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/#products", label: "Products" },
  { href: "/#features", label: "Platform" },
  { href: "/#how", label: "How it works" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-6 lg:px-12">
        <Link href="/" aria-label="AYV WRLD home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-sm text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
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
          <div className="mt-16 flex gap-4 border-t border-border pt-8">
            <Link
              href="/login"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full border border-border text-base font-medium"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground"
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
    <footer className="relative z-10 border-t border-border px-6 py-16 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Focused software tools that turn everyday business tasks into automated revenue.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Products</p>
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
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Platform</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li>
                <Link href="/#features" className="transition-colors hover:text-accent">Features</Link>
              </li>
              <li>
                <Link href="/#how" className="transition-colors hover:text-accent">How it works</Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-accent">Get started</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Account</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li>
                <Link href="/login" className="transition-colors hover:text-accent">Log in</Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-accent">Sign up</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 flex w-full max-w-[1400px] flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">AYV WRLD</p>
        <p className="text-xs text-muted">© {new Date().getFullYear()} AYV WRLD. All rights reserved.</p>
      </div>
    </footer>
  );
}
