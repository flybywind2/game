/* Validates game data integrity so a broken round can never ship. */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const failures = [];
const fail = (message) => failures.push(message);

const chunkNames = ["extra-games-a.json", "extra-games-b.json", "extra-games-c.json"];
const chunks = [];
for (const name of chunkNames) {
  chunks.push(JSON.parse(await readFile(`data/${name}`, "utf8")));
}
const games = Object.assign({}, ...chunks);
const keys = Object.keys(games);

const expected = Array.from({ length: 93 }, (_, i) => `extra${String(i + 1).padStart(3, "0")}`);
if (JSON.stringify(keys) !== JSON.stringify(expected)) {
  fail(`extra game keys must be continuous extra001-extra093 (got ${keys.length})`);
}

const categories = new Set(["look", "number", "word", "heart"]);
let roundTotal = 0;

for (const [key, game] of Object.entries(games)) {
  for (const field of ["title", "icon", "category", "cardColor", "description", "duration", "skill", "insight"]) {
    if (typeof game[field] !== "string" || !game[field].trim()) fail(`${key}: missing ${field}`);
  }
  if (!categories.has(game.category)) fail(`${key}: unknown category ${game.category}`);
  if (!Array.isArray(game.preview) || game.preview.length < 1) fail(`${key}: preview must be a non-empty array`);
  if (!game.offline?.title || !game.offline?.text) fail(`${key}: offline tip is incomplete`);
  if (!Array.isArray(game.rounds) || game.rounds.length !== 3) {
    fail(`${key}: expected exactly 3 rounds`);
    continue;
  }

  game.rounds.forEach((round, index) => {
    const label = `${key}/round${index + 1}`;
    roundTotal += 1;
    for (const field of ["helper", "prompt", "speech", "success"]) {
      if (typeof round[field] !== "string" || !round[field].trim()) fail(`${label}: missing ${field}`);
    }
    if (!Array.isArray(round.options) || round.options.length !== 3) {
      fail(`${label}: expected exactly 3 options`);
      return;
    }
    const correct = round.options.filter((option) => option.correct === true);
    if (correct.length !== 1) fail(`${label}: expected exactly 1 correct option, found ${correct.length}`);
    const labels = new Set();
    round.options.forEach((option, optionIndex) => {
      if (!option.label?.trim()) fail(`${label}/option${optionIndex + 1}: missing label`);
      if (!option.visual?.trim()) fail(`${label}/option${optionIndex + 1}: missing visual`);
      if (labels.has(option.label)) fail(`${label}: duplicate option label "${option.label}"`);
      labels.add(option.label);
    });
  });
}

// The browser bundle must match the JSON source.
const bundle = await readFile("extra-games.js", "utf8");
const openIndex = bundle.indexOf("Object.freeze(");
const closeIndex = bundle.indexOf("\n);", openIndex);
if (openIndex === -1 || closeIndex === -1) {
  fail("extra-games.js does not have the expected generated shape");
} else {
  const bundleJson = bundle.slice(openIndex + "Object.freeze(".length, closeIndex).trim();
  try {
    const parsed = JSON.parse(bundleJson);
    if (JSON.stringify(parsed) !== JSON.stringify(games)) {
      fail("extra-games.js is stale: run `npm run build` after editing data/*.json");
    }
  } catch (error) {
    fail(`extra-games.js could not be parsed: ${error.message}`);
  }
}

// Every voice line referenced by the manifest must exist on disk.
const manifest = await readFile("tts-manifest.js", "utf8");
const voicePaths = [...manifest.matchAll(/"(\.\/audio\/tts\/[0-9a-f]+\.mp3)"/g)].map((match) => match[1]);
const uniqueVoicePaths = [...new Set(voicePaths)];
if (!uniqueVoicePaths.length) fail("tts-manifest.js contains no voice entries");
const missingVoices = uniqueVoicePaths.filter((path) => !existsSync(path.replace("./", "")));
if (missingVoices.length) fail(`missing voice files: ${missingVoices.slice(0, 5).join(", ")}`);

// Runtime activity prompts are spoken too, so each one needs a manifest entry.
// Without this, a reworded prompt silently degrades to the device voice.
let activityPhrases = [];
try {
  activityPhrases = JSON.parse(await readFile("data/activity-phrases.json", "utf8"));
} catch {
  fail("data/activity-phrases.json is missing; run scripts/collect_activity_phrases.mjs");
}
const unvoicedActivity = activityPhrases.filter((phrase) => !manifest.includes(JSON.stringify(phrase).slice(1, -1)));
if (unvoicedActivity.length) {
  fail(
    `${unvoicedActivity.length} activity prompt(s) have no Supertonic entry, e.g. "${unvoicedActivity[0]}"`,
  );
}

console.log(`data: ${keys.length} extra games, ${roundTotal} rounds, ${uniqueVoicePaths.length} voice files`);
console.log(`activity prompts with voice files: ${activityPhrases.length - unvoicedActivity.length}/${activityPhrases.length}`);
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("data checks passed");
