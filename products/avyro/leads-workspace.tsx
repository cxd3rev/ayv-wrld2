"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { leadStatuses } from "@/lib/validations";
import {
  createLead,
  updateLeadFollowUp,
  updateLeadStatus,
} from "@/products/avyro/actions";
import type { Lead, LeadStatus } from "@/types/database";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const statusTone: Record<LeadStatus, "accent" | "warning" | "success" | "danger"> = {
  new: "accent",
  contacted: "warning",
  won: "success",
  lost: "danger",
};

const statusLabel: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatFollowUp(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function isFollowUpDue(lead: Lead) {
  if (!lead.follow_up_on) return false;
  if (lead.status === "won" || lead.status === "lost") return false;
  return lead.follow_up_on <= todayIsoDate();
}

export function AvyroLeadsWorkspace({ leads }: { leads: Lead[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const counts = useMemo(() => {
    return {
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      won: leads.filter((lead) => lead.status === "won").length,
      due: leads.filter(isFollowUpDue).length,
    };
  }, [leads]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createLead(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add this lead.");
      return;
    }
    toast({ title: "Lead added", tone: "success" });
    (document.getElementById("avyro-add-lead") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title="New" value={String(counts.new)} hint="Need a first follow-up" />
        <DashboardCard title="Contacted" value={String(counts.contacted)} hint="In conversation" />
        <DashboardCard title="Won" value={String(counts.won)} hint="Became customers" />
        <DashboardCard title="Due" value={String(counts.due)} hint="Follow-up date reached" />
      </div>

      <form
        id="avyro-add-lead"
        action={onAdd}
        className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
      >
        <div className="md:col-span-2 lg:col-span-4">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Add a lead</p>
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Jordan Lee" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jordan@business.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="Optional" />
        </div>
        <div>
          <Label htmlFor="followUpOn">Follow up on</Label>
          <Input id="followUpOn" name="followUpOn" type="date" />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Where they came from, what they asked for" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Adding..." : "Add lead"}
          </Button>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-8">
        {leads.length === 0 ? (
          <EmptyState
            title="No leads yet"
            description="Add someone you just spoke with. Avyro keeps them in this workspace so the next follow-up does not get lost."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Lead</TH>
                <TH>Contact</TH>
                <TH>Status</TH>
                <TH>Follow up</TH>
                <TH>Notes</TH>
              </TR>
            </THead>
            <TBody>
              {leads.map((lead) => (
                <TR key={lead.id}>
                  <TD>
                    <p className="font-medium">{lead.name}</p>
                    {isFollowUpDue(lead) ? (
                      <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-warning uppercase">
                        Follow up today
                      </p>
                    ) : null}
                  </TD>
                  <TD>
                    <p>{lead.email || "—"}</p>
                    {lead.phone ? <p className="mt-1 text-muted">{lead.phone}</p> : null}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone[lead.status]}>{statusLabel[lead.status]}</Badge>
                      <select
                        aria-label={`Status for ${lead.name}`}
                        className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                        defaultValue={lead.status}
                        onChange={async (event) => {
                          const result = await updateLeadStatus(lead.id, event.target.value);
                          if (!result.ok) {
                            toast({ title: result.error ?? "Could not update status", tone: "error" });
                            return;
                          }
                          toast({ title: "Status updated", tone: "success" });
                          router.refresh();
                        }}
                      >
                        {leadStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TD>
                  <TD>
                    <input
                      type="date"
                      aria-label={`Follow-up date for ${lead.name}`}
                      defaultValue={lead.follow_up_on ?? ""}
                      className={cn(
                        "h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm",
                        isFollowUpDue(lead) && "border-warning/40 text-warning",
                      )}
                      onChange={async (event) => {
                        const result = await updateLeadFollowUp(lead.id, event.target.value);
                        if (!result.ok) {
                          toast({ title: result.error ?? "Could not save follow-up", tone: "error" });
                          return;
                        }
                        toast({ title: "Follow-up saved", tone: "success" });
                        router.refresh();
                      }}
                    />
                    {lead.follow_up_on ? (
                      <p className="mt-1 text-xs text-muted">{formatFollowUp(lead.follow_up_on)}</p>
                    ) : null}
                  </TD>
                  <TD className="max-w-xs text-muted">{lead.notes || "—"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
