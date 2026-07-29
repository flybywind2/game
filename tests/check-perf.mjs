/* Measures the first-visit cost of the home screen and keeps it from regressing.

   Two numbers matter. Decoded bytes drive parsing and memory on a cheap phone.
   Transferred bytes drive the actual wait on mobile data, and GitHub Pages serves
   text with gzip, so scripts cost far less over the wire than their file size
   suggests. Images are already compressed, so their file size is what ships. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const BUDGETS = {
  decodedKB: 1400,
  imageKB: 420,
  scriptKB: 750,
  domContentLoadedMs: 4000,
  requests: 40,
};

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
const page = await context.newPage();

const byType = new Map();
let totalBytes = 0;
let requestCount = 0;

page.on("response", async (response) => {
  const request = response.request();
  requestCount += 1;
  let size = 0;
  try {
    size = (await response.body()).length;
  } catch {
    size = 0;
  }
  totalBytes += size;
  const type = request.resourceType();
  byType.set(type, (byType.get(type) || 0) + size);
});

await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(1200);

const timing = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  return {
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd || 0),
    loadEvent: Math.round(nav?.loadEventEnd || 0),
    cards: document.querySelectorAll(".game-card").length,
    visibleCards: [...document.querySelectorAll(".game-card")].filter(
      (card) => !card.hidden && card.offsetParent !== null,
    ).length,
  };
});

const kb = (bytes) => Math.round(bytes / 1024);
const scriptBytes = byType.get("script") || 0;

console.log(`first load: ${kb(totalBytes)} KB across ${requestCount} requests`);
console.log(
  "by type: " +
    [...byType.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, bytes]) => `${type}=${kb(bytes)}KB`)
      .join(" "),
);
console.log(`DOMContentLoaded ${timing.domContentLoaded}ms, load ${timing.loadEvent}ms`);
console.log(`cards in DOM ${timing.cards}, visible ${timing.visibleCards}`);

await browser.close();
server.close();

const failures = [];
if (kb(totalBytes) > BUDGETS.decodedKB) {
  failures.push(`first load ${kb(totalBytes)}KB exceeds ${BUDGETS.decodedKB}KB budget`);
}
const imageBytes = byType.get("image") || 0;
if (kb(imageBytes) > BUDGETS.imageKB) {
  failures.push(
    `images ${kb(imageBytes)}KB exceed the ${BUDGETS.imageKB}KB budget; images are not gzipped, so this is real transfer`,
  );
}
if (kb(scriptBytes) > BUDGETS.scriptKB) {
  failures.push(`scripts ${kb(scriptBytes)}KB exceed ${BUDGETS.scriptKB}KB budget`);
}
if (timing.domContentLoaded > BUDGETS.domContentLoadedMs) {
  failures.push(`DOMContentLoaded ${timing.domContentLoaded}ms exceeds ${BUDGETS.domContentLoadedMs}ms budget`);
}
if (requestCount > BUDGETS.requests) {
  failures.push(`${requestCount} first-load requests exceed the ${BUDGETS.requests} budget`);
}

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("performance budgets passed");
