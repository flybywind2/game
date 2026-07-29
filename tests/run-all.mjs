/* Runs every release gate in order: data, release surface, then real browser checks. */
import { spawn } from "node:child_process";

const steps = [
  ["데이터 검증", "tests/check-data.mjs"],
  ["핵심 게임 검증", "tests/check-core-games.mjs"],
  ["출시 점검", "tests/check-release.mjs"],
  ["브라우저 놀이 점검", "tests/play-all.mjs"],
  ["실제 완주 점검", "tests/check-playthrough.mjs"],
  ["F1 음성 점검", "tests/check-voice.mjs"],
  ["터치 영역 점검", "tests/check-touch.mjs"],
  ["키보드 조작 점검", "tests/check-keyboard.mjs"],
  ["접근성 점검", "tests/check-a11y.mjs"],
  ["오프라인 점검", "tests/check-offline.mjs"],
  ["첫 로딩 용량 점검", "tests/check-perf.mjs"],
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
