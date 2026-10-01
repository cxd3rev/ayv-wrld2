"use client";

import { bookSlot } from "@/products/onderhoud/booking-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function BookingForm({
  slug,
  slots,
}: {
  slug: string;
  slots: { id: string; label: string }[];
}) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  if (done) return <p className="mt-6 text-lg">Uw afspraak is genoteerd. De installateur ziet ze in het overzicht.</p>;
  if (slots.length === 0) return <p className="mt-6 text-muted">Er zijn momenteel geen open tijdsloten.</p>;
  return (
    <form
      action={async (formData) => {
        const result = await bookSlot(slug, formData);
        setDone(result.ok);
        setError(result.ok ? "" : result.error ?? "Mislukt.");
      }}
      className="mt-8 grid max-w-md gap-3"
    >
      <div>
        <Label htmlFor="slotId">Tijdslot</Label>
        <select id="slotId" name="slotId" required className="h-12 w-full rounded-md border border-foreground/15 bg-transparent px-3 text-sm">
          {slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
        </select>
      </div>
      <div><Label htmlFor="customerName">Naam</Label><Input id="customerName" name="customerName" required /></div>
      <div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required /></div>
      <div><Label htmlFor="phone">Telefoon</Label><Input id="phone" name="phone" /></div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit">Afspraak vastleggen</Button>
    </form>
  );
}
