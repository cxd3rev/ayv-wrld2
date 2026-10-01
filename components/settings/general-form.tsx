"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { legacyModulesEnabled } from "@/config/features";
import { industries } from "@/config/products";
import { useToast } from "@/hooks/use-toast";
import { updateOrganizationSettings } from "@/services/organizations";
import type { Organization } from "@/types/database";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function GeneralSettingsForm({ organization }: { organization: Organization }) {
  const t = useTranslations("settings");
  const tIndustries = useTranslations("industries");
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const result = await updateOrganizationSettings(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save settings.");
      return;
    }
    toast({ title: t("saved"), description: result.message, tone: "success" });
  }

  return (
    <form action={onSubmit} className="max-w-xl space-y-4">
      <div>
        <Label htmlFor="name">{t("businessName")}</Label>
        <Input id="name" name="name" defaultValue={organization.name} required />
      </div>
      {legacyModulesEnabled ? (
        <>
          <div>
            <Label htmlFor="website">{t("website")}</Label>
            <Input id="website" name="website" defaultValue={organization.website ?? ""} />
          </div>
          <div>
            <Label htmlFor="industry">{t("industry")}</Label>
            <Select id="industry" name="industry" defaultValue={organization.industry ?? "Other"}>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {tIndustries(industry)}
                </option>
              ))}
            </Select>
          </div>
        </>
      ) : (
        <>
          <input type="hidden" name="website" value={organization.website ?? ""} />
          <input type="hidden" name="industry" value={organization.industry ?? "Other"} />
          <div>
            <Label htmlFor="vatNumber">BTW-nummer (optioneel)</Label>
            <Input id="vatNumber" name="vatNumber" defaultValue={organization.vat_number ?? ""} />
          </div>
          <div>
            <Label htmlFor="municipality">Gemeente</Label>
            <Input id="municipality" name="municipality" defaultValue={organization.municipality ?? ""} required />
          </div>
          <div>
            <Label htmlFor="serviceMunicipalities">In welke gemeenten werk je?</Label>
            <textarea
              id="serviceMunicipalities"
              name="serviceMunicipalities"
              defaultValue={(organization.service_municipalities ?? []).join("\n")}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-foreground/15 bg-transparent px-4 py-3 text-sm"
            />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="email">{t("businessEmail")}</Label>
        <Input id="email" name="email" type="email" defaultValue={organization.email ?? ""} required />
      </div>
      <div>
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" name="phone" defaultValue={organization.phone ?? ""} />
      </div>
      <FormError message={error} />
      <Button type="submit" disabled={pending}>
        {pending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
