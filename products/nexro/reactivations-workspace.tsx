"use client";

import { ConnectedRecords, IncomingLinkFields } from "@/components/connections/connected-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ActionFeedback, AdvancedPanel, AdvancedStats, TrashButton } from "@/components/workspace/simple-action";
import { useToast } from "@/hooks/use-toast";
import { buildNexroPeople, type NexroDetail } from "@/lib/nexro-customers";
import { recordProductName, type RecordPrefill } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { contactRelationships, reactivationKinds, reactivationStatuses } from "@/lib/validations";
import {
  createReactivation,
  deleteReactivation,
  saveContactRelationship,
  sendSavedReactivation,
  startNexroOutreach,
  updateReactivationStatus,
  updateReactivationTouch,
} from "@/products/nexro/actions";
import type {
  Booking,
  Contact,
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
  contacts,
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
  contacts: Contact[];
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
  const [notice, setNotice] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [offer, setOffer] = useState("");
  const [reward, setReward] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [kind, setKind] = useState<ReactivationKind>("winback");
  const [relationship, setRelationship] = useState<Record<string, string>>({});
  const [consentSource, setConsentSource] = useState<Record<string, string>>({});
  const [consentDate, setConsentDate] = useState<Record<string, string>>({});
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

  function knownContact(email: string | null) {
    if (!email) return null;
    return contacts.find((item) => item.email === email.trim().toLowerCase()) ?? null;
  }

  async function saveRelationship(personKey: string) {
    const person = [...people.ready, ...people.waiting].find((item) => item.key === personKey);
    if (!person) return;
    setPendingKey(`save:${person.key}`);
    const result = await saveContactRelationship({
      name: person.name,
      email: person.email ?? "",
      phone: person.phone ?? "",
      relationship: relationship[person.key] ?? "",
      consentSource: consentSource[person.key] ?? "",
      consentDate: consentDate[person.key] ?? "",
    });
    setPendingKey(null);
    toast({ title: result.ok ? t("relationshipSaved") : result.error, tone: result.ok ? "success" : "error" });
    if (result.ok) router.refresh();
  }

  function relationshipFields(personKey: string) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          aria-label={t("relationship")}
          value={relationship[personKey] ?? ""}
          onChange={(event) => setRelationship((current) => ({ ...current, [personKey]: event.target.value }))}
          className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
        >
          <option value="">{t("relationship")}</option>
          {contactRelationships.map((value) => (
            <option key={value} value={value}>{t(value === "existing_customer" ? "existingCustomer" : "consent")}</option>
          ))}
        </select>
        {relationship[personKey] === "consent" ? (
          <>
            <Input
              value={consentSource[personKey] ?? ""}
              onChange={(event) => setConsentSource((current) => ({ ...current, [personKey]: event.target.value }))}
              placeholder={t("consentSource")}
              className="h-9 max-w-48"
            />
            <Input
              type="date"
              aria-label={t("consentDate")}
              value={consentDate[personKey] ?? ""}
              onChange={(event) => setConsentDate((current) => ({ ...current, [personKey]: event.target.value }))}
              className="h-9 max-w-40"
            />
          </>
        ) : null}
        <Button type="button" size="sm" variant="secondary" disabled={pendingKey === `save:${personKey}`} onClick={() => saveRelationship(personKey)}>
          {t("saveRelationship")}
        </Button>
      </div>
    );
  }

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
      relationship: relationship[person.key] ?? "",
      consentSource: consentSource[person.key] ?? "",
      consentDate: consentDate[person.key] ?? "",
    });
    setPendingKey(null);
    if (result.ok) setNotice(t("sentEmail"));
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
    const savedMessage = result.sent ? t("sentEmail") : t("added");
    setNotice(savedMessage);
    toast({ title: savedMessage, tone: "success" });
    (document.getElementById("nexro-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <section className="workspace-card p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("readyTitle")}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("readyHelp")}</p>
        <p className="mt-1 text-xs text-muted">{t("fromName", { name: organizationName })}</p>
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
                    {knownContact(person.email) ? ` · ${t("relationshipReady")}` : ""}
                  </p>
                  {relationshipFields(person.key)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {person.situation === "winback" ? (
                    <Button size="lg" className="h-14" disabled={pendingKey === `winback:${person.key}`} onClick={() => contactPerson(person.key, "winback")}>
                      {pendingKey === `winback:${person.key}` ? t("sending") : t("sendWinback")}
                    </Button>
                  ) : (
                    <Button size="lg" className="h-14" disabled={!knownContact(person.email) || pendingKey === `referral:${person.key}`} onClick={() => contactPerson(person.key, "referral")}>
                      {pendingKey === `referral:${person.key}` ? t("sending") : t("askReferral")}
                    </Button>
                  )}
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
                  {relationshipFields(person.key)}
                </div>
                <Button size="lg" className="h-14" disabled={pendingKey === `winback:${person.key}`} onClick={() => contactPerson(person.key, "winback")}>
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
        {kind === "referral" ? (
          <div className="md:col-span-2">
            <Label htmlFor="contactId">{t("existingContact")}</Label>
            <select id="contactId" name="contactId" required className="h-10 w-full rounded-md border border-foreground/15 bg-card px-2 text-sm">
              <option value="">{t("chooseContact")}</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.name} · {contact.email}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">{t("referralOnlyExisting")}</p>
          </div>
        ) : (
        <div>
          <Label htmlFor="customerName">{t("customer")}</Label>
          <Input id="customerName" name="customerName" required defaultValue={prefill?.name ?? ""} />
        </div>
        )}
        <div>
          <Label htmlFor="kind">{t("kind")}</Label>
          <select id="kind" name="kind" value={kind} onChange={(event) => setKind(event.target.value as ReactivationKind)} className="h-10 w-full rounded-md border border-foreground/15 bg-card px-2 text-sm">
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
        {kind === "winback" ? (
          <>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" type="email" defaultValue={prefill?.email ?? ""} />
            </div>
            <div>
              <Label htmlFor="relationship">{t("relationship")}</Label>
              <select id="relationship" name="relationship" className="h-10 w-full rounded-md border border-foreground/15 bg-card px-2 text-sm" defaultValue="">
                <option value="">{t("relationship")}</option>
                {contactRelationships.map((value) => (
                  <option key={value} value={value}>{t(value === "existing_customer" ? "existingCustomer" : "consent")}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="consentSource">{t("consentSource")}</Label>
              <Input id="consentSource" name="consentSource" placeholder={t("consentSource")} />
            </div>
            <div>
              <Label htmlFor="consentDate">{t("consentDate")}</Label>
              <Input id="consentDate" name="consentDate" type="date" />
            </div>
          </>
        ) : (
          <input type="hidden" name="customerName" value="Existing contact" />
        )}
        {kind === "winback" ? (
          <div>
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" name="phone" type="tel" placeholder={tCommon("optional")} defaultValue={prefill?.phone ?? ""} />
          </div>
        ) : null}
        <div className="md:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-4">
          <FormError message={error} />
          <Button type="submit" name="intent" value="send" size="lg" className="h-14 w-full text-base" disabled={pending}>{pending ? t("sending") : t("sendEmail")}</Button>
          <ActionFeedback message={notice} />
        </div>
      </form>

      <AdvancedPanel label={tCommon("advanced")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="nexro-offer">{t("offer")}</Label>
            <Input id="nexro-offer" value={offer} onChange={(event) => setOffer(event.target.value)} placeholder={t("offerPlaceholder")} />
          </div>
          <div>
            <Label htmlFor="nexro-reward">{t("reward")}</Label>
            <Input id="nexro-reward" value={reward} onChange={(event) => setReward(event.target.value)} placeholder={t("rewardPlaceholder")} />
          </div>
        </div>
        {people.ready.filter((person) => person.situation === "winback").map((person) => (
          <Button key={person.key} type="button" variant="secondary" disabled={!knownContact(person.email) || pendingKey === `referral:${person.key}`} onClick={() => contactPerson(person.key, "referral")}>
            {person.name}: {pendingKey === `referral:${person.key}` ? t("sending") : t("askReferral")}
          </Button>
        ))}
        <Button type="submit" form="nexro-add" name="intent" value="save" variant="secondary" disabled={pending}>{t("saveOnly")}</Button>
        <AdvancedStats
          items={[
            { label: t("scheduled"), value: String(counts.scheduled), hint: t("scheduledHint") },
            { label: t("sent"), value: String(counts.sent), hint: t("sentHint") },
            { label: t("won"), value: String(counts.won), hint: t("wonHint") },
            { label: t("referrals"), value: String(counts.referrals), hint: t("referralsHint") },
          ]}
        />
        {reactivations.length ? (
          <div className="max-w-sm">
            <Label htmlFor="nexro-search">{tCommon("searchRecords")}</Label>
            <Input id="nexro-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} />
          </div>
        ) : null}
      </AdvancedPanel>

      <div className="mt-12">
        {reactivations.length === 0 ? (
          <EmptyState className="py-20" title={t("emptyTitle")} description={t("emptyBody")} />
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
                    <TrashButton label={t("remove")} onClick={() => setDeleteId(item.id)} />
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
