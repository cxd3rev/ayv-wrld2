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
import { deleteLoyalty, saveLoyalty, saveOrvynSettings } from "@/products/orvyn/actions";
import type { LoyaltyRecord, ModuleSettings } from "@/types/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

function person(row: LoyaltyRecord) {
  return Array.isArray(row.clients) ? row.clients[0] : row.clients;
}

export function OrvynInvoicesWorkspace({
  records,
  settings,
  focusId,
}: {
  records: LoyaltyRecord[];
  settings: ModuleSettings;
  focusId?: string;
}) {
  const t = useTranslations("orvyn");
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
    const result = await saveLoyalty(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? t("emptyTitle"));
      return;
    }
    setSaved(result.message ?? t("added"));
    toast({ title: result.message ?? t("added"), tone: "success" });
    (document.getElementById("orvyn-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <form id="orvyn-add" action={onAdd} className="workspace-card grid gap-4 p-5 sm:p-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addInvoice")}</p>
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
          <Label htmlFor="visitCount">{t("visitCount")}</Label>
          <Input id="visitCount" name="visitCount" type="number" min={0} required />
        </div>
        <div className="flex flex-col gap-3 md:col-span-3">
          <PrimaryAction pending={pending}>{pending ? t("adding") : t("add")}</PrimaryAction>
          <ActionFeedback message={saved} />
          <FormError message={error} />
        </div>
      </form>

      <div className="mt-12">
        {records.length === 0 ? (
          <EmptyState className="py-20" title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("visitCount")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {records.map((row) => {
                const client = person(row);
                return (
                  <TR key={row.id} className={focusId === row.id ? "bg-accent-soft" : undefined}>
                    <TD>
                      <p className="font-medium">{client?.name ?? "—"}</p>
                      <p className="mt-1 text-muted">{client?.email || "—"}</p>
                    </TD>
                    <TD>{row.visit_count}</TD>
                    <TD>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={row.status === "loyal" ? "success" : "accent"}>{t(`status_${row.status}`)}</Badge>
                        {row.origin === "avyro" ? <Badge tone="warning">{t("fromAvyro")}</Badge> : null}
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
            const result = await saveOrvynSettings(formData);
            toast({ title: result.ok ? t("settingsSaved") : (result.error ?? t("settingsTitle")), tone: result.ok ? "success" : "error" });
            if (result.ok) router.refresh();
          }} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="threshold">{t("threshold")}</Label>
              <Input id="threshold" name="threshold" type="number" min={1} max={100} defaultValue={settings.loyalty_threshold} />
              <label className="mt-3 flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="sendThankYou" defaultChecked={settings.send_thank_you} />
                {t("sendThankYou")}
              </label>
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
          const result = await deleteLoyalty(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : (result.error ?? t("removeBody")), tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
