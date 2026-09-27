"use client";

import { ConnectedRecords, IncomingLinkFields } from "@/components/connections/connected-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { recordProductName, type RecordPrefill } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { reactivationKinds, reactivationStatuses } from "@/lib/validations";
import {
  createReactivation,
  deleteReactivation,
  updateReactivationStatus,
  updateReactivationTouch,
} from "@/products/nexro/actions";
import type {
  Booking,
  Invoice,
  Lead,
  Quote,
  Reactivation,
  ReactivationKind,
  ReactivationStatus,
  RecordLink,
  Review,
} from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<ReactivationStatus, "neutral" | "accent" | "warning" | "success"> = {
  scheduled: "neutral",
  sent: "accent",
  replied: "warning",
  won: "success",
  passed: "neutral",
};

const statusKeys: Record<
  ReactivationStatus,
  "statusScheduled" | "statusSent" | "statusReplied" | "statusWon" | "statusPassed"
> = {
  scheduled: "statusScheduled",
  sent: "statusSent",
  replied: "statusReplied",
  won: "statusWon",
  passed: "statusPassed",
};

const kindKeys: Record<ReactivationKind, "kindWinback" | "kindReferral"> = {
  winback: "kindWinback",
  referral: "kindReferral",
};

function isOpen(record: Reactivation) {
  return record.status === "scheduled" || record.status === "sent";
}

export function NexroReactivationsWorkspace({
  reactivations,
  reviews,
  leads,
  bookings,
  quotes,
  invoices,
  links,
  prefill,
  focusReactivationId,
}: {
  reactivations: Reactivation[];
  reviews: Review[];
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  invoices: Invoice[];
  links: RecordLink[];
  prefill?: RecordPrefill;
  focusReactivationId?: string;
}) {
  const t = useTranslations("nexro");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      scheduled: reactivations.filter((item) => item.status === "scheduled").length,
      sent: reactivations.filter((item) => item.status === "sent").length,
      won: reactivations.filter((item) => item.status === "won").length,
      referrals: reactivations.filter((item) => item.kind === "referral").length,
    }),
    [reactivations],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle) return reactivations;
    return reactivations.filter((item) =>
      [item.customer_name, item.message, item.incentive, item.email, item.phone, item.notes].some((value) =>
        value?.toLocaleLowerCase(locale).includes(needle),
      ),
    );
  }, [locale, query, reactivations]);

  useEffect(() => {
    if (!focusReactivationId) return;
    document.getElementById(`reactivation-${focusReactivationId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusReactivationId]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createReactivation(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("nexro-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        <DashboardCard title={t("scheduled")} value={String(counts.scheduled)} hint={t("scheduledHint")} />
        <DashboardCard title={t("sent")} value={String(counts.sent)} hint={t("sentHint")} />
        <DashboardCard title={t("won")} value={String(counts.won)} hint={t("wonHint")} />
        <DashboardCard title={t("referrals")} value={String(counts.referrals)} hint={t("referralsHint")} />
      </div>

      <form id="nexro-add" action={onAdd} className="workspace-card mt-10 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4">
          <IncomingLinkFields prefillProduct={prefill?.product} prefillId={prefill?.id} />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addOutreach")}</p>
          {prefill ? (
            <p className="mt-2 text-sm text-muted">
              {t("prefill", { name: prefill.name, product: recordProductName(prefill.product) })}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="customerName">{t("customer")}</Label>
          <Input id="customerName" name="customerName" required defaultValue={prefill?.name ?? ""} />
        </div>
        <div>
          <Label htmlFor="kind">{t("kind")}</Label>
          <select id="kind" name="kind" defaultValue="winback" className="h-10 w-full rounded-md border border-foreground/15 bg-card px-2 text-sm">
            {reactivationKinds.map((kind) => (
              <option key={kind} value={kind}>{t(kindKeys[kind])}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="message">{t("message")}</Label>
          <Input id="message" name="message" required placeholder={t("messagePlaceholder")} />
        </div>
        <div>
          <Label htmlFor="incentive">{t("incentive")}</Label>
          <Input id="incentive" name="incentive" placeholder={t("incentivePlaceholder")} />
        </div>
        <div>
          <Label htmlFor="lastSeenOn">{t("lastSeenOn")}</Label>
          <Input id="lastSeenOn" name="lastSeenOn" type="date" />
        </div>
        <div>
          <Label htmlFor="nextTouchOn">{t("nextTouchOn")}</Label>
          <Input id="nextTouchOn" name="nextTouchOn" type="date" />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={prefill?.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" placeholder={tCommon("optional")} defaultValue={prefill?.phone ?? ""} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between gap-4">
          <FormError message={error} />
          <Button type="submit" disabled={pending}>{pending ? t("adding") : t("add")}</Button>
        </div>
      </form>

      <div className="mt-8">
        {reactivations.length ? (
          <div className="mb-4 max-w-sm">
            <Label htmlFor="nexro-search">{tCommon("searchRecords")}</Label>
            <Input
              id="nexro-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        ) : null}
        {reactivations.length === 0 ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("colKind")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH>{t("colTouch")}</TH>
                <TH>{t("colConnected")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {visible.map((item) => (
                <TR
                  key={item.id}
                  id={`reactivation-${item.id}`}
                  className={cn(focusReactivationId === item.id && "bg-accent-soft")}
                >
                  <TD>
                    <p className="font-medium">{item.customer_name}</p>
                    <p className="text-xs text-muted">{item.message}</p>
                    {item.incentive ? <p className="text-xs text-muted">{item.incentive}</p> : null}
                  </TD>
                  <TD>{t(kindKeys[item.kind])}</TD>
                  <TD>
                    <Badge tone={statusTone[item.status]}>{t(statusKeys[item.status])}</Badge>
                    <select
                      aria-label={t("statusFor", { name: item.customer_name })}
                      className="mt-2 block h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                      defaultValue={item.status}
                      onChange={async (event) => {
                        const result = await updateReactivationStatus(item.id, event.target.value);
                        toast({ title: result.ok ? t("statusUpdated") : result.error, tone: result.ok ? "success" : "error" });
                        if (result.ok) router.refresh();
                      }}
                    >
                      {reactivationStatuses.map((status) => (
                        <option key={status} value={status}>{t(statusKeys[status])}</option>
                      ))}
                    </select>
                  </TD>
                  <TD>
                    <input
                      type="date"
                      aria-label={t("touchFor", { name: item.customer_name })}
                      defaultValue={item.next_touch_on ?? ""}
                      disabled={!isOpen(item)}
                      className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                      onChange={async (event) => {
                        const result = await updateReactivationTouch(item.id, event.target.value);
                        toast({ title: result.ok ? t("touchSaved") : result.error, tone: result.ok ? "success" : "error" });
                        if (result.ok) router.refresh();
                      }}
                    />
                  </TD>
                  <TD>
                    <ConnectedRecords
                      product="nexro"
                      recordId={item.id}
                      links={links}
                      leads={leads}
                      bookings={bookings}
                      quotes={quotes}
                      invoices={invoices}
                      reactivations={reactivations}
                      reviews={reviews}
                    />
                  </TD>
                  <TD className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>{t("remove")}</Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
      <ConfirmationDialog
        open={Boolean(deleteId)}
        title={t("removeTitle")}
        description={t("removeBody")}
        confirmLabel={t("remove")}
        cancelLabel={tCommon("cancel")}
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          const result = await deleteReactivation(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : result.error, tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
