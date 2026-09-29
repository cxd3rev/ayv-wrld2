const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function loadEnv(file) {
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  throw new Error("missing public env");
}

async function main() {
  const email = `velto.e2e.${Date.now()}@gmail.com`;
  const password = "VeltoE2e917!";
  const supabase = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const signed = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: "Velto Tester" } },
  });
  if (signed.error) throw new Error(`signup ${signed.error.message}`);
  console.log(`SIGNUP_SESSION=${Boolean(signed.data.session)}`);
  if (!signed.data.session) {
    console.log("SKIP_AUTH_CRUD email confirmation required");
    return;
  }

  const user = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const session = await user.auth.setSession(signed.data.session);
  if (session.error) throw new Error(`session ${session.error.message}`);

  const orgName = `Velto Data Studio ${Date.now()}`;
  const slug = `velto-data-${Date.now()}`;
  const org = await user.rpc("create_organization", {
    org_name: orgName,
    org_slug: slug,
    org_industry: "Health & wellness",
    org_website: "https://velto-e2e.example",
    org_email: email,
    org_phone: null,
  });
  if (org.error) throw new Error(`org ${org.error.message}`);
  const organization = Array.isArray(org.data) ? org.data[0] : org.data;
  console.log(`ORG_CREATED=${Boolean(organization?.id)}`);

  const inserted = await user
    .from("bookings")
    .insert({
      organization_id: organization.id,
      customer_name: "Alex Rivera",
      email: "alex@example.com",
      phone: null,
      service: "Consultation",
      starts_on: "2026-09-21",
      start_time: "14:30",
      status: "scheduled",
      reminder_on: "2026-09-20",
      notes: "First visit",
    })
    .select("id,customer_name,status,service")
    .single();
  if (inserted.error) throw new Error(`insert ${inserted.error.message}`);
  console.log(`BOOKING_INSERTED=${inserted.data.customer_name}:${inserted.data.status}`);

  const listed = await user
    .from("bookings")
    .select("id,customer_name,status")
    .eq("organization_id", organization.id);
  if (listed.error) throw new Error(`list ${listed.error.message}`);
  console.log(`BOOKING_LIST=${listed.data.length}`);

  const updated = await user
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", inserted.data.id)
    .select("status")
    .single();
  if (updated.error) throw new Error(`update ${updated.error.message}`);
  console.log(`BOOKING_UPDATED=${updated.data.status}`);

  const lead = await user
    .from("leads")
    .insert({ organization_id: organization.id, name: "Jordan Lee", status: "new" })
    .select("id,name")
    .single();
  if (lead.error) throw new Error(`lead ${lead.error.message}`);
  console.log(`AVYRO_LEAD=${lead.data.name}`);

  const mixed = await user.from("leads").select("name").eq("organization_id", organization.id);
  console.log(`AVYRO_LEADS=${(mixed.data || []).map((row) => row.name).join(",")}`);

  const deleted = await user.from("bookings").delete().eq("id", inserted.data.id);
  if (deleted.error) throw new Error(`delete ${deleted.error.message}`);
  const afterDel = await user.from("bookings").select("id").eq("organization_id", organization.id);
  console.log(`BOOKING_AFTER_DELETE=${(afterDel.data || []).length}`);
  console.log("PASS");
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
