/* Opens every game and every round in a real browser, then checks the static pages. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
const page = await context.newPage();

const problems = [];
page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
});
page.on("requestfailed", (req) => {
  problems.push(`requestfailed: ${req.url()}`);
});

await page.addInitScript(() => {
  window.localStorage.setItem("mongle-welcome-v1", "done");
});
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(800);

const uniqueKeys = await page.evaluate(() => {
  const fromCards = Array.from(document.querySelectorAll("[data-game]")).map((node) => node.dataset.game);
  return [...new Set(fromCards)];
});
console.log(`discovered ${uniqueKeys.length} game keys`);

const results = [];
if (uniqueKeys.length !== 105) {
  problems.push(`expected 105 catalog games, found ${uniqueKeys.length}`);
}

for (const key of uniqueKeys) {
  const before = problems.length;
  await page.evaluate((gameKey) => {
    window.location.hash = `#game/${gameKey}`;
  }, key);
  await page.waitForTimeout(300);
  const state = await page.evaluate(() => {
    const stage = document.querySelector("#answer-grid");
    const shell = document.querySelector("#game-shell");
    return {
      open: Boolean(shell?.classList.contains("is-open")),
      title: document.querySelector("#play-game-name")?.textContent?.trim() || "",
      prompt: document.querySelector("#play-prompt")?.textContent?.trim() || "",
      helper: document.querySelector("#prompt-helper")?.textContent?.trim() || "",
      mode: stage?.dataset.mode || "choice",
      interactive: stage ? stage.querySelectorAll("button, [role='button'], canvas").length : 0,
      announcer: Boolean(document.querySelector("#activity-announcer")),
    };
  });
  const newProblems = problems.slice(before);
  const ok = state.open
    && state.prompt.length > 0
    && state.title.length > 0
    && state.interactive > 0
    && newProblems.length === 0;
  results.push({ key, ...state, ok, newProblems });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(260);
}

const failures = results.filter((item) => !item.ok);
console.log(`ok ${results.length - failures.length}/${results.length}`);
for (const failure of failures.slice(0, 25)) {
  console.log("FAIL", JSON.stringify(failure));
}

// A full game must be completable end to end through real clicks, all three rounds.
const walkthrough = { key: "colors", rounds: 0, progressStamped: false, errors: [] };
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(400);
await page.evaluate(() => {
  window.location.hash = "#game/colors";
});
await page.waitForTimeout(400);
for (let round = 0; round < 3; round += 1) {
  // Rounds advance on a timer after the celebration, so wait for a fresh, enabled target.
  const ready = await page
    .waitForFunction(() => {
      const stage = document.querySelector("#answer-grid");
      return Boolean(stage?.querySelector('[data-target="true"]:not([disabled])'));
    }, null, { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  if (!ready) {
    const debug = await page.evaluate(() => {
      const stage = document.querySelector("#answer-grid");
      return { mode: stage?.dataset.mode, html: stage?.innerHTML.slice(0, 200) };
    });
    walkthrough.errors.push(`round ${round + 1} never became ready: ${JSON.stringify(debug)}`);
    break;
  }
  await page.evaluate(() => {
    document.querySelector('#answer-grid [data-target="true"]:not([disabled])')?.click();
  });
  walkthrough.rounds += 1;
  await page.waitForTimeout(400);
}
walkthrough.progressStamped = await page.evaluate(() => {
  const progress = window.localStorage.getItem("mongle-play-progress-v1") || "";
  const profile = window.localStorage.getItem("mongle-learner-profile-v2") || "";
  return progress.includes("colors") || profile.includes("colors");
});
console.log("WALKTHROUGH", JSON.stringify(walkthrough));
if (walkthrough.rounds !== 3) {
  failures.push({ key: "colors-walkthrough", newProblems: walkthrough.errors });
}

// Static release pages must load and be styled. 404.html uses absolute /game/ paths,
// so it is checked against a prefixed mount that mirrors GitHub Pages.
const staticPages = ["privacy.html", "terms.html", "support.html"];
for (const path of staticPages) {
  const response = await page.goto(base + path, { waitUntil: "domcontentloaded" });
  const info = await page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim() || "",
    styled: getComputedStyle(document.body).backgroundImage !== "none",
    homeLink: Boolean(document.querySelector('a[href="./"]')),
  }));
  const pageOk = response?.status() === 200 && info.heading.length > 0 && info.styled && info.homeLink;
  console.log(`PAGE ${path} status=${response?.status()} heading="${info.heading}" styled=${info.styled}`);
  if (!pageOk) failures.push({ key: path, newProblems: [JSON.stringify(info)] });
}

const prefixed = await startStaticServer(process.cwd(), 0, "/game");
const notFoundResponse = await page.goto(`${prefixed.base}game/404.html`, { waitUntil: "domcontentloaded" });
const notFoundInfo = await page.evaluate(() => ({
  heading: document.querySelector("h1")?.textContent?.trim() || "",
  styled: getComputedStyle(document.body).backgroundImage !== "none",
  homeLink: Boolean(document.querySelector('a[href="/game/"]')),
}));
console.log(`PAGE 404.html status=${notFoundResponse?.status()} styled=${notFoundInfo.styled}`);
if (notFoundResponse?.status() !== 200 || !notFoundInfo.styled || !notFoundInfo.homeLink) {
  failures.push({ key: "404.html", newProblems: [JSON.stringify(notFoundInfo)] });
}
prefixed.server.close();

await browser.close();
server.close();
console.log(failures.length ? `FAILED (${failures.length})` : "all browser checks passed");
process.exit(failures.length ? 1 : 0);
