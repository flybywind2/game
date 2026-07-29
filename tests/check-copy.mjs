/* Scans the Korean text a family actually sees for typos and formatting slips.

   A stray character in a label is invisible to code review but obvious to a parent,
   and this project ships one Korean string per prompt, label and toast. This walks
   the rendered text of the home screen, every game, and the guardian screens, and
   flags patterns that are almost always mistakes. */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { startStaticServer } from "./static-server.mjs";

// Known-bad fragments. Each entry explains why it is wrong so a future match is
// actionable rather than mysterious.
const BANNED = [
  // A stray leaf character once sat in front of the play-time chip ("잎 10분 놀이 약속").
  // Flag a Hangul syllable immediately before the minute count, which is never
  // correct for this label. The count may be a literal or a template expression.
  { pattern: /[가-힣]\s+(?:\d+|\$\{[^}]+\})\s*분\s*놀이\s*약속/, why: "stray word before the play-time label" },
  { pattern: /undefined|NaN|null/, why: "a value failed to render" },
  { pattern: /\[object Object\]/, why: "an object was concatenated into text" },
  { pattern: /\s{3,}/, why: "runaway whitespace in a label" },
  { pattern: /[가-힣]\?\?/, why: "doubled question mark" },
  { pattern: /\.\.\.\./, why: "more than an ellipsis" },
];

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await page.addInitScript(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(700);

const findings = [];

function inspect(where, text) {
  if (!text) return;
  const flat = text.replace(/\s+/g, " ").trim();
  for (const { pattern, why } of BANNED) {
    // Whitespace runs only matter inside a single label, not across a whole screen.
    if (pattern.source.includes("s{3,}")) continue;
    const match = flat.match(pattern);
    if (match) findings.push(`${where}: ${why} -> "${match[0]}" in "${flat.slice(0, 70)}"`);
  }
}

// Home screen and guardian screens.
inspect("home", await page.evaluate(() => document.body.innerText));

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
inspect("guardian", await page.evaluate(() => document.querySelector(".parent-dialog, dialog[open]")?.innerText || ""));
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// Every game's first round.
const keys = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll("[data-game]")].map((node) => node.dataset.game))],
);
for (const key of keys) {
  await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(170);
  const text = await page.evaluate(() => document.querySelector("#game-shell")?.innerText || "");
  inspect(`game ${key}`, text);
}

// Static source strings, so a label that only appears in a rare state is covered too.
for (const file of ["app.js", "interaction-engine.js", "index.html"]) {
  const source = await readFile(file, "utf8");
  for (const { pattern, why } of BANNED) {
    if (pattern.source.includes("s{3,}") || pattern.source.includes("object Object")) continue;
    if (pattern.source.includes("undefined")) continue;
    const match = source.match(pattern);
    if (match) findings.push(`${file}: ${why} -> "${match[0]}"`);
  }
}

console.log(`copy scanned: home, guardian screens and ${keys.length} games`);
console.log(`issues found: ${findings.length}`);
for (const finding of findings.slice(0, 15)) console.error(`FAIL ${finding}`);

await browser.close();
server.close();
process.exit(findings.length ? 1 : 0);
