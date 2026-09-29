const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const OUT = path.join(__dirname, "verify");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "https://ayv-wrld2.vercel.app";
const email = process.env.AYV_E2E_EMAIL;
const password = process.env.AYV_E2E_PASSWORD;

async function text(page) {
  return page.evaluate(() => document.body?.innerText?.replace(/\s+/g, " ").slice(0, 800) || "");
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
  page.setDefaultTimeout(30000);
  page.on("pageerror", (err) => console.log("PAGEERROR", err.message));

  try {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
    console.log("LOGIN_PAGE", page.url());
    console.log("LOGIN_TEXT", await text(page));
    await page.screenshot({ path: path.join(OUT, "prod-login.png"), fullPage: true });

    const hasForm = await page.$("#email");
    if (!hasForm) {
      console.log("RESULT FAIL no login form");
      process.exitCode = 1;
      return;
    }
    if (!email || !password) {
      console.log("RESULT LOGIN_PAGE_OK skipped authenticated prod (no creds)");
      return;
    }

    await page.type("#email", email);
    await page.type("#password", password);
    await page.click("button[type=submit]");
    await page.waitForFunction(
      () => !window.location.pathname.includes("/login") || document.body.innerText.toLowerCase().includes("incorrect"),
      { timeout: 25000 },
    ).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    console.log("AFTER_PROD_LOGIN", page.url());
    console.log("AFTER_PROD_LOGIN_TEXT", await text(page));
    await page.screenshot({ path: path.join(OUT, "prod-after-login.png"), fullPage: true });

    if (page.url().includes("/dashboard") || page.url().includes("/onboarding")) {
      if (page.url().includes("/dashboard")) {
        await page.goto(`${BASE}/dashboard/product`, { waitUntil: "networkidle2" });
        await new Promise((r) => setTimeout(r, 800));
        console.log("PROD_AVYRO", page.url());
        console.log("PROD_AVYRO_TEXT", await text(page));
        await page.screenshot({ path: path.join(OUT, "prod-avyro.png"), fullPage: true });
      }
      console.log("RESULT PROD_AUTH_OK");
    } else {
      console.log("RESULT FAIL still on", page.url());
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("E2E_FATAL", err.stack || err.message);
  process.exit(1);
});
