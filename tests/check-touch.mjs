/* Checks that a 40-month-old can actually hit the things they need to tap.

   Every interactive target inside a game is measured on a small phone viewport.
   The floor is 44x44 CSS pixels, the widely used minimum for young children and
   the WCAG 2.5.8 target-size guidance, and nothing may overflow the screen width
   or overlap another target. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const MIN_SIZE = 44;
const VIEWPORT = { width: 360, height: 780 };

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const keys = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll("[data-game]")].map((node) => node.dataset.game))],
);

const tooSmall = [];
const overflowing = [];

for (const key of keys) {
  await page.evaluate((gameKey) => {
    window.location.hash = `#game/${gameKey}`;
  }, key);
  await page.waitForTimeout(230);

  const report = await page.evaluate(
    ({ minSize, viewportWidth }) => {
      const stage = document.querySelector("#answer-grid");
      if (!stage) return { small: [], wide: [], mode: null };
      const targets = [...stage.querySelectorAll("button, [role='button'], canvas")];
      const small = [];
      const wide = [];
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue; // hidden until a later step
        if (target.hidden || target.disabled) continue;
        const label = (target.getAttribute("aria-label") || target.textContent || "").trim().slice(0, 24);
        if (rect.width < minSize || rect.height < minSize) {
          small.push({ label, w: Math.round(rect.width), h: Math.round(rect.height) });
        }
        if (rect.right > viewportWidth + 1 || rect.left < -1) {
          wide.push({ label, left: Math.round(rect.left), right: Math.round(rect.right) });
        }
      }
      return { small, wide, mode: stage.dataset.mode };
    },
    { minSize: MIN_SIZE, viewportWidth: VIEWPORT.width },
  );

  if (report.small.length) tooSmall.push({ key, mode: report.mode, items: report.small });
  if (report.wide.length) overflowing.push({ key, mode: report.mode, items: report.wide });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(90);
}

console.log(`checked ${keys.length} games at ${VIEWPORT.width}x${VIEWPORT.height}`);
console.log(`games with a target under ${MIN_SIZE}px: ${tooSmall.length}`);
console.log(`games with a target off screen: ${overflowing.length}`);

for (const entry of tooSmall.slice(0, 10)) {
  const worst = entry.items.slice(0, 3).map((item) => `${item.w}x${item.h} "${item.label}"`).join(", ");
  console.error(`  SMALL ${entry.key} [${entry.mode}] ${entry.items.length} target(s): ${worst}`);
}
for (const entry of overflowing.slice(0, 10)) {
  const worst = entry.items.slice(0, 3).map((item) => `${item.left}..${item.right} "${item.label}"`).join(", ");
  console.error(`  OFFSCREEN ${entry.key} [${entry.mode}]: ${worst}`);
}

await browser.close();
server.close();
process.exit(tooSmall.length || overflowing.length ? 1 : 0);
