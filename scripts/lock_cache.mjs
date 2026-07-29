/* Records a fingerprint of the service worker's unversioned precached files.

   Files precached without a ?v= query are only refreshed when CACHE_VERSION
   changes, so editing one without bumping the version leaves installed users on
   the old copy. tests/check-release.mjs compares against this lock and fails when
   those files change while CACHE_VERSION stays the same. */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

const sw = await readFile("sw.js", "utf8");
const cacheVersion = sw.match(/CACHE_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (!cacheVersion) throw new Error("sw.js has no CACHE_VERSION");

const shellStart = sw.indexOf("const APP_SHELL = [");
const shellEnd = sw.indexOf("];", shellStart);
const entries = [...sw.slice(shellStart, shellEnd).matchAll(/"(\.\/[^"]*)"/g)].map((m) => m[1]);
const unversioned = entries
  .filter((entry) => !entry.includes("?v=") && entry !== "./")
  .map((entry) => entry.replace("./", ""))
  .filter((relative) => existsSync(relative))
  .sort();

const hash = createHash("sha256");
for (const relative of unversioned) {
  hash.update(relative);
  hash.update(await readFile(relative));
}
const digest = hash.digest("hex").slice(0, 16);

await writeFile(
  "tests/cache-lock.json",
  `${JSON.stringify({ cacheVersion, fileCount: unversioned.length, digest }, null, 2)}\n`,
  "utf8",
);
console.log(`locked ${unversioned.length} precached files for ${cacheVersion} (${digest})`);
