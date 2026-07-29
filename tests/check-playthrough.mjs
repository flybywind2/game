/* Plays every game to the end by answering correctly, then verifies the app
   recognises completion and records progress.

   The other browser checks only prove a round renders. This proves a child can
   actually finish a game: the answer logic accepts the correct response, all three
   rounds advance, the completion screen appears, and the sticker and progress
   records update. Modes that need freehand drawing or gesture tracing cannot be
   scripted; they are reported and counted separately rather than silently skipped. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";
import { SOLVER, waitForRound, waitForAdvance, roundState } from "./auto-player.mjs";

// Only freehand drawing and finger tracing cannot be scripted; every other mode is
// played to completion.
const UNSCRIPTABLE_MODES = new Set(["trace", "draw"]);

// A full sweep of all 105 games takes about 15 minutes, too slow for every push.
// By default cover one game per interaction mode, which catches answer-logic and
// completion regressions. Pass --all (or set PLAYTHROUGH_ALL=1) for the sweep.
const runAll = process.argv.includes("--all") || process.env.PLAYTHROUGH_ALL === "1";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") pageErrors.push(message.text());
});

await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const keys = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll("[data-game]")].map((node) => node.dataset.game))],
);

// Resolve each game's mode once so the sample covers every mode exactly once.
// Navigate straight to the game URL: closing with Escape uses history.back(), and
// rapid open/close cycles leave history state that blocks the next round advance.
const modeByKey = new Map();
for (const key of keys) {
  await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(160);
  const mode = await page.evaluate(() => document.querySelector("#answer-grid")?.dataset.mode || "choice");
  modeByKey.set(key, mode);
}

let targetKeys = keys;
if (!runAll) {
  const seen = new Set();
  targetKeys = keys.filter((key) => {
    const mode = modeByKey.get(key);
    if (seen.has(mode)) return false;
    seen.add(mode);
    return true;
  });
}
console.log(`playing ${targetKeys.length} game(s) covering ${new Set(targetKeys.map((k) => modeByKey.get(k))).size} mode(s)${runAll ? " (full sweep)" : ""}`);

const completed = [];
const skipped = [];
const failures = [];

for (const key of targetKeys) {
  await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
  if (!(await waitForRound(page))) {
    failures.push(`${key}: first round never became interactive`);
    continue;
  }

  const mode = await page.evaluate(() => document.querySelector("#answer-grid")?.dataset.mode || "choice");
  if (UNSCRIPTABLE_MODES.has(mode)) {
    skipped.push({ key, mode });
    continue;
  }

  // Count rounds the app actually advanced past, not what the solver claims.
  let advanced = 0;
  let lastReason = null;
  for (let round = 0; round < 3; round += 1) {
    if (!(await waitForRound(page))) {
      lastReason = `round ${round + 1} never became interactive`;
      break;
    }
    const before = await roundState(page);
    if (before.completed) break;
    const result = await SOLVER(page);
    if (!result.ok) {
      lastReason = `round ${round + 1}: ${result.reason || "solver could not finish"}`;
      break;
    }
    if (!(await waitForAdvance(page, before))) {
      lastReason = `round ${round + 1} did not advance after a correct answer`;
      break;
    }
    advanced += 1;
  }

  if (advanced !== 3) {
    failures.push(`${key} [${mode}]: advanced ${advanced}/3 rounds (${lastReason})`);
    continue;
  }

  // The completion card renders after the final celebration, so wait for it.
  const sawCompletion = await page
    .waitForSelector("#play-main .completion-card", { timeout: 8000 })
    .then(() => true)
    .catch(() => false);

  const outcome = await page.evaluate((gameKey) => {
    const profile = JSON.parse(window.localStorage.getItem("mongle-learner-profile-v2") || "{}");
    return {
      recorded: Boolean(profile.completed?.[gameKey]),
      sticker: (profile.stickers || []).includes(gameKey),
    };
  }, key);

  if (!sawCompletion) failures.push(`${key} [${mode}]: no completion card after 3 rounds`);
  if (!outcome.recorded) failures.push(`${key} [${mode}]: completion was not saved to the profile`);
  if (!outcome.sticker) failures.push(`${key} [${mode}]: no sticker was awarded`);
  if (sawCompletion && outcome.recorded && outcome.sticker) completed.push({ key, mode });
}

const stickerCount = await page.evaluate(() => {
  const profile = JSON.parse(window.localStorage.getItem("mongle-learner-profile-v2") || "{}");
  return (profile.stickers || []).length;
});

console.log(`played to completion: ${completed.length}/${targetKeys.length - skipped.length} scriptable games`);
console.log(`modes completed: ${[...new Set(completed.map((item) => item.mode))].sort().join(", ")}`);
console.log(`skipped (freehand or gesture modes): ${skipped.length} (${[...new Set(skipped.map((s) => s.mode))].join(", ")})`);
console.log(`stickers earned: ${stickerCount}`);
if (pageErrors.length) failures.push(`console errors during play: ${pageErrors.slice(0, 3).join(" | ")}`);

for (const failure of failures.slice(0, 20)) console.error(`FAIL ${failure}`);

await browser.close();
server.close();
process.exit(failures.length ? 1 : 0);
