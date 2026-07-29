/* Records a fingerprint of the service worker's unversioned precached files.

   Files precached without a ?v= query are only refreshed when CACHE_VERSION
   changes, so editing one without bumping the version leaves installed users on
   the old copy. tests/check-release.mjs compares against this lock and fails when
   those files change while CACHE_VERSION stays the same. */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { shellFingerprint } from "../tests/shell-fingerprint.mjs";

const sw = await readFile("sw.js", "utf8");
const cacheVersion = sw.match(/CACHE_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (!cacheVersion) throw new Error("sw.js has no CACHE_VERSION");

const { digest, fileCount } = await shellFingerprint(sw);

await writeFile(
  "tests/cache-lock.json",
  `${JSON.stringify({ cacheVersion, fileCount, digest }, null, 2)}\n`,
  "utf8",
);
console.log(`locked ${fileCount} precached files for ${cacheVersion} (${digest})`);
