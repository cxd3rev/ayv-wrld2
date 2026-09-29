import "server-only";

import { resolveLocale, type AppLocale } from "@/i18n/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getAppUrl } from "@/lib/utils";
import { sendEmail } from "@/services/email";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

const footerCopy: Record<
  AppLocale,
  { unsubscribe: string; note: string }
> = {
  en: {
    unsubscribe: "Unsubscribe",
    note: "You received this because you are a customer, or because you gave consent.",
  },
  nl: {
    unsubscribe: "Afmelden",
    note: "Je ontvangt dit omdat je klant bent, of omdat je toestemming gaf.",
  },
  fr: {
    unsubscribe: "Se désinscrire",
    note: "Vous recevez ceci parce que vous êtes client, ou parce que vous avez donné votre accord.",
  },
  de: {
    unsubscribe: "Abmelden",
    note: "Sie erhalten dies, weil Sie Kunde sind oder weil Sie eingewilligt haben.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function outreachEmailHtml(opts: {
  organizationName: string;
  contactLine: string;
  message: string;
  unsubscribeUrl: string;
  locale: AppLocale;
}) {
  const copy = footerCopy[opts.locale];
  return `
    <div style="font-family:sans-serif;background:#0a0a0a;color:#ededed;padding:32px">
      <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#9a9a9a">${escapeHtml(opts.organizationName)}</p>
      <p style="margin:0;font-size:16px;line-height:1.6">${escapeHtml(opts.message)}</p>
      <hr style="margin:28px 0 16px;border:0;border-top:1px solid rgba(255,255,255,0.15)" />
      <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#cfcfcf">${escapeHtml(opts.organizationName)}</p>
      <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#9a9a9a">${escapeHtml(opts.contactLine)}</p>
      <p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:#9a9a9a">${escapeHtml(copy.note)}</p>
      <p style="margin:0;font-size:13px"><a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#ededed">${escapeHtml(copy.unsubscribe)}</a></p>
    </div>
  `;
}

export async function isSuppressed(organizationId: string, email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("suppression_list")
    .select("id")
    .eq("workspace_id", organizationId)
    .eq("email", normalizeEmail(email))
    .limit(1);
  if (error) return { ok: false as const, error: "Could not check the unsubscribe list." };
  return { ok: true as const, suppressed: Boolean(data && data.length > 0) };
}

export async function suppressAddress(organizationId: string, email: string, reason: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("suppression_list").upsert(
    {
      workspace_id: organizationId,
      email: normalizeEmail(email),
      reason,
    },
    { onConflict: "workspace_id,email", ignoreDuplicates: true },
  );
  return !error;
}

export async function sendOutreachEmail(opts: {
  to: string;
  subject: string;
  message: string;
  template: string;
  organizationId: string;
  organizationName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  locale: string;
}) {
  const locale = resolveLocale(opts.locale);
  const to = normalizeEmail(opts.to);
  const suppressed = await isSuppressed(opts.organizationId, to);
  if (!suppressed.ok) return { ok: false as const, error: suppressed.error };
  if (suppressed.suppressed) {
    return { ok: false as const, error: "This address is unsubscribed." };
  }

  const token = signUnsubscribeToken({
    organizationId: opts.organizationId,
    email: to,
    locale,
  });
  if (!token) return { ok: false as const, error: "Unsubscribe links are not configured." };

  const unsubscribeUrl = `${getAppUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
  const contactLine = [opts.contactEmail, opts.contactPhone, opts.website].filter(Boolean).join(" · ");
  return sendEmail({
    to,
    subject: opts.subject,
    html: outreachEmailHtml({
      organizationName: opts.organizationName,
      contactLine: contactLine || opts.organizationName,
      message: opts.message,
      unsubscribeUrl,
      locale,
    }),
    template: opts.template,
    organizationId: opts.organizationId,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
