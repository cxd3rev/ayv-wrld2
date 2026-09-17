"use client";

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
import { cn } from "@/lib/utils";
import { bookingStatuses } from "@/lib/validations";
import {
  createBooking,
  deleteBooking,
  updateBookingLead,
  updateBookingReminder,
  updateBookingStatus,
} from "@/products/velto/actions";
import { openLinkedWorkspace } from "@/services/product-switch";
import type { Booking, BookingStatus, Lead } from "@/types/database";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<BookingStatus, "accent" | "warning" | "success" | "danger" | "neutral"> = {
  scheduled: "accent",
  confirmed: "warning",
  completed: "success",
  cancelled: "neutral",
  no_show: "danger",
};

const statusLabel: Record<BookingStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDay(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value.slice(0, 5);
  return new Intl.DateTimeFormat("en", {
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
  fromLeadId,
  focusBookingId,
}: {
  bookings: Booking[];
  leads: Lead[];
  fromLeadId?: string;
  focusBookingId?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const fromLead = useMemo(
    () => leads.find((lead) => lead.id === fromLeadId),
    [leads, fromLeadId],
  );

  const leadsById = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const lead of leads) map.set(lead.id, lead);
    return map;
  }, [leads]);

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
    toast({ title: "Booking added", tone: "success" });
    (document.getElementById("velto-add-booking") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-4">
        <DashboardCard title="Upcoming" value={String(counts.upcoming)} hint="Still on the calendar" />
        <DashboardCard title="Reminders" value={String(counts.reminders)} hint="Reach out today" />
        <DashboardCard title="Completed" value={String(counts.completed)} hint="Showed up" />
        <DashboardCard title="Missed" value={String(counts.missed)} hint="No-shows" />
      </div>

      <form
        id="velto-add-booking"
        action={onAdd}
        className="mt-10 grid gap-4 border border-foreground/10 p-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="md:col-span-2 lg:col-span-4">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Add a booking</p>
          {fromLead ? (
            <p className="mt-2 text-sm text-muted">
              Prefilling {fromLead.name} from Avyro. A lead is optional — you can still book without one.
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="customerName">Customer</Label>
          <Input
            id="customerName"
            name="customerName"
            placeholder="Alex Rivera"
            required
            defaultValue={fromLead?.name ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="service">Service</Label>
          <Input id="service" name="service" placeholder="Consultation" required />
        </div>
        <div>
          <Label htmlFor="startsOn">Date</Label>
          <Input id="startsOn" name="startsOn" type="date" required />
        </div>
        <div>
          <Label htmlFor="startTime">Time</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="alex@business.com"
            defaultValue={fromLead?.email ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Optional"
            defaultValue={fromLead?.phone ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="reminderOn">Remind on</Label>
          <Input id="reminderOn" name="reminderOn" type="date" />
        </div>
        <div>
          <Label htmlFor="leadId">Avyro lead</Label>
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
            <option value="">No linked lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="What they booked, anything to remember" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Adding..." : "Add booking"}
          </Button>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-8">
        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Add the next appointment. Velto keeps the date, time, and reminder in this workspace so fewer visits are missed."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Customer</TH>
                <TH>When</TH>
                <TH>Status</TH>
                <TH>Reminder</TH>
                <TH>Avyro lead</TH>
                <TH>Notes</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {bookings.map((booking) => {
                const linkedLead = booking.lead_id ? leadsById.get(booking.lead_id) : undefined;
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
                          Reminder due
                        </p>
                      ) : null}
                    </TD>
                    <TD>
                      <p>{formatDay(booking.starts_on)}</p>
                      <p className="mt-1 text-muted">{formatTime(booking.start_time)}</p>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone[booking.status]}>{statusLabel[booking.status]}</Badge>
                        <select
                          aria-label={`Status for ${booking.customer_name}`}
                          className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                          defaultValue={booking.status}
                          onChange={async (event) => {
                            const result = await updateBookingStatus(booking.id, event.target.value);
                            if (!result.ok) {
                              toast({ title: result.error ?? "Could not update status", tone: "error" });
                              return;
                            }
                            toast({ title: "Status updated", tone: "success" });
                            router.refresh();
                          }}
                        >
                          {bookingStatuses.map((status) => (
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
                        aria-label={`Reminder date for ${booking.customer_name}`}
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
                          toast({ title: "Reminder saved", tone: "success" });
                          router.refresh();
                        }}
                      />
                      {booking.reminder_on ? (
                        <p className="mt-1 text-xs text-muted">{formatDay(booking.reminder_on)}</p>
                      ) : null}
                    </TD>
                    <TD>
                      <div className="flex min-w-[10rem] flex-col items-start gap-2">
                        <select
                          aria-label={`Linked lead for ${booking.customer_name}`}
                          className="h-9 w-full rounded-md border border-foreground/15 bg-card px-2 text-sm"
                          defaultValue={booking.lead_id ?? ""}
                          onChange={async (event) => {
                            const result = await updateBookingLead(booking.id, event.target.value);
                            if (!result.ok) {
                              toast({ title: result.error ?? "Could not link lead", tone: "error" });
                              return;
                            }
                            toast({
                              title: event.target.value ? "Lead linked" : "Lead unlinked",
                              tone: "success",
                            });
                            router.refresh();
                          }}
                        >
                          <option value="">No linked lead</option>
                          {leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                              {lead.name}
                            </option>
                          ))}
                        </select>
                        {linkedLead ? (
                          <button
                            type="button"
                            className="text-left text-sm hover:text-accent"
                            onClick={() =>
                              openLinkedWorkspace("avyro", { lead: linkedLead.id })
                            }
                          >
                            Open {linkedLead.name} in Avyro
                          </button>
                        ) : null}
                      </div>
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
                          toast({ title: "Booking removed", tone: "success" });
                          router.refresh();
                        }}
                      >
                        Remove
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
