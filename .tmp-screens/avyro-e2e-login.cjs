const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp-screens", "verify");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";

const email = process.env.AYV_E2E_EMAIL;
const password = process.env.AYV_E2E_PASSWORD;
if (!email || !password) {
  throw new Error("Set AYV_E2E_EMAIL and AYV_E2E_PASSWORD");
}

function stamp(page, name) {
  return page.screenshot({
    path: path.join(OUT, `e2e-${name}.png`),
    fullPage: true,
  });
}

async function waitReady(page) {
  await page.waitForFunction(
    () => {
      const text = document.body?.innerText || "";
      return !/Compiling/i.test(text);
    },
    { timeout: 45000 },
  );
}

async function text(page) {
  return page.evaluate(() => document.body?.innerText?.replace(/\s+/g, " ").slice(0, 700) || "");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);
  page.on("pageerror", (err) => console.log("PAGEERROR", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("CONSOLE", msg.text());
  });

  try {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
    await waitReady(page);
    await page.waitForSelector("#email");
    await page.click("#email", { clickCount: 3 });
    await page.type("#email", email);
    await page.click("#password", { clickCount: 3 });
    await page.type("#password", password);
    await page.click("button[type=submit]");
    await page.waitForFunction(
      () => !window.location.pathname.includes("/login"),
      { timeout: 25000 },
    );
    await waitReady(page);
    await new Promise((r) => setTimeout(r, 800));
    console.log("AFTER_LOGIN", page.url());
    console.log("AFTER_LOGIN_TEXT", await text(page));
    await stamp(page, "11-after-login");

    if (page.url().includes("/onboarding") || (await page.$("#businessName"))) {
      console.log("STEP onboarding");
      await page.waitForSelector("#businessName");
      await page.type("#businessName", "Avyro E2E Shop");
      await page.select("#industry", "Trades");
      await page.click("#website", { clickCount: 3 });
      await page.type("#website", "https://avyro-e2e.example");
      await page.type("#businessEmail", email);
      await page.click("button[type=submit]");
      await page.waitForFunction(
        () => window.location.pathname.startsWith("/dashboard"),
        { timeout: 30000 },
      ).catch(async () => {
        console.log("ONBOARDING_STUCK", page.url(), await text(page));
      });
      await waitReady(page);
      await new Promise((r) => setTimeout(r, 800));
      console.log("AFTER_ONBOARDING", page.url());
      console.log("AFTER_ONBOARDING_TEXT", await text(page));
      await stamp(page, "12-after-onboarding");
    }

    if (!page.url().includes("/dashboard")) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2" });
      await waitReady(page);
    }
    console.log("DASHBOARD", page.url());
    console.log("DASHBOARD_TEXT", await text(page));
    await stamp(page, "13-dashboard");

    const opened = await page.evaluate(() => {
      const link = [...document.querySelectorAll("a")].find((a) =>
        /open avyro|open the avyro workspace/i.test(a.textContent || ""),
      );
      if (!link) return false;
      link.click();
      return true;
    });
    if (!opened) {
      await page.goto(`${BASE}/dashboard/product`, { waitUntil: "networkidle2" });
    } else {
      await page.waitForFunction(
        () => window.location.pathname.includes("/dashboard/product"),
        { timeout: 15000 },
      ).catch(() => {});
    }
    await waitReady(page);
    await new Promise((r) => setTimeout(r, 600));
    const avyroText = await text(page);
    console.log("AVYRO", page.url());
    console.log("AVYRO_TEXT", avyroText);
    await stamp(page, "14-avyro");

    const ok =
      page.url().includes("/dashboard/product") &&
      /Avyro/i.test(avyroText) &&
      !/something went wrong/i.test(avyroText);
    console.log(ok ? "RESULT PASS" : "RESULT FAIL");
    if (!ok) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("E2E_FATAL", err.stack || err.message);
  process.exit(1);
});
