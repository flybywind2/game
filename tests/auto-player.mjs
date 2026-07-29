/* Solves a round the way a child would, using the tap-pick-then-tap-destination
   path that every drag-based activity also supports.

   Each mode exposes the correct pairing through data attributes, so the solver
   answers correctly instead of brute forcing. Modes that need freehand drawing or
   gesture tracing have no scripted solution and are reported as such. */

// After a correct answer the activity disables its controls while the celebration
// plays, so wait for a fresh interactive round before solving again.
export async function waitForRound(page, timeout = 15000) {
  return page
    .waitForFunction(
      () => {
        const stage = document.querySelector("#answer-grid");
        if (!stage) return false;
        return stage.querySelectorAll("button:not([disabled]), canvas").length > 0;
      },
      null,
      { timeout },
    )
    .then(() => true)
    .catch(() => false);
}

// Reads the round the app is actually on, from the progress dots. Used to confirm a
// solved round really advanced instead of trusting the solver's own report.
export async function roundState(page) {
  return page.evaluate(() => {
    const dots = [...document.querySelectorAll("#play-progress .progress-dot")];
    return {
      done: dots.filter((dot) => dot.classList.contains("done")).length,
      current: dots.findIndex((dot) => dot.classList.contains("current")),
      completed: Boolean(document.querySelector("#play-main .completion-card")),
    };
  });
}

// Waits until the app leaves the given round, either by advancing or by finishing.
// completeCurrentRound() advances when the success voice ends, or after a 7s
// fallback timer, so this has to allow more than 7 seconds in a headless run where
// audio never fires "ended".
export async function waitForAdvance(page, fromRound, timeout = 11000) {
  return page
    .waitForFunction(
      (previous) => {
        if (document.querySelector("#play-main .completion-card")) return true;
        const dots = [...document.querySelectorAll("#play-progress .progress-dot")];
        const current = dots.findIndex((dot) => dot.classList.contains("current"));
        const done = dots.filter((dot) => dot.classList.contains("done")).length;
        return current > previous.current || done > previous.done;
      },
      fromRound,
      { timeout },
    )
    .then(() => true)
    .catch(() => false);
}

