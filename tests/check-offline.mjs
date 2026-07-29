/* Verifies the offline promise for real: install the service worker, cut the
   network, then confirm the app still opens and a game is still playable.
   "설치·오프라인" is advertised on the home screen, so a silent regression here
   would break a core claim. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
const page = await context.newPage();
const failures = [];

await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });

// Wait until the service worker controls the page and the shell is cached.
const installed = await page
  .waitForFunction(
    async () => {
      const registration = await navigator.serviceWorker?.ready;
      if (!registration?.active) return false;
      const names = await caches.keys();
      const shell = names.find((name) => name.startsWith("mongle-premium"));
      if (!shell) return false;
      const cache = await caches.open(shell);
      const keys = await cache.keys();
      return keys.length > 20;
    },
    null,
    { timeout: 30000 },
  )
  .then(() => true)
  .catch(() => false);

if (!installed) failures.push("service worker did not finish caching the app shell");

const cachedCount = await page.evaluate(async () => {
  const names = await caches.keys();
  const shell = names.find((name) => name.startsWith("mongle-premium"));
  if (!shell) return 0;
  return (await caches.open(shell)).keys().then((keys) => keys.length);
});
console.log(`cached shell entries: ${cachedCount}`);

// Reload once so the worker is controlling this client, then go offline.
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(600);
await context.setOffline(true);

const offlineLoad = await page.reload({ waitUntil: "load" }).then(
  (response) => ({ ok: true, status: response?.status() ?? 0 }),
  (error) => ({ ok: false, error: error.message }),
);
console.log(`offline reload: ${JSON.stringify(offlineLoad)}`);
if (!offlineLoad.ok) failures.push(`offline reload failed: ${offlineLoad.error}`);

await page.waitForTimeout(900);
const offlineHome = await page.evaluate(() => ({
  cards: document.querySelectorAll(".game-card").length,
  title: document.title,
  styled: getComputedStyle(document.body).backgroundColor,
}));
console.log(`offline home: ${JSON.stringify(offlineHome)}`);
if (offlineHome.cards !== 105) failures.push(`offline home showed ${offlineHome.cards} cards, expected 105`);

// A game must still open and be interactive with no network.
await page.evaluate(() => {
  window.location.hash = "#game/colors";
});
await page.waitForTimeout(700);
const offlineGame = await page.evaluate(() => {
  const stage = document.querySelector("#answer-grid");
  return {
    open: Boolean(document.querySelector("#game-shell")?.classList.contains("is-open")),
    prompt: document.querySelector("#play-prompt")?.textContent?.trim() || "",
    interactive: stage ? stage.querySelectorAll("button, [role='button'], canvas").length : 0,
  };
});
console.log(`offline game: ${JSON.stringify(offlineGame)}`);
if (!offlineGame.open || !offlineGame.prompt || offlineGame.interactive < 1) {
  failures.push("a game could not be played offline");
}

// Offline navigation to a policy page must not fall back to the home screen.
const offlinePolicy = await page.goto(`${base}privacy.html`, { waitUntil: "domcontentloaded" }).then(
  async () => page.evaluate(() => document.querySelector("h1")?.textContent?.trim() || ""),
  () => "",
);
console.log(`offline privacy heading: "${offlinePolicy}"`);
if (!offlinePolicy.includes("개인정보")) {
  failures.push(`offline privacy.html served the wrong page ("${offlinePolicy}")`);
}

await context.setOffline(false);
await browser.close();
server.close();

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("offline checks passed");
