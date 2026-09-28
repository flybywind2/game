/* Accessibility scan with axe-core on the home screen, an open game, and the policy pages. */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { startStaticServer } from "./static-server.mjs";
import { fastAudioInitScript, playToRound } from "./auto-player.mjs";

const require = createRequire(import.meta.url);
let axePath;
try {
  axePath = require.resolve("axe-core/axe.min.js");
} catch {
  console.log("axe-core is not installed; skipping the accessibility scan.");
  process.exit(0);
}

const { server, base } = await startStaticServer(process.cwd());
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await page.addInitScript(() => {
  window.localStorage.setItem("mongle-welcome-v1", "done");
});
await page.addInitScript(fastAudioInitScript);

const violationsByView = [];

async function scan(label, prepare) {
  await prepare();
  await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(async () =>
    window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    }),
  );
  const serious = result.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  console.log(`${label}: ${result.violations.length} violations (${serious.length} serious/critical)`);
  for (const violation of serious) {
    console.log(`  - ${violation.id} (${violation.impact}) x${violation.nodes.length}: ${violation.help}`);
    console.log(`    ${violation.nodes[0]?.target?.join(" ")}`);
  }
  if (serious.length) violationsByView.push({ label, serious });
}

await scan("home", async () => {
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
});

// One game per round format, so a format-specific widget cannot regress unnoticed.
// Each game now plays three different ways, so a sample names the round to scan.
const modeSamples = {
  spot: ["colors", 0],
  feed: ["colors", 1],
  pop: ["colors", 2],
  numeral: ["counting", 0],
  count: ["counting", 2],
  peek: ["sounds", 1],
  connect: ["sounds", 2],
  sort: ["words", 2],
  shadow: ["matching", 0],
  memory: ["matching", 2],
  order: ["sizes", 2],
  pattern: ["patterns", 2],
  compare: ["more", 2],
  drag: ["body", 2],
  trace: ["shapes", 2],
  ox: ["extra061", 1],
  quantity: ["extra018", 0],
  countCompare: ["extra021", 2],
  sequence: ["extra015", 2],
  add: ["extra090", 2],
  subtract: ["extra092", 2],
  draw: ["extra089", 0],
};
for (const [mode, [key, round]] of Object.entries(modeSamples)) {
  await scan(`game ${mode} (${key} round ${round + 1})`, async () => {
    await page.goto(`${base}#game/${key}`, { waitUntil: "domcontentloaded" });
    const reached = await playToRound(page, round);
    await page.waitForTimeout(500);
    const shown = await page.evaluate(() => document.querySelector("#answer-grid")?.dataset.mode);
    if (!reached || shown !== mode) {
      violationsByView.push({ label: `${key} round ${round + 1}`, serious: [{ id: `expected ${mode}, saw ${shown}` }] });
    }
  });
}

for (const path of ["privacy.html", "terms.html", "support.html"]) {
  await scan(path, async () => {
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
  });
}

// Screens that only appear after interaction were previously never scanned.
await scan("story intro", async () => {
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector("#story-continue")?.click());
  await page.waitForTimeout(900);
});

await scan("first-run welcome", async () => {
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1000);
});

await scan("welcome step 2", async () => {
  await page.evaluate(() => document.querySelector("#welcome-next")?.click());
  await page.waitForTimeout(500);
});

await scan("parent gate", async () => {
  await page.evaluate(() => window.localStorage.setItem("mongle-welcome-v1", "done"));
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector("#parent-open")?.click());
  await page.waitForTimeout(500);
});

await scan("parent dashboard", async () => {
  // Answer the gate question correctly to reach the guardian screen.
  await page.evaluate(() => {
    const question = document.querySelector("#parent-gate-question")?.textContent || "";
    const numbers = [...question.matchAll(/(\d+)/g)].map((match) => Number(match[1]));
    const answer = numbers.length >= 2 ? numbers[0] + numbers[1] : null;
    const choices = [...document.querySelectorAll("#parent-gate-choices button")];
    const target = choices.find((button) => Number(button.textContent.trim()) === answer) || choices[0];
    target?.click();
  });
  await page.waitForTimeout(800);
});

await scan("game completion", async () => {
  await page.evaluate(() => document.querySelector("#parent-close")?.click());
  await page.goto(`${base}#game/colors`, { waitUntil: "domcontentloaded" });
  await playToRound(page, 3);
  await page.waitForSelector("#play-main .completion-card", { timeout: 9000 }).catch(() => {});
});

await browser.close();
server.close();

if (violationsByView.length) {
  console.error(`serious accessibility violations in ${violationsByView.length} view(s)`);
  process.exit(1);
}
console.log("accessibility scan passed (no serious or critical violations)");
