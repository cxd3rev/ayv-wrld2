"use client";

import { recordVisit } from "@/products/onderhoud/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function VisitForm({ boilerId }: { boilerId: string }) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <form
      action={async (formData) => {
        const result = await recordVisit(formData);
        setSaved(result.ok);
        setError(result.ok ? "" : result.error ?? "Mislukt.");
      }}
      className="workspace-card grid gap-3 p-5"
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Bezoek</p>
      <input type="hidden" name="boilerId" value={boilerId} />
      <div><Label htmlFor="visitedOn">Datum</Label><Input id="visitedOn" name="visitedOn" type="date" required /></div>
      <div><Label htmlFor="notes">Notities</Label><Input id="notes" name="notes" /></div>
      <div><Label htmlFor="certificate">Attest (PDF of foto)</Label><Input id="certificate" name="certificate" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="includesAudit" />
        Dit bezoek bevatte ook de verwarmingsaudit
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm">Bezoek bewaard. De laatste onderhoudsdatum is bijgewerkt.</p> : null}
      <Button type="submit">Bezoek bewaren</Button>
    </form>
  );
}
