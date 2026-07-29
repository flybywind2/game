/* Guards the Supertonic voice: every spoken line must resolve to a pre-generated
   F1 mp3, never the device speech engine.

   Activity modes build their prompts at runtime in interaction-engine.js, so a new
   or reworded prompt silently falls back to the robotic device voice unless
   `scripts/collect_activity_phrases.mjs` and the generator are re-run. This hooks the
   real playback paths (Audio + speechSynthesis) so that regression fails the build. */
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await page.addInitScript(() => {
  window.localStorage.setItem("mongle-welcome-v1", "done");
  window.__file = [];
  window.__device = [];

  // Supertonic path: app.js plays a manifest mp3 through `new Audio(src)`.
  const NativeAudio = window.Audio;
  window.Audio = function PatchedAudio(src) {
    if (typeof src === "string" && src.includes("/audio/tts/")) window.__file.push(src);
    const audio = new NativeAudio(src);
    // Autoplay of real media is unreliable in headless runs; keep the app flowing.
    audio.play = () => Promise.resolve();
    return audio;
  };

  // Device fallback path: speakWithBrowser() uses speechSynthesis.
  if (window.speechSynthesis) {
    const speakOriginal = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (utterance) => {
      window.__device.push(utterance?.text || "");
      try {
        speakOriginal(utterance);
      } catch {
        /* ignore */
      }
    };
  }
});
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const keys = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll("[data-game]")].map((n) => n.dataset.game))],
);

const rows = [];
const spokenViaDevice = new Set();
for (const key of keys) {
  await page.evaluate(() => {
    window.__file = [];
    window.__device = [];
  });
  await page.evaluate((gameKey) => {
    window.location.hash = `#game/${gameKey}`;
  }, key);
  await page.waitForTimeout(260);

  // Play through all three rounds so mid-game lines are covered too.
  for (let round = 0; round < 3; round += 1) {
    const advanced = await page.evaluate(() => {
      const target = document.querySelector('#answer-grid [data-target="true"]:not([disabled])');
      if (!target) return false;
      target.click();
      return true;
    });
    if (!advanced) break;
    await page.waitForTimeout(1500);
  }

  const row = await page.evaluate(() => ({
    mode: document.querySelector("#answer-grid")?.dataset.mode || "choice",
    file: window.__file.length,
    device: window.__device.slice(),
  }));
  rows.push({ key, ...row });
  row.device.filter(Boolean).forEach((line) => spokenViaDevice.add(line));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(140);
}

const usedDevice = rows.filter((row) => row.device.length > 0);
const totalFiles = rows.reduce((sum, row) => sum + row.file, 0);
console.log(`games played: ${rows.length}, Supertonic files played: ${totalFiles}`);
console.log(`games that fell back to the device voice: ${usedDevice.length}`);

if (usedDevice.length) {
  const byMode = {};
  for (const row of usedDevice) byMode[row.mode] = (byMode[row.mode] || 0) + 1;
  console.error("device fallback by mode:", JSON.stringify(byMode));
  for (const line of [...spokenViaDevice].slice(0, 15)) {
    console.error(`  MISSING VOICE FILE: ${line}`);
  }
  console.error(
    "Run `node scripts/collect_activity_phrases.mjs` then the Supertonic generator to add them.",
  );
}

// Autoplay is blocked until the page is interacted with. Opening a game link directly
// must not report a voice failure or switch to the device voice; the F1 line should
// simply play on the first tap.
const blockedContext = await browser.newContext({ viewport: { width: 412, height: 915 } });
const blockedPage = await blockedContext.newPage();
await blockedPage.addInitScript(() => {
  window.localStorage.setItem("mongle-welcome-v1", "done");
  window.__files = [];
  window.__device = [];
  const NativeAudio = window.Audio;
  window.Audio = function PatchedAudio(src) {
    if (typeof src === "string" && src.includes("/audio/tts/")) window.__files.push(src);
    return new NativeAudio(src);
  };
  if (window.speechSynthesis) {
    const original = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (utterance) => {
      window.__device.push(utterance?.text || "");
      try {
        original(utterance);
      } catch {
        /* ignore */
      }
    };
  }
});
await blockedPage.goto(`${base}#game/colors`, { waitUntil: "domcontentloaded" });
await blockedPage.waitForTimeout(2000);

const beforeTap = await blockedPage.evaluate(() => ({
  toast: document.querySelector("#toast")?.textContent?.trim() || "",
  device: window.__device.length,
}));
await blockedPage.mouse.click(5, 5);
await blockedPage.waitForTimeout(900);
const afterTap = await blockedPage.evaluate(() => ({
  toast: document.querySelector("#toast")?.textContent?.trim() || "",
  device: window.__device.length,
  files: window.__files.length,
}));

console.log(`autoplay-blocked start: toast="${beforeTap.toast}" deviceVoice=${beforeTap.device}`);
console.log(`after first tap: F1 files played=${afterTap.files}, deviceVoice=${afterTap.device}`);

const autoplayProblems = [];
if (beforeTap.toast.includes("불러오지 못")) {
  autoplayProblems.push("a voice-failure toast was shown when audio was only blocked by autoplay policy");
}
if (afterTap.device > 0) {
  autoplayProblems.push("the device voice was used instead of the F1 recording after the first tap");
}
if (afterTap.files < 1) {
  autoplayProblems.push("no F1 voice file played after the first tap");
}
autoplayProblems.forEach((message) => console.error(`FAIL ${message}`));

await browser.close();
server.close();
process.exit(usedDevice.length || autoplayProblems.length ? 1 : 0);
