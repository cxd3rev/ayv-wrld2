"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
