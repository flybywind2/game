/* Verifies the deployed site: pages respond, metadata is present, and games run in a browser. */
import { chromium } from "playwright";

const base = (process.env.LIVE_BASE_URL || "https://flybywind2.github.io/game/").replace(/\/?$/, "/");
const failures = [];

for (const path of ["", "privacy.html", "terms.html", "support.html", "robots.txt", "sitemap.xml"]) {
  const response = await fetch(base + path);
  console.log(`${response.status} ${base}${path}`);
  if (!response.ok) failures.push(`${base}${path} returned ${response.status}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
const consoleErrors = [];
page.on("pageerror", (error) => consoleErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(1500);

const home = await page.evaluate(() => ({
  cards: document.querySelectorAll(".game-card").length,
  policyLinks: document.querySelectorAll(".footer-links a").length,
  canonical: document.querySelector('link[rel="canonical"]')?.href || "",
  ogTitle: document.querySelector('meta[property="og:title"]')?.content || "",
}));
console.log("HOME", JSON.stringify(home));
if (home.cards !== 105) failures.push(`expected 105 game cards live, found ${home.cards}`);
if (home.policyLinks < 3) failures.push("policy links are missing from the live footer");
if (!home.canonical) failures.push("canonical link is missing live");

// Spot-check one game per major mode on the live deployment.
for (const key of ["colors", "counting", "matching", "sounds", "extra089"]) {
  await page.evaluate((gameKey) => {
    window.location.hash = `#game/${gameKey}`;
  }, key);
  await page.waitForTimeout(600);
  const state = await page.evaluate(() => {
    const stage = document.querySelector("#answer-grid");
    return {
      open: Boolean(document.querySelector("#game-shell")?.classList.contains("is-open")),
      prompt: document.querySelector("#play-prompt")?.textContent?.trim() || "",
      interactive: stage ? stage.querySelectorAll("button, [role='button'], canvas").length : 0,
    };
  });
  console.log(`GAME ${key} ${JSON.stringify(state)}`);
  if (!state.open || !state.prompt || state.interactive < 1) failures.push(`live game ${key} did not render`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
}

// The service worker must register so offline install works on the real origin.
const swReady = await page
  .waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.ready, null, { timeout: 15000 })
  .then(() => true)
  .catch(() => false);
console.log(`service worker registered: ${swReady}`);
if (!swReady) failures.push("service worker did not register on the live site");

if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);

await browser.close();
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("live deployment checks passed");
