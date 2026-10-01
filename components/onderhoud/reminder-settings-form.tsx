"use client";

import { saveReminderSettings } from "@/products/onderhoud/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function ReminderSettingsForm({ days }: { days: number }) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <form
      action={async (formData) => {
        const result = await saveReminderSettings(formData);
        setSaved(result.ok);
        setError(result.ok ? "" : result.error ?? "Mislukt.");
      }}
      className="workspace-card mt-6 grid max-w-md gap-3 p-5"
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Herinnering</p>
      <div>
        <Label htmlFor="reminderLeadDays">Dagen op voorhand</Label>
        <Input id="reminderLeadDays" name="reminderLeadDays" type="number" min={1} max={90} defaultValue={days} />
      </div>
      <p className="text-xs text-muted">De klant krijgt een e-mail dit aantal dagen voor de berekende datum. Standaard is 30.</p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm">Bewaard.</p> : null}
      <Button type="submit">Bewaren</Button>
    </form>
  );
}
