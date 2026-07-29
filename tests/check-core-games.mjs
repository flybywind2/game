/* Validates the 12 core games that live inside app.js.

   tests/check-data.mjs can only read the extra-game JSON, so the original twelve
   games had no data validation at all. Their round data is in a closure, so this
   inspects what actually renders for every round of every core game and checks the
   invariants each interaction mode relies on. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(600);

const failures = [];

// Each mode marks its answer differently, so the solvable check is per mode.
const SOLVABLE = {
  choice: 'button[data-index]',
  spot: '[data-target="true"]',
  trace: "[data-activity-drop]",
  count: "[data-total]",
  quantity: "button",
  add: "[data-total], .math-piece",
  subtract: "[data-total], .math-piece",
  compare: "[data-option-index]",
  countCompare: "button",
  connect: "[data-match]",
  drag: "[data-match], [data-activity-drop]",
  sort: "[data-expected], [data-activity-drop]",
  sequence: "[data-activity-drop]",
  memory: "[data-pair]",
  pattern: "[data-activity-drop]",
  order: "[data-rank]",
  draw: "canvas",
};

// Core games are the catalog entries that are not part of MONGLE_EXTRA_GAMES.
const coreKeys = await page.evaluate(() => {
  const extra = window.MONGLE_EXTRA_GAMES || {};
  return [...new Set([...document.querySelectorAll("[data-game]")].map((n) => n.dataset.game))].filter(
    (key) => !Object.prototype.hasOwnProperty.call(extra, key),
  );
});

if (!coreKeys.length) failures.push("no core games found in the catalog");

let roundsChecked = 0;
for (const key of coreKeys) {
  // renderRound() is not reachable from outside, so step rounds via the replay of
  // the round index the app exposes through the progress dots.
  for (let round = 0; round < 3; round += 1) {
    const state = await page.evaluate(
      async ({ gameKey, roundIndex, solvable }) => {
        window.location.hash = "";
        await new Promise((resolve) => setTimeout(resolve, 40));
        window.location.hash = `#game/${gameKey}`;
        await new Promise((resolve) => setTimeout(resolve, 220));

        // Advance by finishing rounds the same way a child would where possible.
        for (let step = 0; step < roundIndex; step += 1) {
          const spot = document.querySelector('#answer-grid [data-target="true"]:not([disabled])');
          const choice = document.querySelector("#answer-grid .answer-button");
          const clickable = spot || choice;
          if (!clickable) return { advanced: false, atRound: step };
          clickable.click();
          await new Promise((resolve) => setTimeout(resolve, 1750));
        }

        const stage = document.querySelector("#answer-grid");
        const mode = stage.dataset.mode || "choice";
        const buttons = [...stage.querySelectorAll(".answer-button")];
        const selector = solvable[mode] || "button";
        return {
          advanced: true,
          mode,
          dots: document.querySelectorAll("#play-progress .progress-dot").length,
          prompt: document.querySelector("#play-prompt")?.textContent?.trim() || "",
          helper: document.querySelector("#prompt-helper")?.textContent?.trim() || "",
          hint: document.querySelector("#interaction-hint")?.textContent?.trim() || "",
          choiceLabels: buttons.map((b) => b.querySelector(".answer-label")?.textContent?.trim() || ""),
          solvableCount: stage.querySelectorAll(selector).length,
          interactive: stage.querySelectorAll("button, [role='button'], canvas").length,
          requiredActions: Number(stage.dataset.requiredActions || 0),
        };
      },
      { gameKey: key, roundIndex: round, solvable: SOLVABLE },
    );

    const label = `${key}/round${round + 1}`;
    if (!state.advanced) {
      // Modes that need drag-and-drop cannot be auto-advanced; round 1 still counts.
      break;
    }
    roundsChecked += 1;

    if (!state.prompt) failures.push(`${label}: empty prompt`);
    if (!state.helper) failures.push(`${label}: empty helper text`);
    if (!state.hint) failures.push(`${label}: empty interaction hint`);
    if (state.dots !== 3) failures.push(`${label}: ${state.dots} progress dots, expected 3`);
    if (state.interactive < 1) failures.push(`${label}: nothing to interact with`);
    if (state.solvableCount < 1) {
      failures.push(`${label} [${state.mode}]: no solvable element matched for this mode`);
    }
    if (state.mode !== "choice" && state.requiredActions < 1) {
      failures.push(`${label} [${state.mode}]: requiredActions was not set`);
    }
    if (state.mode === "choice") {
      if (state.choiceLabels.length !== 3) {
        failures.push(`${label}: ${state.choiceLabels.length} options, expected 3`);
      }
      if (new Set(state.choiceLabels).size !== state.choiceLabels.length) {
        failures.push(`${label}: duplicate option labels ${JSON.stringify(state.choiceLabels)}`);
      }
      if (state.choiceLabels.some((text) => !text)) failures.push(`${label}: an option has no label`);
    }
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
}

console.log(`core games checked: ${coreKeys.length} (${coreKeys.join(", ")})`);
console.log(`rounds validated: ${roundsChecked}`);

await browser.close();
server.close();

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("core game checks passed");
