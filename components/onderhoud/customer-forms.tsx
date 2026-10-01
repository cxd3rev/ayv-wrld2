"use client";

import { createAddress, createBoiler, createCustomer } from "@/products/onderhoud/actions";
import { fuelLabels } from "@/lib/onderhoud/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

function Feedback({ action, children }: { action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>; children: React.ReactNode }) {
  const [error, setError] = useState("");
  return (
    <form
      action={async (formData) => {
        const result = await action(formData);
        setError(result.ok ? "" : result.error ?? "Mislukt.");
        if (result.ok) (document.activeElement as HTMLElement | null)?.closest("form")?.reset();
      }}
      className="workspace-card grid gap-3 p-5"
    >
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit">Bewaren</Button>
    </form>
  );
}

export function CustomerForms({
  customers,
}: {
  customers: { id: string; name: string; addresses: { id: string; label: string }[] }[];
}) {
  const addresses = customers.flatMap((customer) => customer.addresses.map((address) => ({ ...address, customerName: customer.name })));
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Feedback action={createCustomer}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Klant</p>
        <div><Label htmlFor="name">Naam</Label><Input id="name" name="name" required /></div>
        <div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" /></div>
        <div><Label htmlFor="phone">Telefoon</Label><Input id="phone" name="phone" /></div>
      </Feedback>
      <Feedback action={createAddress}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Adres</p>
        <div>
          <Label htmlFor="customerId">Klant</Label>
          <select id="customerId" name="customerId" required className="h-12 w-full rounded-md border border-foreground/15 bg-transparent px-3 text-sm">
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
        </div>
        <div><Label htmlFor="street">Straat</Label><Input id="street" name="street" required /></div>
        <div><Label htmlFor="postalCode">Postcode</Label><Input id="postalCode" name="postalCode" required /></div>
        <div><Label htmlFor="municipality">Gemeente</Label><Input id="municipality" name="municipality" required /></div>
      </Feedback>
      <Feedback action={createBoiler}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Ketel</p>
        <div>
          <Label htmlFor="addressId">Adres</Label>
          <select id="addressId" name="addressId" required className="h-12 w-full rounded-md border border-foreground/15 bg-transparent px-3 text-sm">
            {addresses.map((address) => <option key={address.id} value={address.id}>{address.customerName} — {address.label}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="fuel">Brandstof</Label>
          <select id="fuel" name="fuel" className="h-12 w-full rounded-md border border-foreground/15 bg-transparent px-3 text-sm">
            {Object.entries(fuelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div><Label htmlFor="powerKw">Vermogen (kW)</Label><Input id="powerKw" name="powerKw" type="number" min="0.1" step="0.1" required /></div>
        <div><Label htmlFor="brand">Merk</Label><Input id="brand" name="brand" /></div>
        <div><Label htmlFor="model">Model</Label><Input id="model" name="model" /></div>
        <div><Label htmlFor="installedOn">Geplaatst op</Label><Input id="installedOn" name="installedOn" type="date" required /></div>
        <div><Label htmlFor="lastMaintenanceOn">Laatste onderhoud</Label><Input id="lastMaintenanceOn" name="lastMaintenanceOn" type="date" /></div>
        <div><Label htmlFor="lastAuditOn">Laatste verwarmingsaudit</Label><Input id="lastAuditOn" name="lastAuditOn" type="date" /></div>
        <div><Label htmlFor="optionalIntervalMonths">Optioneel interval (maanden)</Label><Input id="optionalIntervalMonths" name="optionalIntervalMonths" type="number" min="1" max="60" /></div>
        <p className="text-xs text-muted">Alleen gebruikt als er geen wettelijke termijn is: warmtepomp of minder dan 20 kW, behalve vaste brandstof.</p>
        <div><Label htmlFor="notes">Notities</Label><Input id="notes" name="notes" /></div>
      </Feedback>
    </div>
  );
}
