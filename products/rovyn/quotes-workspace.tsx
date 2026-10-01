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
import { createChurnWatch, deleteChurnWatch, saveRovynSettings } from "@/products/rovyn/actions";
import type { ChurnWatch, ModuleSettings } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

function person(row: ChurnWatch) {
  return Array.isArray(row.clients) ? row.clients[0] : row.clients;
}

export function RovynQuotesWorkspace({
  watches,
  settings,
  focusId,
}: {
  watches: ChurnWatch[];
  settings: ModuleSettings;
  focusId?: string;
}) {
  const t = useTranslations("rovyn");
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
    const result = await createChurnWatch(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? t("emptyTitle"));
      return;
    }
    setSaved(t("added"));
    toast({ title: result.message ?? t("added"), tone: "success" });
    (document.getElementById("rovyn-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <form id="rovyn-add" action={onAdd} className="workspace-card grid gap-4 p-5 sm:p-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addQuote")}</p>
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
          <Label htmlFor="frequencyDays">{t("frequencyDays")}</Label>
          <Input id="frequencyDays" name="frequencyDays" type="number" min={1} max={365} required />
        </div>
        <div>
          <Label htmlFor="lastActivityOn">{t("lastActivity")}</Label>
          <Input id="lastActivityOn" name="lastActivityOn" type="date" required />
        </div>
        <div className="flex flex-col gap-3 md:col-span-3">
          <PrimaryAction pending={pending}>{pending ? t("adding") : t("add")}</PrimaryAction>
          <ActionFeedback message={saved} />
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-12">
        {watches.length === 0 ? (
          <EmptyState className="py-20" title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("frequencyDays")}</TH>
                <TH>{t("lastActivity")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {watches.map((row) => {
                const client = person(row);
                return (
                  <TR key={row.id} className={focusId === row.id ? "bg-accent-soft" : undefined}>
                    <TD>
                      <p className="font-medium">{client?.name ?? "—"}</p>
                      <p className="mt-1 text-muted">{client?.email || "—"}</p>
                    </TD>
                    <TD>{row.frequency_days}</TD>
                    <TD>{row.last_activity_on}</TD>
                    <TD>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={row.status === "at_risk" ? "danger" : "accent"}>{t(`status_${row.status}`)}</Badge>
                        {row.origin === "velto" ? <Badge tone="warning">{t("fromVelto")}</Badge> : null}
                      </div>
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
            const result = await saveRovynSettings(formData);
            toast({ title: result.ok ? t("settingsSaved") : (result.error ?? t("settingsTitle")), tone: result.ok ? "success" : "error" });
            if (result.ok) router.refresh();
          }} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="marginDays">{t("marginDays")}</Label>
              <Input id="marginDays" name="marginDays" type="number" min={0} max={180} defaultValue={settings.churn_margin_days} />
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
          const result = await deleteChurnWatch(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : (result.error ?? t("removeBody")), tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
