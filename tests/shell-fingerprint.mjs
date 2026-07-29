/* Fingerprints the service worker's unversioned precached files.

   Text files are normalised to LF first. Git converts line endings per platform,
   so hashing raw bytes would make the lock disagree between a Windows checkout and
   the Linux CI runner. Binary assets are hashed as-is. */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { extname } from "node:path";

const TEXT_EXTENSIONS = new Set([".html", ".css", ".js", ".mjs", ".json", ".webmanifest", ".txt", ".xml"]);

export function unversionedShellEntries(swSource) {
  const start = swSource.indexOf("const APP_SHELL = [");
  const end = swSource.indexOf("];", start);
  if (start === -1 || end === -1) return [];
  return [...swSource.slice(start, end).matchAll(/"(\.\/[^"]*)"/g)]
    .map((match) => match[1])
    .filter((entry) => !entry.includes("?v=") && entry !== "./")
    .map((entry) => entry.replace("./", ""))
    .filter((relative) => existsSync(relative))
    .sort();
}

export async function shellFingerprint(swSource) {
  const files = unversionedShellEntries(swSource);
  const hash = createHash("sha256");
  for (const relative of files) {
    hash.update(relative);
    const raw = await readFile(relative);
    if (TEXT_EXTENSIONS.has(extname(relative).toLowerCase())) {
      hash.update(raw.toString("utf8").replace(/\r\n/g, "\n"));
    } else {
      hash.update(raw);
    }
  }
  return { digest: hash.digest("hex").slice(0, 16), fileCount: files.length };
}
