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
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { RecordPrefill } from "@/lib/record-entities";
import { recordProductName } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { bookingStatuses } from "@/lib/validations";
import {
  createBooking,
  deleteBooking,
  updateBookingReminder,
  updateBookingStatus,
} from "@/products/velto/actions";
import type { Booking, BookingStatus, Lead, Quote, RecordLink } from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<BookingStatus, "accent" | "warning" | "success" | "danger" | "neutral"> = {
  scheduled: "accent",
  confirmed: "warning",
  completed: "success",
  cancelled: "neutral",
  no_show: "danger",
};

const statusKeys: Record<
  BookingStatus,
  "statusScheduled" | "statusConfirmed" | "statusCompleted" | "statusCancelled" | "statusNoShow"
> = {
  scheduled: "statusScheduled",
  confirmed: "statusConfirmed",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
  no_show: "statusNoShow",
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDay(value: string | null, locale: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatTime(value: string, locale: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value.slice(0, 5);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
}

function isOpenBooking(booking: Booking) {
  return booking.status === "scheduled" || booking.status === "confirmed";
}

function isUpcoming(booking: Booking) {
  if (!isOpenBooking(booking)) return false;
  return booking.starts_on >= todayIsoDate();
}

function isReminderDue(booking: Booking) {
  if (!booking.reminder_on) return false;
  if (!isOpenBooking(booking)) return false;
  return booking.reminder_on <= todayIsoDate();
}

function fillLeadFields(form: HTMLFormElement, lead: Lead | undefined) {
  const name = form.elements.namedItem("customerName");
  const email = form.elements.namedItem("email");
  const phone = form.elements.namedItem("phone");
  if (name instanceof HTMLInputElement) name.value = lead?.name ?? "";
  if (email instanceof HTMLInputElement) email.value = lead?.email ?? "";
  if (phone instanceof HTMLInputElement) phone.value = lead?.phone ?? "";
}

export function VeltoBookingsWorkspace({
  bookings,
  leads,
  quotes,
  links,
  prefill,
  focusBookingId,
}: {
  bookings: Booking[];
  leads: Lead[];
  quotes: Quote[];
  links: RecordLink[];
  prefill?: RecordPrefill;
  focusBookingId?: string;
}) {
  const t = useTranslations("velto");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const fromLead = useMemo(
    () => (prefill?.product === "avyro" ? leads.find((lead) => lead.id === prefill.id) : undefined),
    [leads, prefill],
  );

  const counts = useMemo(() => {
    return {
      upcoming: bookings.filter(isUpcoming).length,
      reminders: bookings.filter(isReminderDue).length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      missed: bookings.filter((booking) => booking.status === "no_show").length,
    };
  }, [bookings]);

  useEffect(() => {
    if (!focusBookingId) return;
    document.getElementById(`booking-${focusBookingId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusBookingId]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createBooking(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add this booking.");
      return;
    }
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("velto-add-booking") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title={t("upcoming")} value={String(counts.upcoming)} hint={t("upcomingHint")} />
        <DashboardCard title={t("reminders")} value={String(counts.reminders)} hint={t("remindersHint")} />
        <DashboardCard title={t("completed")} value={String(counts.completed)} hint={t("completedHint")} />
        <DashboardCard title={t("missed")} value={String(counts.missed)} hint={t("missedHint")} />
      </div>

      <form
        id="velto-add-booking"
        action={onAdd}
        className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="md:col-span-2 lg:col-span-4">
          <IncomingLinkFields
            prefillProduct={prefill?.product === "avyro" ? undefined : prefill?.product}
            prefillId={prefill?.product === "avyro" ? undefined : prefill?.id}
          />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addBooking")}</p>
          {prefill ? (
            <p className="mt-2 text-sm text-muted">
              {t("prefill", { name: prefill.name, product: recordProductName(prefill.product) })}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="customerName">{t("customer")}</Label>
          <Input
            id="customerName"
            name="customerName"
            placeholder="Alex Rivera"
            required
            defaultValue={prefill?.name ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="service">{t("service")}</Label>
          <Input
            id="service"
            name="service"
            placeholder="Consultation"
            required
            defaultValue={prefill?.product === "rovyn" ? (prefill.title ?? "") : ""}
          />
        </div>
        <div>
          <Label htmlFor="startsOn">{t("date")}</Label>
          <Input id="startsOn" name="startsOn" type="date" required />
        </div>
        <div>
          <Label htmlFor="startTime">{t("time")}</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="alex@business.com"
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
          <Label htmlFor="reminderOn">{t("remindOn")}</Label>
          <Input id="reminderOn" name="reminderOn" type="date" />
        </div>
        <div>
          <Label htmlFor="leadId">{t("avyroLead")}</Label>
          <Select
            id="leadId"
            name="leadId"
            defaultValue={fromLead?.id ?? ""}
            onChange={(event) => {
              const form = event.currentTarget.form;
              const lead = leads.find((item) => item.id === event.target.value);
              if (!form || !lead) return;
              fillLeadFields(form, lead);
            }}
          >
            <option value="">{t("noLinkedLead")}</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </Select>
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
        {bookings.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyBody")}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("colWhen")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH>{t("colReminder")}</TH>
                <TH>{t("colConnected")}</TH>
                <TH>{t("colNotes")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {bookings.map((booking) => {
                const focused = focusBookingId === booking.id;
                return (
                  <TR
                    key={booking.id}
                    id={`booking-${booking.id}`}
                    className={cn(focused && "bg-accent-soft")}
                  >
                    <TD>
                      <p className="font-medium">{booking.customer_name}</p>
                      <p className="mt-1 text-muted">{booking.service}</p>
                      {booking.email ? <p className="mt-1 text-xs text-muted">{booking.email}</p> : null}
                      {booking.phone ? <p className="mt-1 text-xs text-muted">{booking.phone}</p> : null}
                      {isReminderDue(booking) ? (
                        <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-warning uppercase">
                          {t("reminderDue")}
                        </p>
                      ) : null}
                    </TD>
                    <TD>
                      <p>{formatDay(booking.starts_on, locale)}</p>
                      <p className="mt-1 text-muted">{formatTime(booking.start_time, locale)}</p>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone[booking.status]}>{t(statusKeys[booking.status])}</Badge>
                        <select
                          aria-label={t("statusFor", { name: booking.customer_name })}
                          className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                          defaultValue={booking.status}
                          onChange={async (event) => {
                            const result = await updateBookingStatus(booking.id, event.target.value);
                            if (!result.ok) {
                              toast({ title: result.error ?? "Could not update status", tone: "error" });
                              return;
                            }
                            toast({ title: t("statusUpdated"), tone: "success" });
                            router.refresh();
                          }}
                        >
                          {bookingStatuses.map((status) => (
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
                        aria-label={t("reminderFor", { name: booking.customer_name })}
                        defaultValue={booking.reminder_on ?? ""}
                        className={cn(
                          "h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm",
                          isReminderDue(booking) && "border-warning/40 text-warning",
                        )}
                        onChange={async (event) => {
                          const result = await updateBookingReminder(booking.id, event.target.value);
                          if (!result.ok) {
                            toast({ title: result.error ?? "Could not save reminder", tone: "error" });
                            return;
                          }
                          toast({ title: t("reminderSaved"), tone: "success" });
                          router.refresh();
                        }}
                      />
                      {booking.reminder_on ? (
                        <p className="mt-1 text-xs text-muted">{formatDay(booking.reminder_on, locale)}</p>
                      ) : null}
                    </TD>
                    <TD>
                      <ConnectedRecords
                        product="velto"
                        recordId={booking.id}
                        links={links}
                        leads={leads}
                        bookings={bookings}
                        quotes={quotes}
                      />
                    </TD>
                    <TD className="max-w-xs text-muted">{booking.notes || "—"}</TD>
                    <TD className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const result = await deleteBooking(booking.id);
                          if (!result.ok) {
                            toast({ title: result.error ?? "Could not remove booking", tone: "error" });
                            return;
                          }
                          toast({ title: t("removed"), tone: "success" });
                          router.refresh();
                        }}
                      >
                        {t("remove")}
                      </Button>
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
