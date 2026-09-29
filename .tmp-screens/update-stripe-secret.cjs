const { spawnSync } = require("child_process");
const fs = require("fs");

function readEnv(key) {
  const raw = fs.readFileSync(".env.local", "utf8");
  const match = raw.match(new RegExp("^" + key + "=(.*)$", "m"));
  if (!match) {
    throw new Error(key + " missing from .env.local");
  }
  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

const secret = readEnv("STRIPE_SECRET_KEY");
if (!secret.startsWith("sk_test_") || secret.includes("...") || secret.length < 50) {
  throw new Error("Local STRIPE_SECRET_KEY does not look like a real test secret");
}

for (const environment of ["production", "preview"]) {
  const result = spawnSync(
    "npx",
    ["vercel", "env", "update", "STRIPE_SECRET_KEY", environment, "--yes", "--sensitive"],
    {
      input: secret,
      encoding: "utf8",
      shell: true,
    },
  );
  console.log(environment, "exit", result.status);
  const combined = `${result.stdout || ""}\n${result.stderr || ""}`;
  const safe = combined
    .split(/\r?\n/)
    .filter((line) => !line.includes("sk_test_") && !line.includes(secret.slice(0, 12)))
    .join("\n")
    .slice(0, 800);
  console.log(safe);
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
