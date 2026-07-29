/* Verifies the difficulty adaptation the README promises.

   The app claims it reads the last six attempts per game and moves between support,
   standard and challenge, changing counts of pictures, cards, blanks and distractors
   while keeping the same correct answer. If this silently stopped working, a
   struggling child would keep getting the hardest version.

   Two seeded histories are used per game: six misses and six hits. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

// One game per adaptive mode. `words` is deliberately excluded: sort games only scale
// their card count when they are in the deep-sort config, and `words` sorts the three
// options of a single round instead, so its count is fixed by design. `routines` is
// the deep-sort case and does scale.
// One game per mode that scales its content with the level. Two modes deliberately do
// not scale and are excluded: `words` sorts one round's three options rather than a
// deck, and size ordering uses a fixed real-world sequence per round. Their level
// still changes hint timing, which is covered by the level assertions below.
const GAMES = [
  { key: "counting", countSelector: ".count-piece" },
  { key: "matching", countSelector: "[data-pair]" },
  { key: "colors", countSelector: ".spot-tile" },
  { key: "patterns", countSelector: "[data-activity-drop]" },
  { key: "routines", countSelector: "[data-expected]" },
];

// These must still report the right level even though their content is fixed.
const LEVEL_ONLY = ["words", "sizes"];

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const failures = [];

async function measure(key, selector, recent) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await page.addInitScript(
    ({ gameKey, history }) => {
      window.localStorage.setItem("mongle-welcome-v1", "done");
      window.localStorage.setItem(
        "mongle-learner-profile-v2",
        JSON.stringify({
          version: 2,
          nickname: "테스트",
          xp: 0,
          completed: {},
          stickers: [],
          totalAttempts: history.length,
          totalCorrect: history.filter(Boolean).length,
          totalHints: 0,
          gameStats: {
            [gameKey]: {
              attempts: history.length,
              correct: history.filter(Boolean).length,
              hints: history.filter((hit) => !hit).length,
              recent: history,
            },
          },
        }),
      );
    },
    { gameKey: key, history: recent },
  );
  await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(650);
  const result = await page.evaluate((itemSelector) => {
    const stage = document.querySelector("#answer-grid");
    return {
      difficulty: stage?.dataset.difficulty || null,
      items: stage ? stage.querySelectorAll(itemSelector).length : 0,
      requiredActions: Number(stage?.dataset.requiredActions || 0),
    };
  }, selector);
  await page.close();
  return result;
}

for (const { key, countSelector } of GAMES) {
  const struggling = await measure(key, countSelector, [false, false, false, false, false, false]);
  const confident = await measure(key, countSelector, [true, true, true, true, true, true]);

  console.log(
    `${key.padEnd(9)} support=${struggling.difficulty}/${struggling.items} items, challenge=${confident.difficulty}/${confident.items} items`,
  );

  if (struggling.difficulty !== "support") {
    failures.push(`${key}: six misses should give the support level, got ${struggling.difficulty}`);
  }
  if (confident.difficulty !== "challenge") {
    failures.push(`${key}: six hits should give the challenge level, got ${confident.difficulty}`);
  }
  // The level must change something the child can see, not just a label.
  if (struggling.items === confident.items && struggling.requiredActions === confident.requiredActions) {
    failures.push(`${key}: the level changed but the activity looks identical (${struggling.items} items either way)`);
  }
  if (confident.items < struggling.items) {
    failures.push(`${key}: the challenge level is easier than support (${confident.items} vs ${struggling.items})`);
  }
}

// Fixed-content modes must still report the level, since it drives hint timing.
for (const key of LEVEL_ONLY) {
  const struggling = await measure(key, "button", [false, false, false, false, false, false]);
  const confident = await measure(key, "button", [true, true, true, true, true, true]);
  console.log(`${key.padEnd(9)} level only: ${struggling.difficulty} -> ${confident.difficulty}`);
  if (struggling.difficulty !== "support" || confident.difficulty !== "challenge") {
    failures.push(
      `${key}: level did not adapt (${struggling.difficulty} / ${confident.difficulty})`,
    );
  }
}

await browser.close();
server.close();

failures.forEach((message) => console.error(`FAIL ${message}`));
if (failures.length) process.exit(1);
console.log("adaptive difficulty checks passed");
