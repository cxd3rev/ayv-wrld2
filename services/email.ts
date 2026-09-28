import "server-only";

import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  template: string;
  organizationId?: string | null;
  userId?: string | null;
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
  return `
    <div style="font-family:sans-serif;background:#09090b;color:#f7f4ef;padding:32px">
      <h1 style="color:#F0A202;margin:0 0 16px">AYV WRLD</h1>
      <p>You were invited to join <strong>${opts.organizationName}</strong>.</p>
      <p><a href="${opts.inviteUrl}" style="color:#F0A202">Create your account</a> to get started.</p>
    </div>
  `;
}

export function welcomeEmail(opts: { name: string }) {
  return `
    <div style="font-family:sans-serif;background:#09090b;color:#f7f4ef;padding:32px">
      <h1 style="color:#F0A202;margin:0 0 16px">Welcome to AYV WRLD</h1>
      <p>Hi ${opts.name || "there"}, your workspace is ready.</p>
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

export function followUpEmail(opts: { organizationName: string; message: string }) {
  return `
    <div style="font-family:sans-serif;background:#0a0a0a;color:#ededed;padding:32px">
      <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#9a9a9a">${escapeHtml(opts.organizationName)}</p>
      <p style="margin:0;font-size:16px;line-height:1.6">${escapeHtml(opts.message)}</p>
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
