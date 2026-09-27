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
import { buildNexroPeople, type NexroDetail } from "@/lib/nexro-customers";
import { recordProductName, type RecordPrefill } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { reactivationKinds, reactivationStatuses } from "@/lib/validations";
import {
  createReactivation,
  deleteReactivation,
  sendSavedReactivation,
  startNexroOutreach,
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
  organizationName,
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
  organizationName: string;
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
  const [offer, setOffer] = useState("");
  const [reward, setReward] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

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

  const people = useMemo(
    () => buildNexroPeople(leads, bookings, quotes, invoices, reactivations, today),
    [bookings, invoices, leads, quotes, reactivations, today],
  );

  const detailKey: Record<NexroDetail, "detailPaid" | "detailCompleted" | "detailWonQuote" | "detailWonLead" | "detailOpenInvoice" | "detailOpenBooking" | "detailOpenQuote" | "detailOpenLead"> = {
    paid: "detailPaid",
    completed: "detailCompleted",
    wonQuote: "detailWonQuote",
    wonLead: "detailWonLead",
    openInvoice: "detailOpenInvoice",
    openBooking: "detailOpenBooking",
    openQuote: "detailOpenQuote",
    openLead: "detailOpenLead",
  };

  async function contactPerson(personKey: string, kind: "winback" | "referral") {
    const person = [...people.ready, ...people.waiting].find((item) => item.key === personKey);
    if (!person) return;
    setPendingKey(`${kind}:${person.key}`);
    const result = await startNexroOutreach({
      customerName: person.name,
      email: person.email ?? "",
      phone: person.phone ?? "",
      kind,
      offer,
      incentive: reward,
      lastSeenOn: person.lastSeenOn,
      linkProduct: person.sourceProduct,
      linkId: person.sourceId,
    });
    setPendingKey(null);
    toast({
      title: result.ok ? t("sentEmail") : result.error,
      tone: result.ok ? "success" : "error",
    });
    if (result.ok) router.refresh();
  }

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createReactivation(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: result.sent ? t("sentEmail") : t("added"), tone: "success" });
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

      <section className="workspace-card mt-10 p-4">
        <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("readyTitle")}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("readyHelp")}</p>
        <p className="mt-1 text-xs text-muted">{t("fromName", { name: organizationName })}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="nexro-offer">{t("offer")}</Label>
            <Input id="nexro-offer" value={offer} onChange={(event) => setOffer(event.target.value)} placeholder={t("offerPlaceholder")} />
          </div>
          <div>
            <Label htmlFor="nexro-reward">{t("reward")}</Label>
            <Input id="nexro-reward" value={reward} onChange={(event) => setReward(event.target.value)} placeholder={t("rewardPlaceholder")} />
          </div>
        </div>
        {people.ready.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("noneReady")}</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {people.ready.map((person) => (
              <div key={person.key} className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs text-muted">
                    {t(detailKey[person.detail])} · {t("quietDays", { count: person.daysQuiet })}
                    {person.email ? "" : ` · ${t("noEmail")}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {person.situation === "winback" ? (
                    <Button size="sm" disabled={pendingKey === `winback:${person.key}`} onClick={() => contactPerson(person.key, "winback")}>
                      {pendingKey === `winback:${person.key}` ? t("sending") : t("sendWinback")}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="secondary" disabled={pendingKey === `referral:${person.key}`} onClick={() => contactPerson(person.key, "referral")}>
                    {pendingKey === `referral:${person.key}` ? t("sending") : t("askReferral")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("waitingTitle")}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("waitingHelp")}</p>
        {people.waiting.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("noneWaiting")}</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {people.waiting.map((person) => (
              <div key={person.key} className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs text-muted">
                    {t(detailKey[person.detail])} · {t("quietDays", { count: person.daysQuiet })}
                    {person.email ? "" : ` · ${t("noEmail")}`}
                  </p>
                </div>
                <Button size="sm" disabled={pendingKey === `winback:${person.key}`} onClick={() => contactPerson(person.key, "winback")}>
                  {pendingKey === `winback:${person.key}` ? t("sending") : t("sendWinback")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

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
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit" name="intent" value="save" variant="secondary" disabled={pending}>{t("saveOnly")}</Button>
            <Button type="submit" name="intent" value="send" disabled={pending}>{pending ? t("sending") : t("sendEmail")}</Button>
          </div>
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
                    {item.email && item.status !== "won" && item.status !== "passed" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mr-2"
                        disabled={pendingKey === item.id}
                        onClick={async () => {
                          setPendingKey(item.id);
                          const result = await sendSavedReactivation(item.id);
                          setPendingKey(null);
                          toast({ title: result.ok ? t("sentEmail") : result.error, tone: result.ok ? "success" : "error" });
                          if (result.ok) router.refresh();
                        }}
                      >
                        {pendingKey === item.id ? t("sending") : t("sendEmail")}
                      </Button>
                    ) : null}
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
