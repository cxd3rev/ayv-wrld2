"use client";

import {
  ConnectedRecords,
  IncomingLinkFields,
} from "@/components/connections/connected-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { RecordPrefill } from "@/lib/record-entities";
import { recordProductName } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { leadStatuses } from "@/lib/validations";
import {
  createLead,
  updateLeadFollowUp,
  updateLeadStatus,
} from "@/products/avyro/actions";
import type { Booking, Lead, LeadStatus, Quote, RecordLink } from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<LeadStatus, "accent" | "warning" | "success" | "danger"> = {
  new: "accent",
  contacted: "warning",
  won: "success",
  lost: "danger",
};

const statusKeys: Record<LeadStatus, "statusNew" | "statusContacted" | "statusWon" | "statusLost"> = {
  new: "statusNew",
  contacted: "statusContacted",
  won: "statusWon",
  lost: "statusLost",
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatFollowUp(value: string | null, locale: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function isFollowUpDue(lead: Lead) {
  if (!lead.follow_up_on) return false;
  if (lead.status === "won" || lead.status === "lost") return false;
  return lead.follow_up_on <= todayIsoDate();
}

export function AvyroLeadsWorkspace({
  leads,
  bookings,
  quotes,
  links,
  prefill,
  focusLeadId,
}: {
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  links: RecordLink[];
  prefill?: RecordPrefill;
  focusLeadId?: string;
}) {
  const t = useTranslations("avyro");
  const tCommon = useTranslations("common");
  const locale = useLocale();
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

  useEffect(() => {
    if (!focusLeadId) return;
    document.getElementById(`lead-${focusLeadId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusLeadId]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createLead(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add this lead.");
      return;
    }
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("avyro-add-lead") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title={t("new")} value={String(counts.new)} hint={t("newHint")} />
        <DashboardCard title={t("contacted")} value={String(counts.contacted)} hint={t("contactedHint")} />
        <DashboardCard title={t("won")} value={String(counts.won)} hint={t("wonHint")} />
        <DashboardCard title={t("due")} value={String(counts.due)} hint={t("dueHint")} />
      </div>

      <form
        id="avyro-add-lead"
        action={onAdd}
        className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
      >
        <div className="md:col-span-2 lg:col-span-4">
          <IncomingLinkFields prefillProduct={prefill?.product} prefillId={prefill?.id} />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addLead")}</p>
          {prefill ? (
            <p className="mt-2 text-sm text-muted">
              {t("prefill", { name: prefill.name, product: recordProductName(prefill.product) })}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            name="name"
            placeholder="Jordan Lee"
            required
            defaultValue={prefill?.name ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jordan@business.com"
            defaultValue={prefill?.email ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder={tCommon("optional")}
            defaultValue={prefill?.phone ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="followUpOn">{t("followUpOn")}</Label>
          <Input id="followUpOn" name="followUpOn" type="date" />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("adding") : t("add")}
          </Button>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-8">
        {leads.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyBody")}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colLead")}</TH>
                <TH>{t("colContact")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH>{t("colFollowUp")}</TH>
                <TH>{t("colNotes")}</TH>
                <TH>{t("colConnected")}</TH>
              </TR>
            </THead>
            <TBody>
              {leads.map((lead) => {
                const focused = focusLeadId === lead.id;
                return (
                  <TR
                    key={lead.id}
                    id={`lead-${lead.id}`}
                    className={cn(focused && "bg-accent-soft")}
                  >
                    <TD>
                      <p className="font-medium">{lead.name}</p>
                      {isFollowUpDue(lead) ? (
                        <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-warning uppercase">
                          {t("followUpToday")}
                        </p>
                      ) : null}
                    </TD>
                    <TD>
                      <p>{lead.email || "—"}</p>
                      {lead.phone ? <p className="mt-1 text-muted">{lead.phone}</p> : null}
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone[lead.status]}>{t(statusKeys[lead.status])}</Badge>
                        <select
                          aria-label={t("statusFor", { name: lead.name })}
                          className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                          defaultValue={lead.status}
                          onChange={async (event) => {
                            const result = await updateLeadStatus(lead.id, event.target.value);
                            if (!result.ok) {
                              toast({ title: result.error ?? "Could not update status", tone: "error" });
                              return;
                            }
                            toast({ title: t("statusUpdated"), tone: "success" });
                            router.refresh();
                          }}
                        >
                          {leadStatuses.map((status) => (
                            <option key={status} value={status}>
                              {t(statusKeys[status])}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TD>
                    <TD>
                      <input
                        type="date"
                        aria-label={t("followUpFor", { name: lead.name })}
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
                          toast({ title: t("followUpSaved"), tone: "success" });
                          router.refresh();
                        }}
                      />
                      {lead.follow_up_on ? (
                        <p className="mt-1 text-xs text-muted">{formatFollowUp(lead.follow_up_on, locale)}</p>
                      ) : null}
                    </TD>
                    <TD className="max-w-xs text-muted">{lead.notes || "—"}</TD>
                    <TD>
                      <ConnectedRecords
                        product="avyro"
                        recordId={lead.id}
                        links={links}
                        leads={leads}
                        bookings={bookings}
                        quotes={quotes}
                      />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
