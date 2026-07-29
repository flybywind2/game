/* Checks the app still works when the device fights back.

   Real families hit these: a private-browsing window where localStorage throws, a
   half-written record from a tab that was closed mid-save, and a full storage quota.
   In every case a child should still be able to open a game and play; losing progress
   is acceptable, a blank screen is not. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const failures = [];

async function scenario(name, setup) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message.slice(0, 90)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text().slice(0, 90));
  });
  await page.addInitScript(setup);
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(900);

  const home = await page.evaluate(() => document.querySelectorAll(".game-card").length);

  await page.evaluate(() => {
    window.location.hash = "#game/colors";
  });
  await page.waitForTimeout(800);
  const game = await page.evaluate(() => {
    const stage = document.querySelector("#answer-grid");
    return {
      open: Boolean(document.querySelector("#game-shell")?.classList.contains("is-open")),
      prompt: document.querySelector("#play-prompt")?.textContent?.trim() || "",
      controls: stage ? stage.querySelectorAll("button, canvas").length : 0,
    };
  });

  // Answering must not throw even when the result cannot be saved.
  const answered = await page.evaluate(() => {
    const target = document.querySelector('#answer-grid [data-target="true"]:not([disabled])');
    if (!target) return false;
    target.click();
    return true;
  });
  await page.waitForTimeout(1200);
  const feedback = await page.evaluate(() => document.querySelector("#feedback")?.textContent?.trim() || "");

  const ok = home === 105 && game.open && game.prompt.length > 0 && game.controls > 0;
  console.log(
    `${name}: cards=${home} gameOpen=${game.open} controls=${game.controls} answered=${answered} feedback="${feedback.slice(0, 18)}" errors=${errors.length}`,
  );
  if (!ok) failures.push(`${name}: the app was not usable (${JSON.stringify(game)})`);
  if (errors.length) failures.push(`${name}: ${errors.length} runtime error(s), first: ${errors[0]}`);
  await page.close();
}

await scenario("corrupted records", () => {
  localStorage.setItem("mongle-welcome-v1", "done");
  localStorage.setItem("mongle-learner-profile-v2", '{"version":2,"completed":');
  localStorage.setItem("mongle-play-progress-v1", "not json at all");
  localStorage.setItem("mongle-play-limit-v1", "abc");
});

await scenario("storage blocked (private mode)", () => {
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new DOMException("blocked", "SecurityError");
    },
    configurable: true,
  });
});

await scenario("storage quota full", () => {
  const real = window.localStorage;
  const shim = {
    getItem: (key) => real.getItem(key),
    removeItem: (key) => real.removeItem(key),
    key: (index) => real.key(index),
    clear: () => real.clear(),
    setItem() {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    },
  };
  Object.defineProperty(shim, "length", { get: () => real.length });
  Object.defineProperty(window, "localStorage", { get: () => shim, configurable: true });
});

await browser.close();
server.close();

failures.forEach((message) => console.error(`FAIL ${message}`));
if (failures.length) process.exit(1);
console.log("resilience checks passed");
