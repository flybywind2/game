/* Guards the release surface: assets resolve, PWA metadata is valid, policy pages exist. */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const failures = [];
const fail = (message) => failures.push(message);

const requiredFiles = [
  "index.html",
  "privacy.html",
  "terms.html",
  "support.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "LICENSE",
  "manifest.webmanifest",
  "sw.js",
  ".nojekyll",
];
for (const file of requiredFiles) {
  if (!existsSync(file)) fail(`missing required release file: ${file}`);
}

// Every relative asset reference in shipped source must resolve on disk.
const sourceFiles = [
  "index.html",
  "privacy.html",
  "terms.html",
  "support.html",
  "404.html",
  "app.js",
  "extra-games.js",
  "interaction-engine.js",
  "tts-manifest.js",
  "sw.js",
  "manifest.webmanifest",
  "styles.css",
  "premium.css",
  "interactions.css",
  "catalog.css",
  "enhancements.css",
  "page.css",
];

const referencePattern = /(?:\.\/|\/game\/)[A-Za-z0-9_\-./]+\.(?:png|webp|mp3|css|js|webmanifest|html|json|svg|xml|txt)/g;
const referenced = new Set();
for (const file of sourceFiles) {
  if (!existsSync(file)) continue;
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(referencePattern)) referenced.add(match[0]);
}
const missingAssets = [...referenced].filter((reference) => {
  const relative = reference.replace(/^\/game\//, "").replace(/^\.\//, "");
  return !existsSync(relative);
});
if (missingAssets.length) fail(`unresolved asset references: ${missingAssets.slice(0, 8).join(", ")}`);

// Web app manifest must stay installable.
const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
for (const field of ["name", "short_name", "start_url", "scope", "display", "icons"]) {
  if (!manifest[field]) fail(`manifest is missing ${field}`);
}
const iconSizes = new Set((manifest.icons || []).map((icon) => icon.sizes));
for (const size of ["192x192", "512x512"]) {
  if (!iconSizes.has(size)) fail(`manifest is missing a ${size} icon`);
}
for (const icon of manifest.icons || []) {
  if (!existsSync(icon.src.replace("./", ""))) fail(`manifest icon not found: ${icon.src}`);
}

// Service worker precache entries must exist, matching the cache-busting query used in HTML.
const sw = await readFile("sw.js", "utf8");
const shellStart = sw.indexOf("const APP_SHELL = [");
const shellEnd = sw.indexOf("];", shellStart);
const shellEntries = [...sw.slice(shellStart, shellEnd).matchAll(/"(\.\/[^"]*)"/g)].map((match) => match[1]);
if (shellEntries.length < 10) fail("service worker app shell looks unexpectedly small");
for (const entry of shellEntries) {
  const relative = entry.replace("./", "").split("?")[0];
  if (!relative) continue;
  if (!existsSync(relative)) fail(`service worker precaches a missing file: ${entry}`);
}

const indexHtml = await readFile("index.html", "utf8");

// Precached files without a ?v= query are served from the old cache until the
// cache name changes, so their content is pinned to CACHE_VERSION. Compare a
// line-ending-normalised fingerprint against tests/cache-lock.json.
const cacheVersion = sw.match(/CACHE_VERSION\s*=\s*"([^"]+)"/)?.[1] || "";
if (!cacheVersion) fail("service worker has no CACHE_VERSION");
const { shellFingerprint } = await import("./shell-fingerprint.mjs");
const { digest: shellDigest, fileCount: shellFileCount } = await shellFingerprint(sw);
const lockPath = "tests/cache-lock.json";
let lock = null;
try {
  lock = JSON.parse(await readFile(lockPath, "utf8"));
} catch {
  lock = null;
}
if (!lock) {
  fail(`${lockPath} is missing; run \`npm run lock:cache\``);
} else if (lock.digest !== shellDigest && lock.cacheVersion === cacheVersion) {
  fail(
    `precached assets changed but CACHE_VERSION is still ${cacheVersion}; ` +
      "bump it and run `npm run lock:cache` so installed users get the new files",
  );
} else if (lock.digest !== shellDigest) {
  fail(`${lockPath} is stale for ${cacheVersion}; run \`npm run lock:cache\``);
}

// A ?v= asset loaded by index.html must be precached at the same version, or an
// installed user keeps the old file while the page asks for the new one.
const versionedInIndex = [...indexHtml.matchAll(/"?\.\/([A-Za-z0-9_\-.]+\.(?:css|js))\?v=(\d+)"?/g)]
  .map((match) => `./${match[1]}?v=${match[2]}`);
for (const asset of versionedInIndex) {
  if (!shellEntries.includes(asset)) {
    fail(`index.html loads ${asset} but the service worker precaches a different version`);
  }
}

// Release metadata that affects discoverability and trust.
const requiredMeta = [
  ['rel="canonical"', "canonical link"],
  ['property="og:title"', "Open Graph title"],
  ['property="og:image"', "Open Graph image"],
  ['name="twitter:card"', "Twitter card"],
  ['name="description"', "meta description"],
  ["./privacy.html", "privacy policy link"],
  ["./terms.html", "terms link"],
];
for (const [needle, label] of requiredMeta) {
  if (!indexHtml.includes(needle)) fail(`index.html is missing ${label}`);
}

if (!indexHtml.includes('lang="ko"')) fail("index.html must declare lang=\"ko\"");

const robots = await readFile("robots.txt", "utf8");
if (!robots.includes("Sitemap:")) fail("robots.txt must reference the sitemap");

const sitemap = await readFile("sitemap.xml", "utf8");
for (const page of ["/game/", "privacy.html", "terms.html", "support.html"]) {
  if (!sitemap.includes(page)) fail(`sitemap.xml is missing ${page}`);
}

console.log(`release: ${referenced.size} asset references, ${shellEntries.length} precached files`);
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("release checks passed");
