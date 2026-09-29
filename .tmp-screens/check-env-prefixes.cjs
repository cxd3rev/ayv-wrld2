const fs = require("fs");
const p = ".env.local";
if (!fs.existsSync(p)) {
  console.log("NO_ENV_LOCAL");
  process.exit(0);
}
const raw = fs.readFileSync(p, "utf8");
const keys = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
];
for (const k of keys) {
  const m = raw.match(new RegExp("^" + k + "=(.*)$", "m"));
  if (!m) {
    console.log(k + ": MISSING");
    continue;
  }
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  const placeholder =
    v.includes("...") || v.includes("your-") || v.includes("placeholder");
  const prefix = v.slice(0, Math.min(12, v.length));
  console.log(
    k +
      ": present=" +
      (v.length > 0) +
      " len=" +
      v.length +
      " prefix=" +
      JSON.stringify(prefix) +
      " placeholder=" +
      placeholder +
      " has_ellipsis=" +
      v.includes("..."),
  );
}
