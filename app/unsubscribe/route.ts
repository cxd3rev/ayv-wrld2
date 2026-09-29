import { NextResponse } from "next/server";
import type { AppLocale } from "@/i18n/config";
import { suppressAddress } from "@/lib/outreach-mail";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { createAdminClient } from "@/lib/supabase/admin";

const copy: Record<AppLocale, { title: string; ok: string; bad: string }> = {
  en: {
    title: "Unsubscribed",
    ok: "You will no longer receive Nexro or Ravelo emails from this business.",
    bad: "This unsubscribe link is not valid.",
  },
  nl: {
    title: "Afgemeld",
    ok: "Je ontvangt geen Nexro- of Ravelo-mails meer van dit bedrijf.",
    bad: "Deze afmeldlink is niet geldig.",
  },
  fr: {
    title: "Désinscription",
    ok: "Vous ne recevrez plus d'e-mails Nexro ou Ravelo de cette entreprise.",
    bad: "Ce lien de désinscription n'est pas valide.",
  },
  de: {
    title: "Abgemeldet",
    ok: "Sie erhalten keine Nexro- oder Ravelo-E-Mails mehr von diesem Unternehmen.",
    bad: "Dieser Abmeldelink ist ungültig.",
  },
};

function page(locale: AppLocale, message: string, ok: boolean) {
  const text = copy[locale];
  const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${text.title}</title></head><body style="margin:0;background:#0a0a0a;color:#ededed;font-family:sans-serif"><main style="max-width:32rem;margin:0 auto;padding:4rem 1.5rem"><h1 style="font-size:1.75rem;font-weight:500">${text.title}</h1><p style="line-height:1.6;color:#cfcfcf">${message}</p></main></body></html>`;
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function unsubscribe(token: string) {
  const payload = verifyUnsubscribeToken(token);
  if (!payload) return { ok: false as const, locale: "en" as const };
  const saved = await suppressAddress(payload.organizationId, payload.email, "unsubscribe");
  if (!saved) return { ok: false as const, locale: payload.locale };
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("name")
    .eq("id", payload.organizationId)
    .maybeSingle();
  const name = typeof data?.name === "string" && data.name ? data.name : "";
  return { ok: true as const, locale: payload.locale, name, email: payload.email };
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const result = await unsubscribe(token);
  if (!result.ok) return page(result.locale, copy[result.locale].bad, false);
  const company = result.name ? ` ${result.name}` : "";
  return page(result.locale, `${result.email}${company ? ` —${company}` : ""}. ${copy[result.locale].ok}`, true);
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const result = await unsubscribe(token);
  if (!result.ok) return new NextResponse("Invalid unsubscribe link", { status: 400 });
  return new NextResponse("Unsubscribed", { status: 200 });
}
