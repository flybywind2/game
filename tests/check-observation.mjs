/* Drives the 10-minute observation protocol from BETA_TEST_GUIDE.md.

   This is the flow used to decide whether the product is ready to sell, so it has to
   work end to end: the guardian prepares it, the child starts it, three games chain
   automatically, the extra free-choice games appear, and the result is recorded and
   copyable. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";
import { SOLVER, waitForRound, roundState } from "./auto-player.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const failures = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message.slice(0, 90)));

await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

// Guardian opens their space and starts the observation.
await page.evaluate(() => document.querySelector("#parent-open")?.click());
await page.waitForTimeout(400);
await page.evaluate(() => {
  const question = document.querySelector("#parent-gate-question")?.textContent || "";
  const numbers = [...question.matchAll(/(\d+)/g)].map((match) => Number(match[1]));
  const answer = numbers.length >= 2 ? numbers[0] + numbers[1] : null;
  const choices = [...document.querySelectorAll("#parent-gate-choices button")];
  (choices.find((button) => Number(button.textContent.trim()) === answer) || choices[0])?.click();
});
await page.waitForTimeout(700);

const startButton = await page.evaluate(() => Boolean(document.querySelector("#start-usability-observation")));
if (!startButton) failures.push("the observation start button is missing from the guardian space");
await page.evaluate(() => document.querySelector("#start-usability-observation")?.click());
await page.waitForTimeout(700);

const readyShown = await page.evaluate(() => Boolean(document.querySelector("#usability-ready")?.open));
console.log(`hand-over screen shown: ${readyShown}`);
if (!readyShown) failures.push("the hand-over screen did not appear for the guardian");

// The child presses start themselves; the first-tap time is recorded from here.
await page.evaluate(() => document.querySelector("#usability-child-start")?.click());
await page.waitForTimeout(1000);

const started = await page.evaluate(() => ({
  chip: document.querySelector("#play-time-chip")?.textContent?.trim() || "",
  open: Boolean(document.querySelector("#game-shell")?.classList.contains("is-open")),
}));
console.log(`observation started: ${JSON.stringify(started)}`);
if (!started.open) failures.push("the observation did not open a game");
if (!/1\s*\/\s*3/.test(started.chip)) failures.push(`the progress chip did not show 1 / 3 (got "${started.chip}")`);

// Play the three observation games, following the in-app "next" button between them.
const chips = [];
for (let game = 1; game <= 3; game += 1) {
  for (let round = 0; round < 3; round += 1) {
    if (!(await waitForRound(page))) break;
    const before = await roundState(page);
    if (before.completed) break;
    const result = await SOLVER(page);
    if (!result.ok) {
      failures.push(`observation game ${game}: ${result.reason || "could not be solved"}`);
      break;
    }
    await page.waitForTimeout(2600);
  }

  // The completion card is rendered after the final celebration, so wait for the
  // observation's own "next" control rather than sampling immediately.
  const nextReady = await page
    .waitForSelector("#play-main .completion-usability-next, #play-main .completion-usability-choice", {
      timeout: 12000,
    })
    .then(() => true)
    .catch(() => false);

  const chip = await page.evaluate(() => document.querySelector("#play-time-chip")?.textContent?.trim() || "");
  chips.push(chip);

  const advanced = nextReady
    ? await page.evaluate(() => {
        const next = document.querySelector("#play-main .completion-usability-next");
        if (!next) return null;
        next.click();
        return next.textContent.trim().slice(0, 24);
      })
    : null;
  console.log(`game ${game} finished at "${chip}", next: ${advanced || "none offered"}`);
  if (game < 3 && !advanced) {
    failures.push(`observation game ${game} did not offer the next game`);
  }
  await page.waitForTimeout(1600);
}

// After the third game the child should be offered extra games to choose freely.
const afterThree = await page.evaluate(() => ({
  choices: document.querySelectorAll("#play-main .completion-usability-choice, .usability-extra-choice").length,
  text: document.querySelector("#play-main")?.textContent?.replace(/\s+/g, " ").slice(0, 80) || "",
}));
console.log(`free-choice games offered: ${afterThree.choices}`);

// The observation must be recorded and copyable for the guardian.
const record = await page.evaluate(() => window.localStorage.getItem("mongle-usability-observations-v1"));
console.log(`observation recorded: ${record ? "yes" : "no"}`);
if (!record) failures.push("the observation result was not saved for the guardian");

if (errors.length) failures.push(`runtime errors during the observation: ${errors[0]}`);

await browser.close();
server.close();

failures.forEach((message) => console.error(`FAIL ${message}`));
if (failures.length) process.exit(1);
console.log("observation mode checks passed");
