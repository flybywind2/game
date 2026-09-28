/* Plays games to the end by answering correctly, then verifies the app recognises
   completion and records progress.

   The other browser checks only prove a round renders. This proves a child can
   actually finish a game: the answer logic accepts the correct response, all three
   rounds advance, the completion screen appears, and the sticker and progress
   records update.

   Every game plays three different ways, so the default sample is chosen to cover
   every (round, format) pair at least once. Formats that need freehand drawing or
   finger tracing cannot be scripted; games that reach one are played up to that
   round and reported separately. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";
import {
  SOLVER,
  UNSCRIPTABLE_MODES,
  fastAudioInitScript,
  roundState,
  waitForAdvance,
  waitForRound,
} from "./auto-player.mjs";

// A full sweep of all 105 games takes several minutes, too slow for every push.
// Pass --all (or set PLAYTHROUGH_ALL=1) for the sweep.
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
await page.addInitScript(fastAudioInitScript);
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const plans = await page.evaluate(() => {
  const keys = [...new Set([...document.querySelectorAll("[data-game]")].map((node) => node.dataset.game))];
  return keys.map((key) => ({ key, plan: window.MONGLE_INTERACTIONS.planFor(key) }));
});
const failures = [];

// The redesign's promise: no game repeats one format for all three rounds, except
// the free drawing studio where drawing three pictures is the point.
const REPEAT_ALLOWED = new Set(["extra089"]);
const repeated = plans.filter(({ key, plan }) => !REPEAT_ALLOWED.has(key) && new Set(plan).size < 3);
const sameThrice = plans.filter(({ key, plan }) => !REPEAT_ALLOWED.has(key) && new Set(plan).size === 1);
if (sameThrice.length) {
  failures.push(`${sameThrice.length} game(s) use one format for all three rounds: ${sameThrice.map((p) => p.key).join(", ")}`);
}
console.log(`games with three different rounds: ${plans.length - repeated.length}/${plans.length}`);

let targets = plans;
if (!runAll) {
  const covered = new Set();
  targets = plans.filter(({ plan }) => {
    const pairs = plan.map((mode, index) => index + ":" + mode);
    if (pairs.every((pair) => covered.has(pair))) return false;
    pairs.forEach((pair) => covered.add(pair));
    return true;
  });
}
const formats = new Set(targets.flatMap(({ plan }) => plan));
console.log(`playing ${targets.length} game(s) covering ${formats.size} round formats${runAll ? " (full sweep)" : ""}`);

const completed = [];
const partial = [];

for (const { key, plan } of targets) {
  await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
  let advanced = 0;
  let lastReason = null;
  let stoppedAt = null;
  for (let round = 0; round < 3; round += 1) {
    if (!(await waitForRound(page))) {
      lastReason = `round ${round + 1} never became interactive`;
      break;
    }
    const mode = await page.evaluate(() => document.querySelector("#answer-grid")?.dataset.mode || "choice");
    if (mode !== plan[round]) {
      lastReason = `round ${round + 1} showed ${mode}, planned ${plan[round]}`;
      break;
    }
    if (UNSCRIPTABLE_MODES.has(mode)) {
      stoppedAt = mode;
      break;
    }
    const before = await roundState(page);
    if (before.completed) break;
    const result = await SOLVER(page);
    if (!result.ok) {
      lastReason = `round ${round + 1} [${mode}]: ${result.reason || "solver could not finish"}`;
      break;
    }
    if (!(await waitForAdvance(page, before))) {
      lastReason = `round ${round + 1} [${mode}] did not advance after a correct answer`;
      break;
    }
    advanced += 1;
  }

  if (stoppedAt) {
    partial.push({ key, advanced, mode: stoppedAt });
    continue;
  }
  if (advanced !== 3) {
    failures.push(`${key} [${plan.join(" > ")}]: advanced ${advanced}/3 rounds (${lastReason})`);
    continue;
  }

  const sawCompletion = await page
    .waitForSelector("#play-main .completion-card", { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  const outcome = await page.evaluate((gameKey) => {
    const profile = JSON.parse(window.localStorage.getItem("mongle-learner-profile-v2") || "{}");
    return { recorded: Boolean(profile.completed?.[gameKey]), sticker: (profile.stickers || []).includes(gameKey) };
  }, key);
  if (!sawCompletion) failures.push(`${key}: no completion card after 3 rounds`);
  if (!outcome.recorded) failures.push(`${key}: completion was not saved to the profile`);
  if (!outcome.sticker) failures.push(`${key}: no sticker was awarded`);
  if (sawCompletion && outcome.recorded && outcome.sticker) completed.push(key);
}

const stickerCount = await page.evaluate(() => {
  const profile = JSON.parse(window.localStorage.getItem("mongle-learner-profile-v2") || "{}");
  return (profile.stickers || []).length;
});

console.log(`played to completion: ${completed.length}/${targets.length - partial.length} fully scriptable games`);
console.log(
  `played up to a drawing round: ${partial.length} (${partial.map((item) => `${item.key} ${item.advanced}/3`).join(", ") || "none"})`,
);
console.log(`stickers earned: ${stickerCount}`);
if (pageErrors.length) failures.push(`console errors during play: ${pageErrors.slice(0, 3).join(" | ")}`);

for (const failure of failures.slice(0, 20)) console.error(`FAIL ${failure}`);

await browser.close();
server.close();
process.exit(failures.length ? 1 : 0);

