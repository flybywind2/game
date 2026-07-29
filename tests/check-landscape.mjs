/* Checks that a game is playable with a device held sideways.

   The play screen is one viewport-tall column in landscape, and the activity area
   scrolls internally when it must. What matters for a 40-month-old is that the
   controls are reachable without the page itself scrolling away from the prompt, and
   that nothing is clipped out of reach.

   A control counts as reachable when it is inside the activity's own scroll area,
   which the child can swipe, or already visible on screen. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const VIEWPORTS = [
  { width: 720, height: 360, name: "phone landscape" },
  { width: 915, height: 412, name: "large phone landscape" },
  { width: 800, height: 480, name: "small tablet landscape" },
  { width: 1024, height: 600, name: "tablet landscape" },
];

const SAMPLE = [
  "colors",
  "counting",
  "words",
  "sizes",
  "patterns",
  "more",
  "sounds",
  "body",
  "matching",
  "routines",
  "extra016",
  "extra021",
  "extra090",
  "extra015",
  "shapes",
  "extra089",
];

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const failures = [];

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
  let unreachable = 0;
  let clipped = 0;

  for (const key of SAMPLE) {
    await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(320);
    const report = await page.evaluate(() => {
      const stage = document.querySelector("#answer-grid");
      const shell = document.querySelector("#game-shell");
      const prompt = document.querySelector("#play-prompt");
      const controls = [...stage.querySelectorAll("button:not([disabled]), canvas")];
      const stageRect = stage.getBoundingClientRect();
      const scrollable = stage.scrollHeight > stage.clientHeight + 1;

      // Unreachable: below the fold and not inside a scrollable activity area.
      const unreachable = controls.filter((control) => {
        const rect = control.getBoundingClientRect();
        const belowFold = rect.top > window.innerHeight;
        if (!belowFold) return false;
        return !scrollable;
      }).length;

      // Clipped: cut off by the stage box with no way to scroll to it.
      const clipped = controls.filter((control) => {
        const rect = control.getBoundingClientRect();
        return rect.bottom > stageRect.bottom + 1 && !scrollable;
      }).length;

      return {
        mode: stage.dataset.mode,
        promptVisible: prompt.getBoundingClientRect().bottom <= window.innerHeight,
        pageScrolls: shell.scrollHeight > shell.clientHeight + 1,
        unreachable,
        clipped,
        controls: controls.length,
      };
    });

    if (report.unreachable) {
      unreachable += 1;
      failures.push(`${viewport.name} ${key} [${report.mode}]: ${report.unreachable} control(s) unreachable`);
    }
    if (report.clipped) {
      clipped += 1;
      failures.push(`${viewport.name} ${key} [${report.mode}]: ${report.clipped} control(s) clipped`);
    }
    if (!report.promptVisible) {
      failures.push(`${viewport.name} ${key} [${report.mode}]: the question is not visible on screen`);
    }
  }

  console.log(
    `${viewport.name} ${viewport.width}x${viewport.height}: ${SAMPLE.length - unreachable - clipped}/${SAMPLE.length} games fully reachable`,
  );
  await page.close();
}

await browser.close();
server.close();

for (const failure of failures.slice(0, 15)) console.error(`FAIL ${failure}`);
if (failures.length) process.exit(1);
console.log("landscape checks passed");
