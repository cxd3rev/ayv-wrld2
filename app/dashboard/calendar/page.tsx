import { Calendar } from "@/components/calendar/calendar";
import { buildCalendarEvents } from "@/lib/calendar";
import { requireWorkspace } from "@/lib/auth/session";
import { getDashboardRecords } from "@/services/dashboard";
import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CalendarPage() {
  const { organization } = await requireWorkspace();
  const t = await getTranslations("calendar");
  const records = await getDashboardRecords(organization.id);
  const events = buildCalendarEvents(records);
  const serverToday = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="kicker">{t("kicker")}</p>
          <h1 className="display mt-4 text-4xl tracking-tight sm:text-6xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
        </div>
        <div className="border border-foreground/10 bg-card p-4 text-right">
          <CalendarDays className="ml-auto h-6 w-6 text-accent" aria-hidden="true" />
          <p className="display mt-3 text-3xl">{events.length}</p>
          <p className="text-xs text-muted">{t("eventCount", { count: events.length })}</p>
        </div>
      </div>
      <Calendar events={events} serverToday={serverToday} />
    </div>
  );
}
