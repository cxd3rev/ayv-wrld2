"use client";

import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ActionFeedback, AdvancedPanel, PrimaryAction, TrashButton } from "@/components/workspace/simple-action";
import { useToast } from "@/hooks/use-toast";
import { createCheckIn, deleteCheckIn, saveAvyroSettings } from "@/products/avyro/actions";
import type { CheckIn, CheckInStatus, ModuleSettings } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tone: Record<CheckInStatus, "accent" | "warning" | "success" | "danger"> = {
  scheduled: "accent",
  sent: "warning",
  positive: "success",
  neutral: "warning",
  negative: "danger",
};

function person(row: CheckIn) {
  return Array.isArray(row.clients) ? row.clients[0] : row.clients;
}

export function AvyroLeadsWorkspace({
  checkIns,
  settings,
  focusId,
}: {
  checkIns: CheckIn[];
  settings: ModuleSettings;
  focusId?: string;
}) {
  const t = useTranslations("avyro");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createCheckIn(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? t("emptyTitle"));
      return;
    }
    setSaved(t("added"));
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("avyro-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <form id="avyro-add" action={onAdd} className="workspace-card grid gap-4 p-5 sm:p-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addLead")}</p>
        </div>
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" required placeholder="Jordan Lee" />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" placeholder="jordan@business.com" />
        </div>
        <div>
          <Label htmlFor="servedOn">{t("servedOn")}</Label>
          <Input id="servedOn" name="servedOn" type="date" required />
        </div>
        <div className="flex flex-col gap-3 md:col-span-3">
          <PrimaryAction pending={pending}>{pending ? t("adding") : t("add")}</PrimaryAction>
          <ActionFeedback message={saved} />
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-12">
        {checkIns.length === 0 ? (
          <EmptyState className="py-20" title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colLead")}</TH>
                <TH>{t("colContact")}</TH>
                <TH>{t("servedOn")}</TH>
                <TH>{t("colFollowUp")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {checkIns.map((row) => {
                const client = person(row);
                const flagged = row.status === "negative" || row.status === "neutral";
                return (
                  <TR key={row.id} id={`checkin-${row.id}`} className={focusId === row.id ? "bg-accent-soft" : undefined}>
                    <TD>
                      <p className="font-medium">{client?.name ?? "—"}</p>
                      {flagged ? <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-warning uppercase">{t("flagged")}</p> : null}
                    </TD>
                    <TD>
                      <p>{client?.email || "—"}</p>
                      {client?.phone ? <p className="mt-1 text-muted">{client.phone}</p> : null}
                    </TD>
                    <TD>{row.served_on}</TD>
                    <TD>{row.check_in_on}</TD>
                    <TD>
                      <Badge tone={tone[row.status]}>{t(`status_${row.status}`)}</Badge>
                    </TD>
                    <TD className="text-right">
                      <TrashButton label={t("remove")} onClick={() => setDeleteId(row.id)} />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>

      <div className="mt-8">
      <AdvancedPanel label={t("settingsTitle")}>
        <form action={async (formData) => {
          const result = await saveAvyroSettings(formData);
          toast({ title: result.ok ? t("settingsSaved") : (result.error ?? t("settingsTitle")), tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="delayDays">{t("delayDays")}</Label>
            <Input id="delayDays" name="delayDays" type="number" min={0} max={60} defaultValue={settings.check_in_delay_days} />
          </div>
          <PrimaryAction>{t("saveSettings")}</PrimaryAction>
        </form>
      </AdvancedPanel>
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
          const result = await deleteCheckIn(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : (result.error ?? t("removeBody")), tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
