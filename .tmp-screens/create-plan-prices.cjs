const fs = require("node:fs");
const Stripe = require("stripe");

const env = fs.readFileSync(".env.local", "utf8");
const key = env.match(/^STRIPE_SECRET_KEY=(.*)$/m)?.[1]?.trim();
if (!key) {
  console.error("no key");
  process.exit(1);
}

const stripe = new Stripe(key);

async function ensurePlan(name, description, unitAmount) {
  const existing = await stripe.products.search({
    query: `active:'true' AND name:'${name}'`,
  });
  let product = existing.data.find((item) => item.name === name);
  if (!product) {
    product = await stripe.products.create({ name, description });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  let price = prices.data.find(
    (item) => item.currency === "eur" && item.recurring?.interval === "month" && item.unit_amount === unitAmount,
  );
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "eur",
      unit_amount: unitAmount,
      recurring: { interval: "month" },
      nickname: `${name} monthly`,
    });
  }

  console.log([name, product.id, price.id, price.unit_amount, price.currency, price.recurring.interval].join(" | "));
}

async function main() {
  await ensurePlan("Growth", "Any three AYV Automation modules, billed monthly.", 7900);
  await ensurePlan("Full stack", "All six AYV Automation modules, billed monthly.", 14900);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "failed");
  process.exit(1);
});
