/* Runs every release gate in order: data, release surface, then real browser checks. */
import { spawn } from "node:child_process";

const steps = [
  ["데이터 검증", "tests/check-data.mjs"],
  ["출시 점검", "tests/check-release.mjs"],
  ["브라우저 놀이 점검", "tests/play-all.mjs"],
  ["접근성 점검", "tests/check-a11y.mjs"],
];

function run(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], { stdio: "inherit" });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

let failed = 0;
for (const [label, script] of steps) {
  console.log(`\n=== ${label} (${script}) ===`);
  const code = await run(script);
  if (code !== 0) {
    failed += 1;
    console.error(`${label} 실패 (exit ${code})`);
  }
}

console.log(failed ? `\n${failed}개 검사 실패` : "\n모든 검사 통과");
process.exit(failed ? 1 : 0);
