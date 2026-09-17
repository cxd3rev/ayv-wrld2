"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { inviteMember, updateMemberRole } from "@/services/organizations";
import type { MemberRole, MemberWithProfile } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TeamSettings({
  members,
  canInvite,
  canChangeRoles,
}: {
  members: MemberWithProfile[];
  canInvite: boolean;
  canChangeRoles: boolean;
}) {
  const t = useTranslations("settings");
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onInvite(formData: FormData) {
    setError("");
    setPending(true);
    const result = await inviteMember(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not send invite.");
      return;
    }
    toast({ title: t("inviteSent"), tone: "success" });
    router.refresh();
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
          <div className="sm:col-span-3">
            <FormError message={error} />
          </div>
        </form>
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
