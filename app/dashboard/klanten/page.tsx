import { CustomerForms } from "@/components/onderhoud/customer-forms";
import { CustomerImport } from "@/components/onderhoud/customer-import";
import { fuelLabels } from "@/lib/onderhoud/labels";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { FuelType } from "@/lib/maintenance-rules";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/klanten" } };

type BoilerRow = { id: string; fuel_type: FuelType; power_kw: number | string; brand: string | null; model: string | null };
type AddressRow = { id: string; street: string; postal_code: string; municipality: string; onderhoud_boilers: BoilerRow[] | null };
type CustomerRow = { id: string; name: string; email: string | null; phone: string | null; onderhoud_addresses: AddressRow[] | null };

export default async function CustomersPage() {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("onderhoud_customers")
    .select("id, name, email, phone, onderhoud_addresses(id, street, postal_code, municipality, onderhoud_boilers(id, fuel_type, power_kw, brand, model))")
    .eq("organization_id", organization.id)
    .order("name");
  const customers = (data as CustomerRow[] | null) ?? [];

  return (
    <div>
      <h1 className="display text-4xl">Klanten</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Elke klant heeft een adres en minstens één ketel. Open een ketel om het attest te bewaren.</p>
      <CustomerImport />
      <div className="mt-8">
        <CustomerForms
          customers={customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            addresses: (customer.onderhoud_addresses ?? []).map((address) => ({
              id: address.id,
              label: `${address.street}, ${address.municipality}`,
            })),
          }))}
        />
      </div>
      <div className="mt-10 space-y-4">
        {customers.map((customer) => (
          <article key={customer.id} className="workspace-card p-5">
            <h2 className="text-lg font-medium">{customer.name}</h2>
            <p className="text-sm text-muted">{[customer.email, customer.phone].filter(Boolean).join(" · ") || "Geen contact"}</p>
            <ul className="mt-4 space-y-3">
              {(customer.onderhoud_addresses ?? []).map((address) => (
                <li key={address.id}>
                  <p>{address.street}, {address.postal_code} {address.municipality}</p>
                  <ul className="mt-1 space-y-1 text-sm text-muted">
                    {(address.onderhoud_boilers ?? []).map((boiler) => (
                      <li key={boiler.id}>
                        <Link href={`/dashboard/ketels/${boiler.id}`} className="underline">
                          {fuelLabels[boiler.fuel_type]} · {Number(boiler.power_kw)} kW
                          {boiler.brand ? ` · ${boiler.brand}` : ""}
                          {boiler.model ? ` ${boiler.model}` : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
