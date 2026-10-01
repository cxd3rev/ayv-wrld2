"use client";

import { createSlot, deleteSlot } from "@/products/onderhoud/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function SlotForm() {
  const [error, setError] = useState("");
  return (
    <form
      action={async (formData) => {
        const result = await createSlot(formData);
        setError(result.ok ? "" : result.error ?? "Mislukt.");
      }}
      className="workspace-card grid gap-3 p-5 md:grid-cols-2"
    >
      <div className="md:col-span-2"><p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Tijdslot openen</p></div>
      <div><Label htmlFor="startsAt">Van</Label><Input id="startsAt" name="startsAt" type="datetime-local" required /></div>
      <div><Label htmlFor="endsAt">Tot</Label><Input id="endsAt" name="endsAt" type="datetime-local" required /></div>
      {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
      <Button type="submit" className="md:col-span-2">Slot openen</Button>
    </form>
  );
}

export function DeleteSlotButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      className="text-sm text-muted underline"
      onClick={() => deleteSlot(id)}
    >
      Sluiten
    </button>
  );
}
