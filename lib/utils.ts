import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts. Use this in UI components. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getInitials(name: string | null | undefined) {
  if (!name) return "AY";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ?? "";
  const isLocal = !configured || /localhost|127\.0\.0\.1/i.test(configured);

  if (!isLocal) return configured;

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}`;
  }

  return configured || "http://localhost:3000";
}
