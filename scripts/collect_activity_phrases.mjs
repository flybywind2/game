/* Harvests every spoken line that interaction-engine.js builds at runtime.

   For activity modes app.js speaks `activity.speech || activity.prompt`, which is
   assembled in the browser. The Python generator only scans app.js and the game
   JSON, so those lines had no Supertonic file and fell back to the device voice.

   This drives the real UI: it opens every game, walks all three rounds by answering
   correctly is not required, and records exactly what `speak()` receives. */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { startStaticServer } from "../tests/static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

await page.addInitScript(() => {
  window.localStorage.setItem("mongle-welcome-v1", "done");
  window.__spoken = [];
  // speak() reaches exactly one of these two paths for every line it plays.
  const NativeAudio = window.Audio;
  window.Audio = function PatchedAudio(src) {
    const audio = new NativeAudio(src);
    audio.play = () => Promise.resolve();
    return audio;
  };
  if (window.speechSynthesis) {
    const original = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (utterance) => {
      if (utterance?.text) window.__spoken.push(utterance.text);
      try {
        original(utterance);
      } catch {
        /* ignore */
      }
    };
  }
});

await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const keys = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll("[data-game]")].map((node) => node.dataset.game))],
);

const collected = new Set();
for (const key of keys) {
  await page.evaluate((gameKey) => {
    window.__spoken = [];
    window.location.hash = `#game/${gameKey}`;
  }, key);
  await page.waitForTimeout(240);

  // Walk all three rounds by clicking whatever the activity marks as correct.
  for (let round = 0; round < 3; round += 1) {
    const advanced = await page.evaluate(() => {
      const stage = document.querySelector("#answer-grid");
      const target = stage?.querySelector('[data-target="true"]:not([disabled])');
      if (!target) return false;
      target.click();
      return true;
    });
    if (!advanced) break;
    await page.waitForTimeout(1600);
  }

  const lines = await page.evaluate(() => window.__spoken.slice());
  lines.filter(Boolean).forEach((line) => collected.add(line));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(160);
}

await browser.close();
server.close();

const phrases = [...collected].sort();
await writeFile("data/activity-phrases.json", `${JSON.stringify(phrases, null, 2)}\n`, "utf8");
console.log(`wrote data/activity-phrases.json with ${phrases.length} runtime spoken lines`);
