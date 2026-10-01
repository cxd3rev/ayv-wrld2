"use client";

import { createAddress, createBoiler, createInstallation } from "@/products/onderhoud/actions";
import { fuelLabels } from "@/lib/onderhoud/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useState } from "react";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function CustomerForms({
  customers,
}: {
  customers: { id: string; name: string; addresses: { id: string; label: string }[] }[];
}) {
  const [error, setError] = useState("");
  const [extraError, setExtraError] = useState("");
  const addresses = customers.flatMap((customer) =>
    customer.addresses.map((address) => ({ ...address, customerName: customer.name })),
  );

  return (
    <div className="space-y-4">
      <form
        action={async (formData) => {
          const result = await createInstallation(formData);
          setError(result.ok ? "" : result.error ?? "Mislukt.");
          if (result.ok) (document.activeElement as HTMLElement | null)?.closest("form")?.reset();
        }}
        className="workspace-card p-6"
      >
        <h2 className="text-lg font-medium">Nieuwe klant</h2>
        <p className="mt-1 text-sm text-muted">Naam, adres en ketel in één stap. De volgende datum wordt berekend.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Naam"><Input id="name" name="name" required /></Field>
          <Field id="email" label="E-mail"><Input id="email" name="email" type="email" /></Field>
          <Field id="phone" label="Telefoon"><Input id="phone" name="phone" /></Field>
          <Field id="street" label="Straat en nummer"><Input id="street" name="street" required /></Field>
          <Field id="postalCode" label="Postcode"><Input id="postalCode" name="postalCode" required /></Field>
          <Field id="municipality" label="Gemeente"><Input id="municipality" name="municipality" required /></Field>
          <Field id="fuel" label="Brandstof">
            <Select id="fuel" name="fuel" defaultValue="gas">
              {Object.entries(fuelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field id="powerKw" label="Vermogen (kW)"><Input id="powerKw" name="powerKw" type="number" min="0.1" step="0.1" required /></Field>
          <Field id="installedOn" label="Geplaatst op"><Input id="installedOn" name="installedOn" type="date" required /></Field>
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted">Merk, laatste bezoek en notities</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="brand" label="Merk"><Input id="brand" name="brand" /></Field>
            <Field id="model" label="Model"><Input id="model" name="model" /></Field>
            <Field id="lastMaintenanceOn" label="Laatste onderhoud"><Input id="lastMaintenanceOn" name="lastMaintenanceOn" type="date" /></Field>
            <Field id="lastAuditOn" label="Laatste verwarmingsaudit"><Input id="lastAuditOn" name="lastAuditOn" type="date" /></Field>
            <Field id="optionalIntervalMonths" label="Optioneel interval (maanden)"><Input id="optionalIntervalMonths" name="optionalIntervalMonths" type="number" min="1" max="60" /></Field>
            <Field id="notes" label="Notities"><Input id="notes" name="notes" /></Field>
          </div>
          <p className="mt-3 text-xs text-muted">Het optionele interval geldt alleen zonder wettelijke termijn: warmtepomp, of minder dan 20 kW, behalve vaste brandstof.</p>
        </details>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="mt-5">Klant bewaren</Button>
      </form>

      {customers.length > 0 ? (
        <details className="workspace-card p-6">
          <summary className="cursor-pointer text-sm font-medium">Adres of ketel bij een bestaande klant</summary>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <form
              action={async (formData) => {
                const result = await createAddress(formData);
                setExtraError(result.ok ? "" : result.error ?? "Mislukt.");
                if (result.ok) (document.activeElement as HTMLElement | null)?.closest("form")?.reset();
              }}
              className="grid gap-3"
            >
              <p className="text-sm font-medium">Extra adres</p>
              <Field id="customerId" label="Klant">
                <Select id="customerId" name="customerId" required>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </Select>
              </Field>
              <Field id="extraStreet" label="Straat"><Input id="extraStreet" name="street" required /></Field>
              <Field id="extraPostal" label="Postcode"><Input id="extraPostal" name="postalCode" required /></Field>
              <Field id="extraMunicipality" label="Gemeente"><Input id="extraMunicipality" name="municipality" required /></Field>
              <Button type="submit" variant="secondary">Adres bewaren</Button>
            </form>
            <form
              action={async (formData) => {
                const result = await createBoiler(formData);
                setExtraError(result.ok ? "" : result.error ?? "Mislukt.");
                if (result.ok) (document.activeElement as HTMLElement | null)?.closest("form")?.reset();
              }}
              className="grid gap-3"
            >
              <p className="text-sm font-medium">Extra ketel</p>
              <Field id="addressId" label="Adres">
                <Select id="addressId" name="addressId" required>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>{address.customerName} — {address.label}</option>
                  ))}
                </Select>
              </Field>
              <Field id="extraFuel" label="Brandstof">
                <Select id="extraFuel" name="fuel" defaultValue="gas">
                  {Object.entries(fuelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
              <Field id="extraPower" label="Vermogen (kW)"><Input id="extraPower" name="powerKw" type="number" min="0.1" step="0.1" required /></Field>
              <Field id="extraInstalled" label="Geplaatst op"><Input id="extraInstalled" name="installedOn" type="date" required /></Field>
              <input type="hidden" name="brand" value="" />
              <input type="hidden" name="model" value="" />
              <input type="hidden" name="lastMaintenanceOn" value="" />
              <input type="hidden" name="lastAuditOn" value="" />
              <input type="hidden" name="optionalIntervalMonths" value="" />
              <input type="hidden" name="notes" value="" />
              <Button type="submit" variant="secondary">Ketel bewaren</Button>
            </form>
          </div>
          {extraError ? <p className="mt-4 text-sm text-danger">{extraError}</p> : null}
        </details>
      ) : null}
    </div>
  );
}
