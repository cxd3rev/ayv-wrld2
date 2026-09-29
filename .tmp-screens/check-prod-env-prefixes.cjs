function report(name, value, extraPrefixLen) {
  const v = (value || "").trim();
  const prefixLen = extraPrefixLen || 8;
  console.log(
    name +
      ": present=" +
      Boolean(v) +
      " len=" +
      v.length +
      " prefix=" +
      JSON.stringify(v.slice(0, prefixLen)) +
      " placeholder=" +
      (v.includes("...") || v.includes("your-") || v.includes("placeholder")) +
      " localhost=" +
      v.includes("localhost") +
      " ayv_url=" +
      v.includes("ayv-wrld2.vercel.app"),
  );
}

report("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY, 8);
report("STRIPE_PRICE_ID", process.env.STRIPE_PRICE_ID, 8);
report("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET, 6);
report("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, 8);
report("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL, 12);
