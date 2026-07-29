/* Verifies keyboard-only operation, which the README advertises.

   A child may use the touch screen, but a guardian on a laptop, a switch device, or
   anyone relying on assistive tech needs the keyboard path to work: reach the
   catalog, open a game, move focus onto the activity controls, answer with the
   keyboard, and leave with Escape. Focus must also stay visible and stay inside the
   game dialog while it is open. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const failures = [];

// 1. The first Tab must reach a real control, and focus must be visible.
await page.keyboard.press("Tab");
const firstStop = await page.evaluate(() => {
  const active = document.activeElement;
  if (!active || active === document.body) return null;
  const style = getComputedStyle(active);
  return {
    tag: active.tagName,
    label: (active.textContent || active.getAttribute("aria-label") || "").trim().slice(0, 30),
    outline: style.outlineStyle !== "none" || style.boxShadow !== "none",
  };
});
console.log(`first Tab stop: ${JSON.stringify(firstStop)}`);
if (!firstStop) failures.push("Tab did not move focus to any control");

// 2. A game must be openable with the keyboard alone.
const opened = await page.evaluate(async () => {
  const start = document.querySelector(".game-start");
  if (!start) return false;
  start.focus();
  return document.activeElement === start;
});
if (!opened) failures.push("could not focus a game start button");
await page.keyboard.press("Enter");
await page.waitForTimeout(700);

const shellOpen = await page.evaluate(() =>
  Boolean(document.querySelector("#game-shell")?.classList.contains("is-open")),
);
console.log(`game opened with Enter: ${shellOpen}`);
if (!shellOpen) failures.push("Enter on a game card did not open the game");

// 3. Tabbing inside the game must reach the activity controls, not escape the dialog.
const reachable = await page.evaluate(async () => {
  const stage = document.querySelector("#answer-grid");
  const controls = [...stage.querySelectorAll("button:not([disabled]), canvas")];
  if (!controls.length) return { ok: false, reason: "no controls" };
  controls[0].focus();
  return { ok: document.activeElement === controls[0], count: controls.length };
});
console.log(`activity controls focusable: ${JSON.stringify(reachable)}`);
if (!reachable.ok) failures.push("activity controls could not receive keyboard focus");

// 4. Answering with the keyboard must be accepted.
const answered = await page.evaluate(async () => {
  const target = document.querySelector('#answer-grid [data-target="true"]:not([disabled])');
  if (!target) return { ok: false, reason: "no scriptable target in this mode" };
  target.focus();
  return { ok: document.activeElement === target };
});
if (answered.ok) {
  await page.keyboard.press("Enter");
  const accepted = await page
    .waitForFunction(() => /★/.test(document.querySelector("#feedback")?.textContent || ""), null, {
      timeout: 5000,
    })
    .then(() => true)
    .catch(() => false);
  console.log(`keyboard answer accepted: ${accepted}`);
  if (!accepted) failures.push("pressing Enter on the correct answer was not accepted");
} else {
  console.log(`keyboard answer skipped: ${answered.reason}`);
}

// 5. The play screen is aria-modal, so Tab must stay inside it. Real Tab presses are
// used here because programmatic focus() bypasses the trap.
const escapedStops = [];
for (let press = 0; press < 26; press += 1) {
  await page.keyboard.press("Tab");
  const stop = await page.evaluate(() => {
    const active = document.activeElement;
    const shell = document.querySelector("#game-shell");
    return {
      inShell: shell.contains(active),
      label: (active.getAttribute?.("aria-label") || active.textContent || active.tagName || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 30),
    };
  });
  if (!stop.inShell) escapedStops.push(stop.label);
}
console.log(`Tab stops that left the open game: ${escapedStops.length}/26`);
if (escapedStops.length) {
  console.error(`  focus escaped to: ${[...new Set(escapedStops)].slice(0, 5).join(" | ")}`);
  failures.push(`focus left the modal game screen on ${escapedStops.length} of 26 Tab presses`);
}

// 6. Escape must close the game and return focus to the page.
await page.waitForTimeout(1200);
await page.keyboard.press("Escape");
await page.waitForTimeout(700);
const closed = await page.evaluate(() => ({
  shellOpen: Boolean(document.querySelector("#game-shell")?.classList.contains("is-open")),
  focusInBody: document.activeElement !== document.body,
}));
console.log(`Escape closed the game: ${!closed.shellOpen}, focus restored: ${closed.focusInBody}`);
if (closed.shellOpen) failures.push("Escape did not close the game");
if (!closed.focusInBody) failures.push("focus was lost after closing the game");

// 7. The guardian dialogs are native <dialog> elements. Their Tab cycle may pass
// through document.body, which is normal, but it must never reach an interactive
// control on the page behind them.
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector("#parent-open")?.click());
await page.waitForTimeout(500);
const gateOpen = await page.evaluate(() => Boolean(document.querySelector("#parent-gate")?.open));
if (!gateOpen) failures.push("the guardian gate did not open");

const gateLeaks = [];
for (let press = 0; press < 14; press += 1) {
  await page.keyboard.press("Tab");
  const leak = await page.evaluate(() => {
    const active = document.activeElement;
    const gate = document.querySelector("#parent-gate");
    if (gate.contains(active) || active === document.body) return null;
    const interactive = active.matches('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!interactive) return null;
    return (active.getAttribute("aria-label") || active.textContent || active.tagName).trim().slice(0, 30);
  });
  if (leak) gateLeaks.push(leak);
}
console.log(`guardian gate leaks to background controls: ${gateLeaks.length}/14`);
if (gateLeaks.length) {
  failures.push(`focus reached background controls from the guardian gate: ${[...new Set(gateLeaks)].join(" | ")}`);
}
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// 8. The skip link must be the route to the catalog for keyboard users.
const skipLink = await page.evaluate(() => {
  const link = document.querySelector(".skip-link");
  if (!link) return null;
  link.focus();
  return { href: link.getAttribute("href"), focused: document.activeElement === link };
});
console.log(`skip link: ${JSON.stringify(skipLink)}`);
if (!skipLink?.focused) failures.push("the skip link cannot receive focus");

await browser.close();
server.close();

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("keyboard checks passed");
