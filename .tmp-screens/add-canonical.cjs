const fs = require("fs");

const files = {
  "app/forgot-password/page.tsx": "/forgot-password",
  "app/reset-password/page.tsx": "/reset-password",
  "app/onboarding/page.tsx": "/onboarding",
  "app/dashboard/page.tsx": "/dashboard",
  "app/dashboard/billing/page.tsx": "/dashboard/billing",
  "app/dashboard/calendar/page.tsx": "/dashboard/calendar",
  "app/dashboard/settings/page.tsx": "/dashboard/settings",
  "app/dashboard/settings/account/page.tsx": "/dashboard/settings/account",
  "app/dashboard/settings/billing/page.tsx": "/dashboard/settings/billing",
  "app/dashboard/settings/team/page.tsx": "/dashboard/settings/team",
  "app/dashboard/product/page.tsx": "/dashboard/product",
  "app/dashboard/avyro/page.tsx": "/dashboard/avyro",
  "app/dashboard/velto/page.tsx": "/dashboard/velto",
  "app/dashboard/rovyn/page.tsx": "/dashboard/rovyn",
  "app/dashboard/orvyn/page.tsx": "/dashboard/orvyn",
  "app/dashboard/nexro/page.tsx": "/dashboard/nexro",
  "app/dashboard/ravelo/page.tsx": "/dashboard/ravelo",
};

for (const [file, path] of Object.entries(files)) {
  let text = fs.readFileSync(file, "utf8");
  if (text.includes("alternates")) {
    console.log("skip", file);
    continue;
  }
  if (!text.includes('import type { Metadata }')) {
    text = 'import type { Metadata } from "next";\n' + text;
  }
  const block = `export const metadata: Metadata = { alternates: { canonical: "${path}" } };\n\n`;
  if (!text.includes("export default")) throw new Error("no default " + file);
  text = text.replace("export default", block + "export default");
  fs.writeFileSync(file, text);
  console.log("ok", file);
}
