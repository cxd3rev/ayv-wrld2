"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { industries } from "@/config/products";
import { completeOnboarding } from "@/services/organizations";
import { useState } from "react";

export function OnboardingForm() {
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
        <Label htmlFor="businessName">Business name</Label>
        <Input id="businessName" name="businessName" required />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select id="industry" name="industry" required defaultValue="">
          <option value="" disabled>
            Choose an industry
          </option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" placeholder="https://yourbusiness.com" />
      </div>
      <div>
        <Label htmlFor="businessEmail">Business email</Label>
        <Input id="businessEmail" name="businessEmail" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" />
      </div>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating workspace..." : "Create workspace"}
      </Button>
    </form>
  );
}
