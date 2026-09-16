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
    toast({ title: "Invite sent", tone: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {canInvite ? (
        <form action={onInvite} className="grid gap-4 border border-foreground/10 p-4 sm:grid-cols-[1fr_160px_auto]">
          <div>
            <Label htmlFor="email">Invite member</Label>
            <Input id="email" name="email" type="email" placeholder="teammate@business.com" required />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select id="role" name="role" defaultValue="member">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Invite"}
            </Button>
          </div>
          <div className="sm:col-span-3">
            <FormError message={error} />
          </div>
        </form>
      ) : null}

      <DataTable
        rows={members}
        emptyTitle="No teammates yet"
        emptyDescription="Invite someone to share this workspace."
        columns={[
          {
            key: "name",
            header: "Name",
            render: (member) => member.profiles?.full_name || "Pending profile",
          },
          {
            key: "email",
            header: "Email",
            render: (member) => member.profiles?.email || "—",
          },
          {
            key: "role",
            header: "Role",
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
                    toast({ title: "Role updated", tone: "success" });
                    router.refresh();
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              ) : (
                <Badge tone={member.role === "owner" ? "accent" : "neutral"}>{member.role}</Badge>
              ),
          },
        ]}
      />
    </div>
  );
}
