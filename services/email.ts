import "server-only";

import { PRODUCT_NAME } from "@/config/site";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  template: string;
  organizationId?: string | null;
  userId?: string | null;
  headers?: Record<string, string>;
};

/**
 * Shared email service.
 *
 * Future products should call `sendEmail()` instead of talking to Resend
 * directly. That keeps API keys, logging, and templates in one place.
 */
function configuredFromAddress() {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from || !from.includes("@") || from.toLowerCase().includes("example.com")) return null;
  return from;
}

export async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = configuredFromAddress();

  if (!apiKey || !from) {
    await logEmailEvent({
      ...input,
      status: "failed",
      error: "Resend is not configured.",
    });
    return { ok: false as const, error: "Email is not configured yet." };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      headers: input.headers,
    });

    if (result.error) {
      await logEmailEvent({
        ...input,
        status: "failed",
        error: "Email provider rejected the message.",
      });
      return { ok: false as const, error: "Could not send email." };
    }

    await logEmailEvent({
      ...input,
      status: "sent",
      providerId: result.data?.id ?? null,
    });

    return { ok: true as const, id: result.data?.id };
  } catch {
    await logEmailEvent({
      ...input,
      status: "failed",
      error: "Email send failed.",
    });
    return { ok: false as const, error: "Could not send email." };
  }
}

export function teamInviteEmail(opts: {
  organizationName: string;
  inviteUrl: string;
}) {
  const organizationName = escapeHtml(opts.organizationName);
  const inviteUrl = escapeHtml(opts.inviteUrl);
  return `
    <div style="font-family:sans-serif;background:#09090b;color:#f7f4ef;padding:32px">
      <h1 style="color:#F0A202;margin:0 0 16px">${PRODUCT_NAME}</h1>
      <p>U bent uitgenodigd om mee te werken bij <strong>${organizationName}</strong>.</p>
      <p><a href="${inviteUrl}" style="color:#F0A202">Open de uitnodiging</a> en meld u aan met dit e-mailadres.</p>
    </div>
  `;
}

export function welcomeEmail(opts: { name: string }) {
  return `
    <div style="font-family:sans-serif;background:#09090b;color:#f7f4ef;padding:32px">
      <h1 style="color:#F0A202;margin:0 0 16px">Welkom bij ${PRODUCT_NAME}</h1>
      <p>Dag ${escapeHtml(opts.name || "daar")}, uw workspace is klaar.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function followUpEmail(opts: {
  organizationName: string;
  message: string;
  lines?: { label: string; value: string }[];
}) {
  const details = (opts.lines ?? [])
    .filter((line) => line.value.trim())
    .map(
      (line) =>
        `<p style="margin:0 0 6px;font-size:14px;line-height:1.5"><span style="color:#9a9a9a">${escapeHtml(line.label)}</span> ${escapeHtml(line.value)}</p>`,
    )
    .join("");
  return `
    <div style="font-family:sans-serif;background:#0a0a0a;color:#ededed;padding:32px">
      <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#9a9a9a">${escapeHtml(opts.organizationName)}</p>
      <p style="margin:0;font-size:16px;line-height:1.6">${escapeHtml(opts.message)}</p>
      ${details ? `<div style="margin-top:20px">${details}</div>` : ""}
    </div>
  `;
}

export function nexroOutreachEmail(opts: { organizationName: string; message: string }) {
  return `
    <div style="font-family:sans-serif;background:#0a0a0a;color:#ededed;padding:32px">
      <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#9a9a9a">${escapeHtml(opts.organizationName)}</p>
      <p style="margin:0;font-size:16px;line-height:1.6">${escapeHtml(opts.message)}</p>
    </div>
  `;
}

export function trialEndingEmailHtml(input: {
  name: string;
  endsOn: string;
  amountEur: number;
  period: string;
  portalUrl: string;
}) {
  return `
    <div style="font-family:sans-serif;line-height:1.6;color:#111">
      <p>Dag ${escapeHtml(input.name)},</p>
      <p>Je proefperiode van ${escapeHtml(PRODUCT_NAME)} loopt af op ${escapeHtml(input.endsOn)}. Daarna betaal je €${input.amountEur} per ${escapeHtml(input.period)} (excl. btw) met de kaart die je hebt opgegeven.</p>
      <p>Wil je niet verder? Zeg op voor ${escapeHtml(input.endsOn)} via deze link: <a href="${escapeHtml(input.portalUrl)}">${escapeHtml(input.portalUrl)}</a>. Dan betaal je niets.</p>
      <p>Vragen? Antwoord gewoon op deze mail.</p>
      <p>${escapeHtml(PRODUCT_NAME)}</p>
    </div>
  `;
}

export function maintenanceReminderHtml(input: {
  customerName: string;
  appliance: string;
  address: string;
  dueLabel: string;
  bookingUrl: string;
  installerName: string;
  installerPhone: string;
  unsubscribeUrl: string;
  legallyRequired: boolean;
}) {
  const duty = input.legallyRequired
    ? "Dat onderhoud is wettelijk verplicht en houdt je ketel veilig en zuinig."
    : "Dat houdt je ketel veilig en zuinig.";
  return `
    <div style="font-family:sans-serif;line-height:1.6;color:#111">
      <p>Dag ${escapeHtml(input.customerName)},</p>
      <p>Het onderhoud van je ${escapeHtml(input.appliance)} op ${escapeHtml(input.address)} is gepland voor rond ${escapeHtml(input.dueLabel)}. ${duty}</p>
      <p>Kies hier zelf een moment dat jou past: <a href="${escapeHtml(input.bookingUrl)}">${escapeHtml(input.bookingUrl)}</a></p>
      <p>Met vriendelijke groeten,<br/>${escapeHtml(input.installerName)}<br/>${escapeHtml(input.installerPhone)}</p>
      <p style="font-size:12px;color:#555">Je ontvangt deze mail omdat ${escapeHtml(input.installerName)} je ketel onderhoudt. Geen herinneringen meer? <a href="${escapeHtml(input.unsubscribeUrl)}">afmelden</a></p>
    </div>
  `;
}

async function logEmailEvent(input: SendEmailInput & {
  status: "queued" | "sent" | "failed";
  providerId?: string | null;
  error?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("email_events").insert({
      organization_id: input.organizationId ?? null,
      user_id: input.userId ?? null,
      to_email: input.to,
      template: input.template,
      status: input.status,
      provider_id: input.providerId ?? null,
      error: input.error ?? null,
    });
  } catch {
    // Logging should never break the product flow.
  }
}
