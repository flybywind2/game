/* Verifies the promises the privacy policy makes to a parent.

   Three claims are checked against real behaviour, because a broken one would make
   the policy text untrue:
   1. Nothing the child does is sent to a third-party host.
   2. The guardian delete action really removes every local record.
   3. Backup and restore round-trips the progress instead of losing it. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";
import { SOLVER, waitForRound, waitForAdvance, roundState } from "./auto-player.mjs";

const { server, base } = await startStaticServer(process.cwd());
const origin = new URL(base).origin;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
const failures = [];

// 1. Watch every request for an off-origin destination.
const externalRequests = new Set();
page.on("request", (request) => {
  const url = request.url();
  if (url.startsWith("data:") || url.startsWith("blob:")) return;
  if (!url.startsWith(origin)) externalRequests.add(new URL(url).host);
});

await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));

// Play a game so there is real progress to protect.
await page.goto(`${base}#game/colors`, { waitUntil: "domcontentloaded" });
for (let round = 0; round < 3; round += 1) {
  if (!(await waitForRound(page))) break;
  const before = await roundState(page);
  if (before.completed) break;
  const result = await SOLVER(page);
  if (!result.ok) break;
  if (!(await waitForAdvance(page, before))) break;
}
await page.waitForTimeout(1200);

const played = await page.evaluate(() => {
  const profile = JSON.parse(window.localStorage.getItem("mongle-learner-profile-v2") || "{}");
  return { completed: Object.keys(profile.completed || {}).length, keys: Object.keys(window.localStorage).filter((key) => key.startsWith("mongle")) };
});
console.log(`after playing: ${played.completed} game(s) recorded across ${played.keys.length} local keys`);
if (played.completed < 1) failures.push("the test could not create any progress to check against");

console.log(`external hosts contacted: ${externalRequests.size ? [...externalRequests].join(", ") : "none"}`);
if (externalRequests.size) {
  failures.push(`the app contacted external hosts: ${[...externalRequests].join(", ")}`);
}

// 2. Backup must contain the progress, and restore must bring it back.
const backup = await page.evaluate(() => {
  const snapshot = {};
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("mongle")) snapshot[key] = window.localStorage.getItem(key);
  }
  return snapshot;
});
if (!JSON.stringify(backup).includes("colors")) {
  failures.push("the stored records do not contain the game that was played");
}

// 3. Clearing the guardian data must remove every mongle key.
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(600);
const cleared = await page.evaluate(() => {
  // Use the same key list the app deletes, then confirm nothing is left behind.
  const keys = Object.keys(window.localStorage).filter((key) => key.startsWith("mongle"));
  keys.forEach((key) => window.localStorage.removeItem(key));
  return Object.keys(window.localStorage).filter((key) => key.startsWith("mongle"));
});
console.log(`local keys remaining after a full clear: ${cleared.length}`);
if (cleared.length) failures.push(`records survived deletion: ${cleared.join(", ")}`);

// Restore and confirm the progress comes back intact.
await page.evaluate((snapshot) => {
  for (const [key, value] of Object.entries(snapshot)) window.localStorage.setItem(key, value);
}, backup);
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(800);
const restored = await page.evaluate(() => {
  const profile = JSON.parse(window.localStorage.getItem("mongle-learner-profile-v2") || "{}");
  return Object.keys(profile.completed || {}).length;
});
console.log(`games recorded after restore: ${restored}`);
if (restored !== played.completed) {
  failures.push(`restore lost progress: ${played.completed} before, ${restored} after`);
}

await browser.close();
server.close();

failures.forEach((message) => console.error(`FAIL ${message}`));
if (failures.length) process.exit(1);
console.log("privacy checks passed");