export const SOLVER = async (page) => {
  return page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const stage = document.querySelector("#answer-grid");
    if (!stage) return { ok: false, reason: "no stage" };
    const mode = stage.dataset.mode || "choice";
    let taps = 0;
    const tap = async (element, wait = 130) => {
      if (!element) return false;
      element.click();
      taps += 1;
      await sleep(wait);
      return true;
    };

    const pickAndDrop = async (sourceSelector, matchAttr, dropAttr) => {
      // Repeatedly pair the first enabled source with its matching destination.
      for (let guard = 0; guard < 24; guard += 1) {
        const source = stage.querySelector(`${sourceSelector}:not([disabled])`);
        if (!source) return true;
        const key = source.getAttribute(matchAttr);
        const target =
          stage.querySelector(`[${dropAttr}="${key}"]:not([disabled])`) ||
          stage.querySelector(`[${dropAttr}]:not([disabled])`);
        if (!target) return false;
        await tap(source);
        await tap(target, 220);
      }
      return false;
    };

    switch (mode) {
      case "choice": {
        // The correct option is the one the app marks; fall back to the first.
        const correct = stage.querySelector('.answer-button[data-index]');
        await tap(correct);
        return { ok: true, mode, taps };
      }
      case "spot": {
        await tap(stage.querySelector('[data-target="true"]:not([disabled])'));
        return { ok: true, mode, taps };
      }
      case "count": {
        // Select exactly the requested number of pictures, then confirm.
        const total = Number(stage.querySelector("strong[data-total]")?.textContent || 0);
        const pieces = [...stage.querySelectorAll(".count-piece:not([disabled])")];
        if (!total || !pieces.length) return { ok: false, mode, taps, reason: "no count target" };
        for (let index = 0; index < total && index < pieces.length; index += 1) {
          await tap(pieces[index], 90);
        }
        const confirm = stage.querySelector(".activity-confirm:not([disabled])");
        if (!confirm) return { ok: false, mode, taps, reason: "confirm never enabled" };
        await tap(confirm, 280);
        return { ok: true, mode, taps };
      }
      case "drag": {
        const done = await pickAndDrop("[data-match]:not([disabled])", "data-match", "data-activity-drop");
        return { ok: done, mode, taps };
      }
      case "sequence": {
        // Tokens carry their position in data-step; slots are numbered the same way.
        const tokens = [...stage.querySelectorAll("[data-step]")].sort(
          (a, b) => Number(a.dataset.step) - Number(b.dataset.step),
        );
        if (!tokens.length) return { ok: false, mode, taps, reason: "no sequence tokens" };
        for (const token of tokens) {
          if (token.disabled) continue;
          const slot = stage.querySelector(
            `[data-activity-drop="${token.dataset.step}"]:not([disabled])`,
          );
          if (!slot) return { ok: false, mode, taps, reason: "no slot for this step" };
          await tap(token);
          await tap(slot, 240);
        }
        return { ok: true, mode, taps };
      }
      case "sort": {
        const done = await pickAndDrop("[data-expected]:not([disabled])", "data-expected", "data-activity-drop");
        return { ok: done, mode, taps };
      }
      case "pattern": {
        // Tokens carry the slot they belong to in data-target-index; "extra" is a decoy.
        for (let guard = 0; guard < 20; guard += 1) {
          const token = [...stage.querySelectorAll("[data-target-index]:not([disabled])")].find(
            (item) => item.dataset.targetIndex !== "extra",
          );
          if (!token) return { ok: true, mode, taps };
          const slot = stage.querySelector(
            `[data-activity-drop="${token.dataset.targetIndex}"]:not([disabled])`,
          );
          if (!slot) return { ok: false, mode, taps, reason: "no matching slot" };
          await tap(token);
          await tap(slot, 240);
        }
        return { ok: false, mode, taps, reason: "pattern did not finish" };
      }
      case "order": {
        // Place ranks in ascending order into the numbered slots.
        const sources = [...stage.querySelectorAll("[data-rank]")].sort(
          (a, b) => Number(a.dataset.rank) - Number(b.dataset.rank),
        );
        for (const source of sources) {
          if (source.disabled) continue;
          await tap(source);
          await tap(stage.querySelector("[data-activity-drop]:not([disabled])"), 220);
        }
        return { ok: true, mode, taps };
      }
      case "connect": {
        // Two shapes: paired columns where both sides are buttons, or a spotlight
        // that reveals one clue at a time and only the choice is clickable.
        for (let guard = 0; guard < 16; guard += 1) {
          const spotlightClue = stage.querySelector(".spotlight-clue");
          if (spotlightClue) {
            const key = spotlightClue.dataset.match;
            const choice =
              stage.querySelector(`.spotlight-choice[data-match="${key}"]:not([disabled])`) ||
              stage.querySelector(".spotlight-choice.is-current-answer:not([disabled])");
            if (!choice) return { ok: true, mode, taps };
            await tap(choice, 340);
            continue;
          }
          const source = stage.querySelector(".connect-source:not([disabled])");
          if (!source) return { ok: true, mode, taps };
          await tap(source, 200);
          const target = stage.querySelector(
            `.connect-target[data-match="${source.dataset.match}"]:not([disabled])`,
          );
          if (!target) return { ok: false, mode, taps, reason: "no matching target" };
          await tap(target, 300);
        }
        return { ok: false, mode, taps, reason: "connect did not finish" };
      }
      case "quantity": {
        // Count every group, then pick the group whose total matches the prompt.
        const groups = [...stage.querySelectorAll(".quantity-group")];
        for (const group of groups) {
          for (const piece of [...group.querySelectorAll(".quantity-piece:not([disabled])")]) {
            await tap(piece, 55);
          }
        }
        await sleep(240);
        const promptText = document.querySelector("#play-prompt")?.textContent || "";
        const WORDS = { 한: 1, 하나: 1, 두: 2, 둘: 2, 세: 3, 셋: 3, 네: 4, 넷: 4, 다섯: 5, 여섯: 6 };
        const digit = promptText.match(/(\d+)\s*(개|마리|장|송이|권)/);
        let wanted = digit ? Number(digit[1]) : null;
        if (wanted === null) {
          for (const [word, value] of Object.entries(WORDS)) {
            if (new RegExp(`${word}\\s*(개|마리|장|송이|권)`).test(promptText)) {
              wanted = value;
              break;
            }
          }
        }
        // Some rounds ask for a numeral card instead of a picture group.
        const numeral = promptText.match(/숫자\s*(\d+)/);
        if (numeral) {
          const value = numeral[1];
          const card = [...stage.querySelectorAll("button:not([disabled])")].find((button) => {
            const label = button.getAttribute("aria-label") || button.textContent || "";
            return label.includes(`숫자 ${value}`) || label.trim() === value;
          });
          if (!card) return { ok: false, mode, taps, reason: `no numeral card for ${value}` };
          await tap(card, 280);
          return { ok: true, mode, taps };
        }

        // Otherwise each group carries its own total in data-count.
        const target = groups.find((group) => Number(group.dataset.count) === wanted);
        const select =
          target?.querySelector(".quantity-select:not([disabled])") ||
          stage.querySelector(".quantity-select:not([disabled])");
        if (!select) return { ok: false, mode, taps, reason: "no group selector became enabled" };
        await tap(select, 280);
        return { ok: true, mode, taps };
      }
      case "compare":
      case "countCompare": {
        // Count every picture in every group, which unlocks the answer choices.
        for (const piece of [...stage.querySelectorAll(".compare-piece, .quantity-piece")]) {
          if (!piece.disabled) await tap(piece, 55);
        }
        await sleep(240);
        const options = [...stage.querySelectorAll("[data-option-index]:not([disabled]), .quantity-select:not([disabled])")];
        if (!options.length) return { ok: false, mode, taps, reason: "no option became enabled" };
        // Counted totals appear per group; the prompt asks for "더 많은" (the larger)
        // or "더 적은" (the smaller) group's count.
        const counts = [...stage.querySelectorAll(".compare-count")].map((node) => Number(node.textContent) || 0);
        const promptText = document.querySelector("#play-prompt")?.textContent || "";
        let wanted = null;
        if (counts.length) {
          wanted = promptText.includes("적은") ? Math.min(...counts) : Math.max(...counts);
        }
        const match = options.find((option) => {
          const label = option.getAttribute("aria-label") || option.textContent || "";
          return Number(label.trim()) === wanted;
        });
        if (wanted !== null && !match) {
          return { ok: false, mode, taps, reason: `no option equals ${wanted} of [${counts}]` };
        }
        await tap(match || options[0], 280);
        return { ok: true, mode, taps };
      }
      case "memory": {
        const cards = [...stage.querySelectorAll("[data-pair]")];
        const start = stage.querySelector(".activity-confirm, .memory-start");
        if (start) await tap(start, 400);
        const groups = new Map();
        for (const card of cards) {
          const key = card.dataset.pair;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(card);
        }
        for (const pair of groups.values()) {
          if (pair.length < 2) continue;
          await tap(pair[0], 260);
          await tap(pair[1], 420);
        }
        return { ok: true, mode, taps };
      }
      default:
        return { ok: false, mode, taps, reason: "no scripted solution" };
    }
  });
};
