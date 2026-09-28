/* Harvests every spoken line that interaction-engine.js builds at runtime.

   For activity modes app.js speaks `activity.speech || activity.prompt`, and some
   formats also read card names aloud. Those lines are assembled in the browser, so
   the Python generator cannot scrape them from app.js or the game JSON. Without a
   matching Supertonic file they fall back to the device voice.

   This drives the real UI: it opens every game, plays all three rounds with the same
   solver the tests use, and records every line that reaches the device voice. */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { startStaticServer } from "../tests/static-server.mjs";
import {
  SOLVER,
  UNSCRIPTABLE_MODES,
  fastAudioInitScript,
  roundState,
  waitForAdvance,
  waitForRound,
} from "../tests/auto-player.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.addInitScript(fastAudioInitScript);
// The manifest decides which lines already have a file. Hide it so every runtime
// line is heard through the device path and recorded.
await page.route("**/tts-manifest.js*", (route) =>
  route.fulfill({ contentType: "text/javascript", body: "window.MONGLE_TTS_AUDIO = Object.freeze({});" }),
);

await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const keys = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll("[data-game]")].map((node) => node.dataset.game))],
);

const heard = new Set();
const collect = async () => {
  const lines = await page.evaluate(() => window.__deviceVoice.splice(0));
  lines.filter(Boolean).forEach((line) => heard.add(line));
};

for (const key of keys) {
  await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
  for (let round = 0; round < 3; round += 1) {
    if (!(await waitForRound(page))) break;
    await page.waitForTimeout(250);
    await collect();
    const mode = await page.evaluate(() => document.querySelector("#answer-grid")?.dataset.mode || "choice");
    if (UNSCRIPTABLE_MODES.has(mode)) break;
    const before = await roundState(page);
    const result = await SOLVER(page);
    if (!result.ok) break;
    if (!(await waitForAdvance(page, before))) break;
  }
  await page.waitForTimeout(400);
  await collect();
}

await browser.close();
server.close();

// The manifest holds everything the generator already voices: round lines it reads
// from app.js and the game JSON, plus the previous runtime list. Keep a heard line
// when it has no file yet or was a runtime line before; drop lines the app no longer
// says so the offline voice pack does not carry unused files.
let previous = [];
try {
  previous = JSON.parse(await readFile("data/activity-phrases.json", "utf8"));
} catch {
  previous = [];
}
const manifestSource = await readFile("tts-manifest.js", "utf8");
const manifest = JSON.parse(manifestSource.slice(manifestSource.indexOf("(") + 1, manifestSource.indexOf(");")));
const previousSet = new Set(previous);
const phrases = [...heard].filter((line) => !(line in manifest) || previousSet.has(line)).sort();
await writeFile("data/activity-phrases.json", `${JSON.stringify(phrases, null, 2)}\n`, "utf8");
console.log(`heard ${heard.size} runtime lines; wrote data/activity-phrases.json with ${phrases.length} lines`);
