const fs = require("node:fs");
const Stripe = require("stripe");

const env = fs.readFileSync(".env.local", "utf8");
const key = env.match(/^STRIPE_SECRET_KEY=(.*)$/m)?.[1]?.trim();
if (!key) {
  console.error("no key");
  process.exit(1);
}

const ids = [
  "price_1UHBw8V05bHNwI4W6itaFohv",
  "price_1UHBw8V05bHNwI4WUFbHzh4r",
  "price_1UHBw9V05bHNwI4WHzBNom5O",
  "price_1UHBwMV05bHNwI4W7yJ3dlav",
  "price_1UKMOWV05bHNwI4WpBB2w9mc",
  "price_1UKMOXV05bHNwI4Wwwxs33wT",
  "price_1UGoAcV05bHNwI4WhutfWSOT",
  "price_1UGoAdV05bHNwI4Wzx1Dr7pi",
  "price_1UGoBTV05bHNwI4WffhSPoXs",
  "price_1UGoAcV05bHNwI4W7qgb9GzE",
];

const stripe = new Stripe(key);

async function main() {
  const listed = await stripe.prices.list({ active: true, limit: 100, expand: ["data.product"] });
  console.log("--- active prices ---");
  for (const price of listed.data) {
    const product = typeof price.product === "string" ? { name: price.product, active: null } : price.product;
    if (product && "deleted" in product && product.deleted) continue;
    console.log([
      price.id,
      product && "name" in product ? product.name : "",
      price.unit_amount,
      price.currency,
      price.recurring?.interval ?? "once",
      price.active ? "active" : "inactive",
      price.nickname ?? "",
    ].join(" | "));
  }

  console.log("--- configured lookups ---");
  for (const id of ids) {
    try {
      const price = await stripe.prices.retrieve(id, { expand: ["product"] });
      const product = typeof price.product === "string" ? null : price.product;
      const name = product && "name" in product ? product.name : "";
      console.log([id, name, price.unit_amount, price.currency, price.recurring?.interval ?? "once", price.active].join(" | "));
    } catch (error) {
      console.log(id, error instanceof Error ? error.message : "missing");
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "failed");
  process.exit(1);
});
