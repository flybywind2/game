/* Verifies the guardian exports produce real files.

   Three of them are advertised: a growth report card, a four-week family plan, and a
   records backup. They are drawn on a canvas in the browser, so a styling or font
   change can silently produce a blank or truncated image, and a broken backup would
   lose a family's history. Each file is downloaded and inspected. */
import { chromium } from "playwright";
import { mkdtemp, readFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startStaticServer } from "./static-server.mjs";

const EXPECTED = [
  { id: "save-weekly-report", kind: "png", minKB: 40, what: "growth report card" },
  { id: "save-curriculum-guide", kind: "png", minKB: 40, what: "four-week family plan" },
  { id: "export-backup", kind: "json", minKB: 0.2, what: "records backup" },
];

const downloadDir = await mkdtemp(join(tmpdir(), "mongle-exports-"));
const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
const page = await context.newPage();
const failures = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message.slice(0, 90)));

await page.addInitScript(() => {
  window.localStorage.setItem("mongle-welcome-v1", "done");
  // Seed a little history so the report has real content to draw.
  window.localStorage.setItem(
    "mongle-learner-profile-v2",
    JSON.stringify({
      version: 2,
      nickname: "몽글",
      xp: 300,
      completed: { colors: 1, counting: 1 },
      stickers: ["colors", "counting"],
      totalAttempts: 8,
      totalCorrect: 6,
      totalHints: 1,
      gameStats: { colors: { attempts: 4, correct: 3, hints: 0, recent: [true, true, false, true] } },
    }),
  );
});

await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector("#parent-open")?.click());
await page.waitForTimeout(400);
await page.evaluate(() => {
  const question = document.querySelector("#parent-gate-question")?.textContent || "";
  const numbers = [...question.matchAll(/(\d+)/g)].map((match) => Number(match[1]));
  const answer = numbers.length >= 2 ? numbers[0] + numbers[1] : null;
  const choices = [...document.querySelectorAll("#parent-gate-choices button")];
  (choices.find((button) => Number(button.textContent.trim()) === answer) || choices[0])?.click();
});
await page.waitForTimeout(800);

for (const { id, kind, minKB, what } of EXPECTED) {
  const present = await page.evaluate((buttonId) => Boolean(document.querySelector(`#${buttonId}`)), id);
  if (!present) {
    failures.push(`${what}: the #${id} button is missing`);
    continue;
  }

  const download = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }).catch(() => null),
    page.evaluate((buttonId) => document.querySelector(`#${buttonId}`)?.click(), id),
  ]).then(([event]) => event);

  if (!download) {
    failures.push(`${what}: no file was produced`);
    continue;
  }

  const filePath = join(downloadDir, download.suggestedFilename());
  await download.saveAs(filePath);
  const info = await stat(filePath);
  const bytes = await readFile(filePath);
  const sizeKB = info.size / 1024;

  let valid = sizeKB >= minKB;
  let detail = `${Math.round(sizeKB)}KB`;
  if (kind === "png") {
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    valid = valid && isPng;
    detail += isPng ? " valid PNG" : " NOT a PNG";
  } else {
    try {
      const parsed = JSON.parse(bytes.toString("utf8"));
      const hasRecords = JSON.stringify(parsed).includes("colors");
      valid = valid && hasRecords;
      detail += hasRecords ? " backup contains the records" : " backup is missing the records";
    } catch {
      valid = false;
      detail += " invalid JSON";
    }
  }

  console.log(`${what}: ${download.suggestedFilename()} ${detail}`);
  if (!valid) failures.push(`${what}: produced an unusable file (${detail})`);
}

if (errors.length) failures.push(`runtime errors during export: ${errors[0]}`);

await browser.close();
server.close();
await rm(downloadDir, { recursive: true, force: true });

failures.forEach((message) => console.error(`FAIL ${message}`));
if (failures.length) process.exit(1);
console.log("guardian export checks passed");
