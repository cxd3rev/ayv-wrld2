import { createHmac, timingSafeEqual } from "crypto";
import { resolveLocale, type AppLocale } from "@/i18n/config";

export type UnsubscribePayload = {
  organizationId: string;
  email: string;
  locale: AppLocale;
};

function tokenSecret() {
  return process.env.UNSUBSCRIBE_SECRET?.trim() || process.env.CRON_SECRET?.trim() || "";
}

export function signUnsubscribeToken(payload: UnsubscribePayload) {
  const secret = tokenSecret();
  if (!secret) return null;
  const body = Buffer.from(
    JSON.stringify({
      o: payload.organizationId,
      e: payload.email.trim().toLowerCase(),
      l: payload.locale,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  const secret = tokenSecret();
  const [body, signature] = token.split(".");
  if (!secret || !body || !signature) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      o?: string;
      e?: string;
      l?: string;
    };
    if (!parsed.o || !parsed.e || !parsed.e.includes("@")) return null;
    return {
      organizationId: parsed.o,
      email: parsed.e.trim().toLowerCase(),
      locale: resolveLocale(parsed.l),
    };
  } catch {
    return null;
  }
}
