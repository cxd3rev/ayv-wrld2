const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const { createClient } = require("@supabase/supabase-js");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp-screens", "verify");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";

function loadEnv(file) {
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
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

function stamp(page, name) {
  const file = path.join(OUT, `e2e-${name}.png`);
  return page.screenshot({ path: file, fullPage: true }).then(() => file);
}

async function visibleText(page) {
  return page.evaluate(() => document.body?.innerText?.slice(0, 2500) || "");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  loadEnv(path.join(ROOT, ".env.local"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) {
    throw new Error("Missing Supabase public env");
  }

  const email = `avyro.e2e.${Date.now()}@gmail.com`;
  const password = "AvyroE2e917!";
  const fullName = "Avyro Tester";
  const logs = [];
  const note = (msg) => {
    logs.push(msg);
    console.log(msg);
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", (err) => note(`PAGEERROR ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") note(`CONSOLE ${msg.text()}`);
  });
  page.on("response", (res) => {
    const status = res.status();
    const resUrl = res.url();
    if (status >= 400 && resUrl.includes("localhost:3000")) {
      note(`HTTP ${status} ${resUrl}`);
    }
  });

  try {
    note("STEP homepage");
    await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
    await stamp(page, "01-home");
    const homeText = await visibleText(page);
    note(`HOME url=${page.url()} hasAvyro=${homeText.includes("Avyro")}`);

    const started = await page.evaluate(() => {
      const link = [...document.querySelectorAll("a")].find((a) =>
        /get started/i.test(a.textContent || ""),
      );
      if (!link) return false;
      link.click();
      return true;
    });
    if (!started) throw new Error("Get started link not found");
    await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
    await page.waitForSelector("#fullName, #email", { timeout: 15000 });
    note(`STEP signup url=${page.url()}`);
    await stamp(page, "02-signup");

    await page.type("#fullName", fullName);
    await page.type("#email", email);
    await page.type("#password", password);
    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {}),
    ]);
    await new Promise((r) => setTimeout(r, 1500));
    await stamp(page, "03-after-signup");
    let afterSignup = await visibleText(page);
    note(`AFTER_SIGNUP url=${page.url()}`);
    note(`AFTER_SIGNUP_TEXT ${afterSignup.replace(/\s+/g, " ").slice(0, 400)}`);

    const needsConfirm = /check your email/i.test(afterSignup);
    if (needsConfirm) {
      if (!service) throw new Error("Need service role to confirm test user");
      const admin = createClient(url, service, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const listed = await admin.auth.admin.listUsers({ perPage: 1000 });
      const user = listed.data.users.find((u) => u.email === email);
      if (!user) throw new Error("Signed-up user not found in auth.users");
      const confirmed = await admin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
      if (confirmed.error) throw new Error(confirmed.error.message);
      note("CONFIRMED test user via admin API");

      await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
      await page.waitForSelector("#email");
      await page.type("#email", email);
      await page.type("#password", password);
      await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {}),
      ]);
      await new Promise((r) => setTimeout(r, 1500));
      await stamp(page, "04-after-login");
      note(`AFTER_LOGIN url=${page.url()}`);
      note(`AFTER_LOGIN_TEXT ${(await visibleText(page)).replace(/\s+/g, " ").slice(0, 400)}`);
    }

    if (page.url().includes("/login") || page.url().includes("/signup")) {
      const err = await page.$eval("body", (el) => el.innerText);
      throw new Error(`Still on auth page: ${err.replace(/\s+/g, " ").slice(0, 300)}`);
    }

    if (page.url().includes("/onboarding") || /Set up your workspace/i.test(await visibleText(page))) {
      note("STEP onboarding");
      await page.waitForSelector("#businessName");
      await page.type("#businessName", "Avyro E2E Shop");
      await page.select("#industry", "Trades");
      await page.type("#website", "https://avyro-e2e.example");
      await page.type("#businessEmail", email);
      await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 25000 }).catch(() => {}),
      ]);
      await new Promise((r) => setTimeout(r, 2000));
      await stamp(page, "05-after-onboarding");
      note(`AFTER_ONBOARDING url=${page.url()}`);
      note(`AFTER_ONBOARDING_TEXT ${(await visibleText(page)).replace(/\s+/g, " ").slice(0, 500)}`);
    }

    if (!page.url().includes("/dashboard")) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2" });
      await stamp(page, "06-dashboard-direct");
      note(`DASHBOARD_DIRECT url=${page.url()}`);
    }

    const dashText = await visibleText(page);
    note(`DASHBOARD_TEXT ${dashText.replace(/\s+/g, " ").slice(0, 500)}`);
    await stamp(page, "07-dashboard");

    const opened = await page.evaluate(() => {
      const link = [...document.querySelectorAll("a")].find((a) =>
        /open avyro/i.test(a.textContent || ""),
      );
      if (!link) return false;
      link.click();
      return true;
    });
    if (!opened) {
      await page.goto(`${BASE}/dashboard/product`, { waitUntil: "networkidle2" });
    } else {
      await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 1200));
    await stamp(page, "08-avyro");
    const avyroText = await visibleText(page);
    note(`AVYRO url=${page.url()}`);
    note(`AVYRO_TEXT ${avyroText.replace(/\s+/g, " ").slice(0, 600)}`);

    const ok =
      page.url().includes("/dashboard/product") &&
      /Avyro/i.test(avyroText) &&
      !/something went wrong/i.test(avyroText);
    note(`RESULT ${ok ? "PASS" : "FAIL"}`);
    if (!ok) process.exitCode = 1;
  } finally {
    await browser.close();
    note(`EMAIL_USED ${email}`);
  }
}

main().catch((err) => {
  console.error("E2E_FATAL", err.stack || err.message);
  process.exit(1);
});
