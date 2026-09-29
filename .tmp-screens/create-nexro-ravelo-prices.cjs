const fs = require("fs");
const Stripe = require("stripe");

const env = fs.readFileSync(".env.local", "utf8");
const key = env.match(/^STRIPE_SECRET_KEY=(.*)$/m)?.[1]?.trim();
if (!key) {
  console.error("missing stripe secret");
  process.exit(1);
}

const stripe = new Stripe(key);

async function ensure(name, slug) {
  const listed = await stripe.products.list({ active: true, limit: 100 });
  let product = listed.data.find((item) => item.metadata?.ayv_product === slug);
  if (!product) {
    product = await stripe.products.create({
      name,
      metadata: { ayv_product: slug },
    });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = prices.data.find(
    (item) => item.currency === "eur" && item.recurring?.interval === "month" && item.unit_amount === 9000,
  );
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "eur",
      unit_amount: 9000,
      recurring: { interval: "month" },
      metadata: { ayv_product: slug },
    });
  }

  console.log(`${slug} ${price.id}`);
}

ensure("Nexro", "nexro")
  .then(() => ensure("Ravelo", "ravelo"))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
