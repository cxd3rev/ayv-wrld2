"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { legacyModulesEnabled } from "@/config/features";
import { industries } from "@/config/products";
import { completeOnboarding } from "@/services/organizations";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const tIndustries = useTranslations("industries");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const result = await completeOnboarding(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  function addPlace() {
    const value = draft.trim();
    if (!value || places.includes(value)) return;
    setPlaces([...places, value]);
    setDraft("");
  }

  if (!legacyModulesEnabled) {
    return (
      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="businessName">Bedrijfsnaam</Label>
          <Input id="businessName" name="businessName" required />
        </div>
        <div>
          <Label htmlFor="vatNumber">BTW-nummer (optioneel)</Label>
          <Input id="vatNumber" name="vatNumber" />
        </div>
        <div>
          <Label htmlFor="municipality">Gemeente</Label>
          <Input id="municipality" name="municipality" required />
        </div>
        <div>
          <Label htmlFor="placeDraft">In welke gemeenten werk je?</Label>
          <div className="flex gap-2">
            <Input id="placeDraft" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <Button type="button" variant="secondary" onClick={addPlace}>Voeg toe</Button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {places.map((place) => (
              <li key={place}>
                <input type="hidden" name="serviceMunicipalities" value={place} />
                <button type="button" className="rounded-full border border-foreground/15 px-3 py-1 text-sm" onClick={() => setPlaces(places.filter((item) => item !== place))}>
                  {place} ×
                </button>
              </li>
            ))}
          </ul>
          {draft.trim() ? <input type="hidden" name="serviceMunicipalities" value={draft.trim()} /> : null}
        </div>
        <div>
          <Label htmlFor="businessEmail">E-mail</Label>
          <Input id="businessEmail" name="businessEmail" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Telefoon</Label>
          <Input id="phone" name="phone" required />
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Bezig…" : "Werkruimte maken"}
        </Button>
      </form>
    );
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
