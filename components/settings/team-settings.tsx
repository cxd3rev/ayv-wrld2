"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAppUrl } from "@/lib/utils";
import { inviteMember, revokeInvite, updateMemberRole } from "@/services/organizations";
import type { MemberRole, MemberWithProfile, OrganizationInvite } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TeamSettings({
  members,
  invites,
  canInvite,
  canChangeRoles,
}: {
  members: MemberWithProfile[];
  invites: OrganizationInvite[];
  canInvite: boolean;
  canChangeRoles: boolean;
}) {
  const t = useTranslations("settings");
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  async function onInvite(formData: FormData) {
    setError("");
    setShareUrl("");
    setPending(true);
    const result = await inviteMember(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not send invite.");
      return;
    }
    setShareUrl(result.inviteUrl);
    toast({
      title: result.emailed ? t("inviteSent") : t("emailFailed"),
      tone: result.emailed ? "success" : "error",
    });
    router.refresh();
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    toast({ title: t("copied"), tone: "success" });
  }

  return (
    <div className="space-y-8">
      {canInvite ? (
        <form action={onInvite} className="grid gap-4 border border-foreground/10 p-4 sm:grid-cols-[1fr_160px_auto]">
          <div>
            <Label htmlFor="email">{t("inviteMember")}</Label>
            <Input id="email" name="email" type="email" placeholder="teammate@business.com" required />
          </div>
          <div>
            <Label htmlFor="role">{t("role")}</Label>
            <Select id="role" name="role" defaultValue="member">
              <option value="member">{t("member")}</option>
              <option value="admin">{t("admin")}</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              {pending ? t("sending") : t("invite")}
            </Button>
          </div>
          <div className="sm:col-span-3 space-y-3">
            <FormError message={error} />
            {shareUrl ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={shareUrl} aria-label={t("inviteLink")} />
                <Button type="button" variant="secondary" onClick={() => copyLink(shareUrl)}>
                  {t("copyLink")}
                </Button>
              </div>
            ) : null}
          </div>
        </form>
      ) : null}

      {canInvite && invites.length ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">{t("pendingInvites")}</h2>
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {invites.map((invite) => {
              const url = `${getAppUrl()}/invite/${invite.token}`;
              return (
                <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm">{invite.email}</p>
                    <p className="text-xs text-muted">{invite.role === "admin" ? t("admin") : t("member")} · {t("pending")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyLink(url)}>
                      {t("copyLink")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const result = await revokeInvite(invite.id);
                        if (!result.ok) {
                          toast({ title: result.error ?? t("revoke"), tone: "error" });
                          return;
                        }
                        toast({ title: t("revoked"), tone: "success" });
                        router.refresh();
                      }}
                    >
                      {t("revoke")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <DataTable
        rows={members}
        emptyTitle={t("noTeammates")}
        emptyDescription={t("noTeammatesBody")}
        columns={[
          {
            key: "name",
            header: t("name"),
            render: (member) => member.profiles?.full_name || t("pendingProfile"),
          },
          {
            key: "email",
            header: t("email"),
            render: (member) => member.profiles?.email || "—",
          },
          {
            key: "role",
            header: t("role"),
            render: (member) =>
              canChangeRoles && member.role !== "owner" ? (
                <select
                  className="rounded-lg border border-border bg-transparent px-2 py-1"
                  defaultValue={member.role}
                  onChange={async (event) => {
                    const result = await updateMemberRole(
                      member.id,
                      event.target.value as MemberRole,
                    );
                    if (!result.ok) {
                      toast({ title: result.error ?? "Could not update role", tone: "error" });
                      return;
                    }
                    toast({ title: t("roleUpdated"), tone: "success" });
                    router.refresh();
                  }}
                >
                  <option value="admin">{t("admin")}</option>
                  <option value="member">{t("member")}</option>
                </select>
              ) : (
                <Badge tone={member.role === "owner" ? "accent" : "neutral"}>
                  {member.role === "owner" ? t("owner") : member.role === "admin" ? t("admin") : t("member")}
                </Badge>
              ),
          },
        ]}
      />
    </div>
  );
}
