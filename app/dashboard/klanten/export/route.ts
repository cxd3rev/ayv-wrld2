import { requireWorkspace } from "@/lib/auth/session";
import { fuelLabels } from "@/lib/onderhoud/labels";
import type { FuelType } from "@/lib/maintenance-rules";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function cell(value: string | null | undefined) {
  const text = value ?? "";
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET() {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("onderhoud_customers")
    .select("name, email, phone, onderhoud_addresses(street, postal_code, municipality, onderhoud_boilers(fuel_type, power_kw, installed_on, last_maintenance_on))")
    .eq("organization_id", organization.id)
    .order("name");

  const lines = ["naam,email,telefoon,straat,postcode,gemeente,brandstof,vermogen_kw,geplaatst_op,laatste_onderhoud"];
  for (const customer of data ?? []) {
    const addresses = customer.onderhoud_addresses ?? [];
    for (const address of addresses) {
      const boilers = address.onderhoud_boilers ?? [];
      for (const boiler of boilers) {
        lines.push(
          [
            customer.name,
            customer.email,
            customer.phone,
            address.street,
            address.postal_code,
            address.municipality,
            fuelLabels[boiler.fuel_type as FuelType] ?? boiler.fuel_type,
            String(boiler.power_kw),
            boiler.installed_on,
            boiler.last_maintenance_on,
          ]
            .map((value) => cell(value == null ? "" : String(value)))
            .join(","),
        );
      }
    }
  }

  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="klanten.csv"',
    },
  });
}
