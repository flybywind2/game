/* Accessibility scan with axe-core on the home screen, an open game, and the policy pages. */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { startStaticServer } from "./static-server.mjs";

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

// One game per interaction mode, so a mode-specific widget cannot regress unnoticed.
const modeSamples = {
  spot: "colors",
  trace: "shapes",
  count: "counting",
  connect: "sounds",
  sort: "words",
  memory: "matching",
  order: "sizes",
  pattern: "patterns",
  compare: "more",
  drag: "body",
  quantity: "extra016",
  countCompare: "extra021",
  sequence: "extra015",
  add: "extra090",
  subtract: "extra092",
  draw: "extra089",
};
for (const [mode, key] of Object.entries(modeSamples)) {
  await scan(`game ${mode} (${key})`, async () => {
    await page.evaluate((gameKey) => {
      window.location.hash = `#game/${gameKey}`;
    }, key);
    await page.waitForTimeout(500);
  });
}

for (const path of ["privacy.html", "terms.html", "support.html"]) {
  await scan(path, async () => {
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
  });
}

await browser.close();
server.close();

if (violationsByView.length) {
  console.error(`serious accessibility violations in ${violationsByView.length} view(s)`);
  process.exit(1);
}
console.log("accessibility scan passed (no serious or critical violations)");
