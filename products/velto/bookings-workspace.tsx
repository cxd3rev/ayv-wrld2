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
import { confirmRenewal, createRenewal, deleteRenewal, lapseRenewal, saveVeltoSettings } from "@/products/velto/actions";
import type { ModuleSettings, Renewal, RenewalStatus } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tone: Record<RenewalStatus, "accent" | "warning" | "success" | "danger"> = {
  scheduled: "accent",
  reminded: "warning",
  renewed: "success",
  lapsed: "danger",
};

function person(row: Renewal) {
  return Array.isArray(row.clients) ? row.clients[0] : row.clients;
}

export function VeltoBookingsWorkspace({
  renewals,
  settings,
  focusId,
}: {
  renewals: Renewal[];
  settings: ModuleSettings;
  focusId?: string;
}) {
  const t = useTranslations("velto");
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
    const result = await createRenewal(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? t("emptyTitle"));
      return;
    }
    setSaved(t("added"));
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("velto-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <form id="velto-add" action={onAdd} className="workspace-card grid gap-4 p-5 sm:p-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addBooking")}</p>
        </div>
        <div>
          <Label htmlFor="name">{t("customer")}</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="planName">{t("planName")}</Label>
          <Input id="planName" name="planName" required />
        </div>
        <div>
          <Label htmlFor="renewsOn">{t("renewsOn")}</Label>
          <Input id="renewsOn" name="renewsOn" type="date" required />
        </div>
        <div className="flex flex-col gap-3 md:col-span-3">
          <PrimaryAction pending={pending}>{pending ? t("adding") : t("add")}</PrimaryAction>
          <ActionFeedback message={saved} />
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-12">
        {renewals.length === 0 ? (
          <EmptyState className="py-20" title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("planName")}</TH>
                <TH>{t("renewsOn")}</TH>
                <TH>{t("colReminder")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {renewals.map((row) => {
                const client = person(row);
                return (
                  <TR key={row.id} className={focusId === row.id ? "bg-accent-soft" : undefined}>
                    <TD>
                      <p className="font-medium">{client?.name ?? "—"}</p>
                      <p className="mt-1 text-muted">{client?.email || "—"}</p>
                    </TD>
                    <TD>{row.plan_name}</TD>
                    <TD>{row.renews_on}</TD>
                    <TD>{row.reminder_on}</TD>
                    <TD>
                      <Badge tone={tone[row.status]}>{t(`status_${row.status}`)}</Badge>
                      {row.status !== "renewed" ? (
                        <div className="mt-2 flex gap-2">
                          <button type="button" className="text-xs text-muted underline" onClick={async () => {
                            const result = await confirmRenewal(row.id);
                            toast({ title: result.ok ? t("renewed") : (result.error ?? t("colStatus")), tone: result.ok ? "success" : "error" });
                            if (result.ok) router.refresh();
                          }}>{t("markRenewed")}</button>
                          {row.status !== "lapsed" ? (
                            <button type="button" className="text-xs text-muted underline" onClick={async () => {
                              const result = await lapseRenewal(row.id);
                              toast({ title: result.ok ? t("lapsed") : (result.error ?? t("colStatus")), tone: result.ok ? "success" : "error" });
                              if (result.ok) router.refresh();
                            }}>{t("markLapsed")}</button>
                          ) : null}
                        </div>
                      ) : null}
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
            const result = await saveVeltoSettings(formData);
            toast({ title: result.ok ? t("settingsSaved") : (result.error ?? t("settingsTitle")), tone: result.ok ? "success" : "error" });
            if (result.ok) router.refresh();
          }} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="leadDays">{t("leadDays")}</Label>
              <Input id="leadDays" name="leadDays" type="number" min={1} max={90} defaultValue={settings.renewal_lead_days} />
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
          const result = await deleteRenewal(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : (result.error ?? t("removeBody")), tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
