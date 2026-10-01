import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getWorkspace } from "@/lib/auth/session";
import { acceptInvite } from "@/services/organizations";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type InvitePreview = {
  organization_name: string;
  email: string;
  role: "admin" | "member";
};

async function previewInvite(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("preview_organization_invite", { invite_token: token });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.organization_name || !row.email) return null;
  return row as InvitePreview;
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getTranslations("settings");
  const invite = await previewInvite(token);
  const workspace = await getWorkspace();

  if (!invite) {
    if (workspace?.organization) redirect("/dashboard");
    return (
      <AuthShell title={t("inviteMissing")} description={t("inviteMissingBody")}>
        <Link href="/login" className="text-sm text-accent hover:underline">
          {t("inviteLogin")}
        </Link>
      </AuthShell>
    );
  }

  const roleLabel = invite.role === "admin" ? t("admin") : t("member");
  const next = `/invite/${token}`;
  const query = new URLSearchParams({ email: invite.email, next });
  const signedInEmail = workspace?.email?.toLowerCase() ?? "";
  const emailMatches = signedInEmail === invite.email.toLowerCase();

  async function join() {
    "use server";
    await acceptInvite(token);
  }

  return (
    <AuthShell title={invite.organization_name} description={t("inviteBody", { role: roleLabel })}>
      {workspace && emailMatches ? (
        <form action={join}>
          <Button type="submit" size="lg" className="w-full">
            {t("joinWorkspace")}
          </Button>
        </form>
      ) : null}
      {workspace && !emailMatches ? (
        <p className="text-sm text-muted">{t("wrongEmail", { email: invite.email })}</p>
      ) : null}
      {!workspace ? (
        <div className="space-y-3">
          <Link
            href={`/login?${query}`}
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
          >
            {t("inviteLogin")}
          </Link>
          <Link
            href={`/signup?${query}`}
            className="inline-flex h-14 w-full items-center justify-center rounded-full border border-foreground/20 text-sm font-medium"
          >
            {t("inviteSignup")}
          </Link>
        </div>
      ) : null}
    </AuthShell>
  );
}
