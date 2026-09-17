"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { industries } from "@/config/products";
import { completeOnboarding } from "@/services/organizations";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const tIndustries = useTranslations("industries");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const result = await completeOnboarding(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="businessName">{t("businessName")}</Label>
        <Input id="businessName" name="businessName" required />
      </div>
      <div>
        <Label htmlFor="industry">{t("industry")}</Label>
        <Select id="industry" name="industry" required defaultValue="">
          <option value="" disabled>
            {t("chooseIndustry")}
          </option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {tIndustries(industry)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="website">{t("website")}</Label>
        <Input id="website" name="website" placeholder="https://yourbusiness.com" />
      </div>
      <div>
        <Label htmlFor="businessEmail">{t("businessEmail")}</Label>
        <Input id="businessEmail" name="businessEmail" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">{t("phoneOptional")}</Label>
        <Input id="phone" name="phone" />
      </div>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("creatingWorkspace") : t("createWorkspace")}
      </Button>
    </form>
  );
}
