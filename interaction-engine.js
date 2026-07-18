/* Mongle v5: varied, touch-friendly activities for all 100 games. */
(() => {
  "use strict";

  const MODE_META = Object.freeze({
    choice: {
      label: "골라 보기",
      instruction: "알맞은 그림을 골라요.",
    },
    count: {
      label: "개수 만들기",
      instruction: "필요한 수만큼 그림을 톡톡 누르고 다 셌어요를 눌러요.",
    },
    compare: {
      label: "두 무리 비교",
      instruction: "양쪽 그림을 하나씩 세고 알맞은 관계를 골라요.",
    },
    drag: {
      label: "그림 짝 놓기",
      instruction: "그림을 똑같은 그림 자리와 모두 짝지어 놓아요.",
    },
    sort: {
      label: "두 바구니 분류",
      instruction: "그림 세 개를 알맞은 바구니에 모두 나눠요.",
    },
    sequence: {
      label: "순서 만들기",
      instruction: "처음부터 마지막까지 차례대로 놓아요.",
    },
    memory: {
      label: "짝 기억하기",
      instruction: "카드를 뒤집어 같은 그림 짝꿍을 찾아요.",
    },
    pattern: {
      label: "규칙 완성",
      instruction: "맞는 그림을 고른 뒤 빈칸에 쏙 넣어요.",
    },
    spot: {
      label: "여러 개 찾기",
      instruction: "같은 그림을 세 개 모두 톡톡 눌러요.",
    },
    trace: {
      label: "선 따라가기",
      instruction: "맞는 그림을 찾고 반짝이는 점을 차례로 눌러요.",
    },
    order: {
      label: "크기 차례",
      instruction: "작은 것부터 큰 것까지 차례로 놓아요.",
    },
  });

  const MODE_KEYS = Object.freeze({
    count: new Set([
      "counting",
      "more",
      "extra016",
      "extra017",
      "extra018",
      "extra019",
      "extra020",
      "extra021",
      "extra022",
    ]),
    drag: new Set([
      "body",
      "extra004",
      "extra008",
      "extra027",
      "extra028",
      "extra031",
      "extra032",
      "extra034",
      "extra035",
      "extra038",
      "extra040",
      "extra041",
      "extra043",
      "extra048",
      "extra049",
      "extra051",
      "extra052",
      "extra053",
      "extra067",
      "extra085",
    ]),
    sort: new Set([
      "words",
      "routines",
      "extra029",
      "extra036",
      "extra046",
      "extra057",
      "extra059",
      "extra060",
      "extra063",
      "extra065",
      "extra066",
      "extra070",
      "extra071",
      "extra073",
      "extra081",
      "extra083",
      "extra086",
    ]),
    sequence: new Set([
      "extra015",
      "extra030",
      "extra047",
      "extra062",
      "extra064",
      "extra068",
      "extra069",
      "extra072",
      "extra074",
      "extra082",
      "extra087",
      "extra088",
    ]),
    memory: new Set([
      "sounds",
      "emotions",
      "matching",
      "extra009",
      "extra010",
      "extra011",
      "extra033",
      "extra039",
      "extra042",
      "extra044",
      "extra045",
      "extra054",
      "extra055",
      "extra056",
      "extra058",
    ]),
    pattern: new Set(["patterns", "extra024", "extra025", "extra026"]),
    spot: new Set([
      "colors",
      "extra001",
      "extra002",
      "extra003",
      "extra037",
      "extra061",
      "extra075",
      "extra076",
      "extra077",
      "extra078",
      "extra079",
      "extra080",
      "extra084",
    ]),
    trace: new Set(["shapes", "extra005", "extra006", "extra007", "extra050"]),
    order: new Set(["sizes", "extra012", "extra013", "extra014"]),
    compare: new Set(["extra023"]),
  });

  let activeController = null;

  function metaFor(mode) {
    return MODE_META[mode] || MODE_META.choice;
  }

  function resolveMode(gameKey) {
    for (const [mode, keys] of Object.entries(MODE_KEYS)) {
      if (keys.has(gameKey)) return mode;
    }
    return "choice";
  }

  function allAssignments() {
    const result = {};
    for (const [mode, keys] of Object.entries(MODE_KEYS)) {
      keys.forEach((key) => {
        result[key] = mode;
      });
    }
    return result;
  }

  function createController() {
    const abortController = new AbortController();
    const timers = new Set();
    const cleanupCallbacks = new Set();
    let destroyed = false;

    return {
      get signal() {
        return abortController.signal;
      },
      on(element, type, listener, options = {}) {
        element.addEventListener(type, listener, {
          ...options,
          signal: abortController.signal,
        });
      },
      later(callback, delay) {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          if (!destroyed) callback();
        }, delay);
        timers.add(timer);
        return timer;
      },
      addCleanup(callback) {
        cleanupCallbacks.add(callback);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        abortController.abort();
        timers.forEach((timer) => window.clearTimeout(timer));
        timers.clear();
        cleanupCallbacks.forEach((callback) => callback());
        cleanupCallbacks.clear();
      },
    };
  }

  function cleanVisual(value) {
    return value === undefined || value === null || value === "" ? "★" : String(value);
  }

  function createVisual(option, className = "activity-visual") {
    const visual = document.createElement("span");
    visual.className = className;
    visual.setAttribute("aria-hidden", "true");

    if (option?.type === "shape") {
      const shape = document.createElement("span");
      shape.className = "play-shape play-" + option.visual;
      visual.appendChild(shape);
    } else {
      visual.textContent = cleanVisual(option?.visual ?? option?.label);
    }
    return visual;
  }

  function optionName(option) {
    return String(option?.label || option?.subtitle || option?.visual || "그림");
  }

  function createToken(option, className = "activity-token") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", option.subtitle ? optionName(option) + ", " + option.subtitle : optionName(option));
    button.appendChild(createVisual(option));

    const label = document.createElement("span");
    label.className = "activity-token-label";
    label.textContent = optionName(option);
    button.appendChild(label);
    return button;
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(items, seedText) {
    const result = [...items];
    const random = seededRandom(hashSeed(seedText));
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function correctOption(round) {
    return round.options.find((option) => option.correct) || round.options[0];
  }

  function pulse(elements, className = "is-hint") {
    const list = !elements
      ? []
      : elements instanceof Element
        ? [elements]
        : Array.isArray(elements)
          ? elements
          : Array.from(elements);
    list.filter(Boolean).forEach((element) => {
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      window.setTimeout(() => element.classList.remove(className), 1100);
    });
  }

  function createCounter(label, current = 0, total = 0) {
    const counter = document.createElement("p");
    counter.className = "activity-counter";
    counter.setAttribute("aria-live", "polite");
    counter.innerHTML =
      "<span>" +
      label +
      "</span><strong data-current>" +
      current +
      "</strong><span aria-hidden=\"true\"> / </span><strong data-total>" +
      total +
      "</strong>";
    return counter;
  }

  function setCounter(counter, current, total) {
    counter.querySelector("[data-current]").textContent = String(current);
    counter.querySelector("[data-total]").textContent = String(total);
    counter.setAttribute("aria-label", total + "개 중 " + current + "개 완료");
  }

  function createMover(controller, button, select, drop) {
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let moved = false;
    let ghost = null;

    const removeGhost = () => {
      ghost?.remove();
      ghost = null;
      document.body.classList.remove("activity-is-dragging");
    };
    controller.addCleanup(removeGhost);

    controller.on(button, "click", (event) => {
      if (button.dataset.suppressClick === "true") {
        button.dataset.suppressClick = "false";
        event.preventDefault();
        return;
      }
      if (!button.disabled) select(button);
    });

    controller.on(button, "pointerdown", (event) => {
      if (button.disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      moved = false;
      button.setPointerCapture?.(pointerId);
    });

    controller.on(button, "pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
      if (!moved && distance < 9) return;
      if (!moved) {
        moved = true;
        ghost = button.cloneNode(true);
        ghost.className = "activity-drag-ghost";
        ghost.setAttribute("aria-hidden", "true");
        document.body.appendChild(ghost);
        button.classList.add("is-dragging");
        document.body.classList.add("activity-is-dragging");
      }
      ghost.style.left = event.clientX + "px";
      ghost.style.top = event.clientY + "px";
    });

    controller.on(button, "pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      button.releasePointerCapture?.(event.pointerId);
      if (!moved) return;
      button.dataset.suppressClick = "true";
      button.classList.remove("is-dragging");
      removeGhost();
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-activity-drop]");
      if (target) drop(button, target);
    });

    controller.on(button, "pointercancel", () => {
      pointerId = null;
      button.classList.remove("is-dragging");
      removeGhost();
    });
  }

  function setupPickAndDrop(controller, sources, targets, onDrop, announce) {
    let picked = null;

    const setPicked = (button) => {
      if (picked === button) {
        button.classList.remove("is-picked");
        button.setAttribute("aria-pressed", "false");
        picked = null;
        return;
      }
      sources.forEach((source) => {
        source.classList.remove("is-picked");
        source.setAttribute("aria-pressed", "false");
      });
      picked = button;
      picked.classList.add("is-picked");
      picked.setAttribute("aria-pressed", "true");
      announce(optionName({ label: picked.dataset.label }) + " 선택. 놓을 곳을 눌러요.");
    };

    const clearPicked = () => {
      if (!picked) return;
      picked.classList.remove("is-picked");
      picked.setAttribute("aria-pressed", "false");
      picked = null;
    };

    const performDrop = (source, target) => {
      if (!source || source.disabled) return;
      const accepted = onDrop(source, target);
      if (accepted !== false) clearPicked();
    };

    sources.forEach((source) => {
      source.setAttribute("aria-pressed", "false");
      createMover(controller, source, setPicked, performDrop);
    });

    targets.forEach((target) => {
      controller.on(target, "click", () => {
        if (!picked) {
          announce("먼저 옮길 그림을 골라요.");
          pulse(target, "needs-item");
          return;
        }
        performDrop(picked, target);
      });
    });

    return {
      clearPicked,
      get picked() {
        return picked;
      },
    };
  }

  function renderSpot(context) {
    const { controller, stage, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const correct = correctOption(round);
    const wrong = round.options.filter((option) => option !== correct);
    const items = [
      { option: correct, target: true },
      { option: correct, target: true },
      { option: correct, target: true },
      { option: wrong[0] || round.options[0], target: false },
      { option: wrong[0] || round.options[0], target: false },
      { option: wrong[1] || wrong[0] || round.options[0], target: false },
      { option: wrong[1] || wrong[0] || round.options[0], target: false },
      { option: wrong[0] || round.options[0], target: false },
    ];
    const counter = createCounter("찾았어요", 0, 3);
    const board = document.createElement("div");
    board.className = "spot-board";
    let found = 0;
    const targetButtons = [];

    shuffled(items, seed).forEach((item, index) => {
      const button = createToken(item.option, "spot-tile");
      button.dataset.target = String(item.target);
      button.dataset.index = String(index);
      if (item.target) targetButtons.push(button);
      controller.on(button, "click", () => {
        if (button.disabled) return;
        if (!item.target) {
          onMistake(button, targetButtons.filter((target) => !target.disabled));
          return;
        }
        button.disabled = true;
        button.classList.add("is-found");
        found += 1;
        setCounter(counter, found, 3);
        announce("같은 그림 " + found + "개를 찾았어요.");
        onProgress("prompt");
        if (found === 3) onComplete(button);
      });
      board.appendChild(button);
    });
    stage.append(counter, board);
    return {
      hint: () => pulse(targetButtons.filter((button) => !button.disabled)),
      replay: () => pulse(targetButtons.filter((button) => !button.disabled), "is-replay"),
    };
  }

  const KOREAN_NUMBERS = Object.freeze({
    하나: 1,
    한: 1,
    둘: 2,
    두: 2,
    셋: 3,
    세: 3,
    넷: 4,
    네: 4,
    다섯: 5,
  });

  function parseTargetCount(round) {
    const correct = correctOption(round);
    const values = [correct.label, correct.visual, round.prompt];
    for (const raw of values) {
      const text = String(raw || "");
      const digit = text.match(/[1-5]/);
      if (digit) return Number(digit[0]);
      for (const [word, number] of Object.entries(KOREAN_NUMBERS)) {
        if (text.includes(word)) return number;
      }
    }
    if (round.scene?.length && round.scene.length <= 5) return round.scene.length;
    return 3;
  }

  function visualTokens(value) {
    const text = String(value || "").trim();
    if (!text) return [];
    const spaced = text.split(/\s+/u).filter(Boolean);
    if (spaced.length > 1) return spaced;
    if (typeof Intl?.Segmenter === "function") {
      const graphemes = [...new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(text)].map(
        (part) => part.segment,
      );
      if (graphemes.length > 1 && graphemes.every((part) => /\p{Extended_Pictographic}/u.test(part))) {
        return graphemes;
      }
    }
    return [text];
  }

  function countVisuals(round, total) {
    const scene = (round.scene || []).flatMap(visualTokens).filter(Boolean);
    const correct = correctOption(round);
    const answerUnits = visualTokens(correct.visual);
    const units = scene.length ? scene : answerUnits.length ? answerUnits : ["⭐"];
    return Array.from({ length: total }, (_, index) => cleanVisual(units[index % units.length]));
  }

  function renderCount(context) {
    const { controller, stage, round, onComplete, onMistake, announce } = context;
    const target = Math.max(1, Math.min(5, parseTargetCount(round)));
    const total = 5;
    const counter = createCounter("바구니", 0, target);
    const board = document.createElement("div");
    board.className = "count-board";
    const basket = document.createElement("div");
    basket.className = "count-basket";
    basket.setAttribute("aria-label", target + "개를 담는 바구니");
    const selected = new Set();

    countVisuals(round, total).forEach((visual, index) => {
      const option = { visual, label: "그림 " + (index + 1) };
      const button = createToken(option, "count-piece");
      button.dataset.index = String(index);
      controller.on(button, "click", () => {
        if (selected.has(index)) {
          selected.delete(index);
          button.classList.remove("is-counted");
          button.setAttribute("aria-pressed", "false");
        } else {
          selected.add(index);
          button.classList.add("is-counted");
          button.setAttribute("aria-pressed", "true");
        }
        basket.replaceChildren(
          ...[...selected].map((selectedIndex) => {
            const copy = document.createElement("span");
            copy.textContent = countVisuals(round, total)[selectedIndex];
            copy.setAttribute("aria-hidden", "true");
            return copy;
          }),
        );
        setCounter(counter, selected.size, target);
        announce(selected.size + "개를 담았어요.");
      });
      button.setAttribute("aria-pressed", "false");
      board.appendChild(button);
    });

    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "activity-confirm";
    confirm.textContent = "다 셌어요!";
    controller.on(confirm, "click", () => {
      if (selected.size === target) onComplete(confirm);
      else {
        onMistake(confirm, counter);
        announce(target + "개가 되도록 넣거나 빼 봐요.");
      }
    });
    stage.append(counter, basket, board, confirm);
    return {
      hint: () => pulse([counter, basket]),
      replay: () => pulse(board.querySelectorAll(".count-piece:not(.is-counted)"), "is-replay"),
    };
  }

  function renderMemory(context) {
    const { controller, stage, round, roundIndex, seed, onAttempt, onComplete, onProgress, announce } = context;
    const pairCount = roundIndex === 0 ? 2 : 3;
    const options = round.options.slice(0, pairCount);
    const cards = [];
    options.forEach((option, pair) => {
      cards.push({ option, pair, copy: 0 }, { option, pair, copy: 1 });
    });
    const counter = createCounter("짝꿍", 0, pairCount);
    const board = document.createElement("div");
    board.className = "memory-board";
    let open = [];
    let matches = 0;
    let locked = false;
    let misses = 0;

    shuffled(cards, seed).forEach((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-card";
      button.dataset.pair = String(card.pair);
      button.dataset.index = String(index);
      button.setAttribute("aria-label", "기억 카드 " + (index + 1) + " 뒤집기");
      const front = document.createElement("span");
      front.className = "memory-front";
      front.textContent = "?";
      front.setAttribute("aria-hidden", "true");
      const back = createVisual(card.option, "memory-back");
      button.append(front, back);

      controller.on(button, "click", () => {
        if (locked || button.disabled || button.classList.contains("is-open")) return;
        button.classList.add("is-open");
        button.setAttribute("aria-label", optionName(card.option));
        open.push(button);
        if (open.length < 2) return;

        locked = true;
        onAttempt();
        const [first, second] = open;
        if (first.dataset.pair === second.dataset.pair) {
          controller.later(() => {
            first.disabled = true;
            second.disabled = true;
            first.classList.add("is-matched");
            second.classList.add("is-matched");
            open = [];
            locked = false;
            matches += 1;
            setCounter(counter, matches, pairCount);
            announce("짝꿍을 찾았어요. " + matches + "쌍 완료.");
            onProgress("prompt");
            if (matches === pairCount) onComplete(second, { record: false });
          }, 430);
          return;
        }

        misses += 1;
        first.classList.add("is-miss");
        second.classList.add("is-miss");
        announce("그림을 기억하고 다른 카드를 찾아봐요.");
        onProgress("retry");
        controller.later(() => {
          first.classList.remove("is-open", "is-miss");
          second.classList.remove("is-open", "is-miss");
          first.setAttribute("aria-label", "기억 카드 다시 뒤집기");
          second.setAttribute("aria-label", "기억 카드 다시 뒤집기");
          open = [];
          locked = false;
          if (misses >= 2) {
            const unmatched = [...board.querySelectorAll(".memory-card:not(.is-matched)")];
            const firstPair = unmatched.find((item) => item.dataset.pair === unmatched[0]?.dataset.pair);
            const mate = unmatched.find((item) => item !== firstPair && item.dataset.pair === firstPair?.dataset.pair);
            pulse([firstPair, mate]);
          }
        }, 720);
      });
      board.appendChild(button);
    });
    stage.append(counter, board);
    return {
      hint: () => {
        const unmatched = [...board.querySelectorAll(".memory-card:not(.is-matched)")];
        if (!unmatched.length) return;
        const pair = unmatched[0].dataset.pair;
        pulse(unmatched.filter((item) => item.dataset.pair === pair));
      },
      replay: () => pulse(board.querySelectorAll(".memory-card:not(.is-matched)"), "is-replay"),
    };
  }

  function renderPattern(context) {
    const { controller, stage, round, seed, onComplete, onMistake, announce } = context;
    const track = document.createElement("div");
    track.className = "pattern-track";
    const sequence = (round.scene || []).filter((item) => item !== "❓").slice(-5);
    const patternItems = sequence.length ? sequence : ["●", "▲", "●"];
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", "규칙: " + patternItems.map(cleanVisual).join(", ") + ", 빈칸");
    patternItems.forEach((item) => {
      const cell = document.createElement("span");
      cell.className = "pattern-cell";
      cell.textContent = cleanVisual(item);
      cell.setAttribute("aria-hidden", "true");
      track.appendChild(cell);
    });
    const blank = document.createElement("button");
    blank.type = "button";
    blank.className = "pattern-cell pattern-blank";
    blank.dataset.activityDrop = "pattern";
    blank.setAttribute("aria-label", "규칙의 빈칸");
    blank.textContent = "?";
    track.appendChild(blank);

    const tray = document.createElement("div");
    tray.className = "activity-tray";
    const sources = shuffled(round.options, seed).map((option, index) => {
      const token = createToken(option);
      token.dataset.optionIndex = String(round.options.indexOf(option));
      token.dataset.label = optionName(option);
      tray.appendChild(token);
      return token;
    });

    setupPickAndDrop(
      controller,
      sources,
      [blank],
      (source) => {
        const option = round.options[Number(source.dataset.optionIndex)];
        if (!option.correct) {
          onMistake(source, sources.find((item) => round.options[Number(item.dataset.optionIndex)]?.correct));
          return false;
        }
        blank.textContent = "";
        blank.appendChild(createVisual(option));
        blank.classList.add("is-filled");
        blank.setAttribute("aria-label", optionName(option) + "로 규칙 완성");
        blank.disabled = true;
        source.disabled = true;
        onComplete(blank);
        return true;
      },
      announce,
    );
    stage.append(track, tray);
    return {
      hint: () => pulse(sources.find((source) => round.options[Number(source.dataset.optionIndex)]?.correct)),
      replay: () => pulse(track, "is-replay"),
    };
  }

  function binLabels(game) {
    if (game.category === "heart" || /안전|약속|마음|생활/.test(game.title || "")) {
      return ["해도 좋아요", "다른 방법"];
    }
    return ["어울려요", "다른 친구"];
  }

  function renderSort(context) {
    const { controller, stage, game, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const tray = document.createElement("div");
    tray.className = "activity-tray sort-tray";
    const labels = binLabels(game);
    const bins = document.createElement("div");
    bins.className = "sort-bins";
    const targets = labels.map((label, index) => {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "sort-bin";
      target.dataset.activityDrop = index === 0 ? "correct" : "other";
      target.innerHTML =
        "<span class=\"sort-bin-icon\" aria-hidden=\"true\">" +
        (index === 0 ? "★" : "○") +
        "</span><strong>" +
        label +
        "</strong><span class=\"bin-contents\" aria-hidden=\"true\"></span>";
      target.setAttribute("aria-label", label + " 바구니");
      bins.appendChild(target);
      return target;
    });
    let placed = 0;
    const sources = shuffled(round.options, seed).map((option) => {
      const token = createToken(option);
      token.dataset.optionIndex = String(round.options.indexOf(option));
      token.dataset.label = optionName(option);
      tray.appendChild(token);
      return token;
    });

    setupPickAndDrop(
      controller,
      sources,
      targets,
      (source, target) => {
        const option = round.options[Number(source.dataset.optionIndex)];
        const expected = option.correct ? "correct" : "other";
        if (target.dataset.activityDrop !== expected) {
          onMistake(source, targets.find((item) => item.dataset.activityDrop === expected));
          return false;
        }
        source.disabled = true;
        source.classList.add("is-placed");
        target.querySelector(".bin-contents").appendChild(createVisual(option, "bin-mini-visual"));
        const placedNames = target.dataset.placedNames ? target.dataset.placedNames.split("|") : [];
        placedNames.push(optionName(option));
        target.dataset.placedNames = placedNames.join("|");
        target.setAttribute("aria-label", target.querySelector("strong").textContent + " 바구니, " + placedNames.join(", ") + " 넣음");
        placed += 1;
        announce(optionName(option) + ", " + target.querySelector("strong").textContent + " 바구니.");
        onProgress("prompt");
        if (placed === sources.length) onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(tray, bins);
    return {
      hint: () => {
        const source = sources.find((item) => !item.disabled);
        if (!source) return;
        const option = round.options[Number(source.dataset.optionIndex)];
        pulse([source, targets[option.correct ? 0 : 1]]);
      },
      replay: () => pulse(sources.filter((source) => !source.disabled), "is-replay"),
    };
  }

  function renderDrag(context) {
    const { controller, stage, round, roundIndex, seed, onComplete, onMistake, onProgress, announce } = context;
    const pairCount = roundIndex === 0 ? 2 : Math.min(3, round.options.length);
    const requested = correctOption(round);
    const pairOptions = roundIndex === 0
      ? [requested, ...round.options.filter((option) => option !== requested)].slice(0, pairCount)
      : round.options.slice(0, pairCount);
    const pairs = pairOptions.map((option, match) => ({ option, match }));

    const targetsBoard = document.createElement("div");
    targetsBoard.className = "sequence-slots match-targets";
    targetsBoard.style.gridTemplateColumns = "repeat(" + pairCount + ", minmax(0, 1fr))";
    const targets = shuffled(pairs, seed + ":targets").map(({ option, match }) => {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "sequence-slot match-target";
      target.dataset.activityDrop = String(match);
      const preview = createVisual(option, "sequence-slot-visual match-preview");
      preview.setAttribute("aria-hidden", "true");
      const caption = document.createElement("small");
      caption.textContent = "같은 그림 자리";
      target.append(preview, caption);
      target.setAttribute("aria-label", optionName(option) + " 짝 자리");
      targetsBoard.appendChild(target);
      return target;
    });

    const tray = document.createElement("div");
    tray.className = "activity-tray match-tray";
    tray.style.gridTemplateColumns = "repeat(" + pairCount + ", minmax(0, 1fr))";
    const sources = shuffled(pairs, seed + ":sources").map(({ option, match }) => {
      const token = createToken(option);
      token.dataset.match = String(match);
      token.dataset.label = optionName(option);
      tray.appendChild(token);
      return token;
    });

    let placed = 0;
    setupPickAndDrop(
      controller,
      sources,
      targets,
      (source, target) => {
        if (source.dataset.match !== target.dataset.activityDrop) {
          onMistake(source, targets.find((item) => item.dataset.activityDrop === source.dataset.match));
          return false;
        }
        const pair = pairs.find((item) => String(item.match) === source.dataset.match);
        source.disabled = true;
        source.classList.add("is-placed");
        target.replaceChildren(createVisual(pair.option, "sequence-slot-visual"));
        target.classList.add("is-filled");
        target.setAttribute("aria-label", optionName(pair.option) + " 짝 완료");
        target.disabled = true;
        placed += 1;
        onProgress("prompt");
        announce(optionName(pair.option) + " 짝을 찾았어요. " + placed + "개 완료.");
        if (placed === pairCount) onComplete(target);
        return true;
      },
      announce,
    );

    stage.append(targetsBoard, tray);
    return {
      hint: () => {
        const source = sources.find((item) => !item.disabled);
        if (source) pulse([source, targets.find((item) => item.dataset.activityDrop === source.dataset.match)]);
      },
      replay: () => pulse(sources.filter((source) => !source.disabled), "is-replay"),
    };
  }

  const ROUND_SEQUENCE_KEYS = new Set(["extra015", "extra030"]);

  function splitSequenceVisual(value) {
    return String(value || "")
      .split(/\s*(?:→|➡️|➜)\s*|\s+/u)
      .map((part) => part.trim())
      .filter((part) => part && !/^(?:→|➡️|➜)$/u.test(part));
  }

  function renderSequence(context) {
    const { controller, stage, game, round, gameKey, roundIndex, seed, onComplete, onMistake, onProgress, announce } = context;
    let steps;
    let distractor = null;

    if (ROUND_SEQUENCE_KEYS.has(gameKey)) {
      const answer = correctOption(round);
      const parts = splitSequenceVisual(answer.visual);
      steps = (parts.length >= 2 ? parts : [answer.visual, answer.visual]).map((visual, index) => ({
        option: { visual, label: answer.label + " " + (index + 1) + "번째" },
        step: index,
      }));
    } else {
      const stepCount = roundIndex === 0 ? 2 : Math.min(3, game.rounds.length);
      steps = game.rounds.slice(0, stepCount).map((item, index) => ({ option: correctOption(item), step: index }));
      if (roundIndex >= 2) distractor = round.options.find((option) => !option.correct) || null;
    }

    const slots = document.createElement("div");
    slots.className = "sequence-slots";
    slots.style.gridTemplateColumns = "repeat(" + steps.length + ", minmax(0, 1fr))";
    const targets = steps.map((_, index) => {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "sequence-slot";
      target.dataset.activityDrop = String(index);
      target.innerHTML = '<span class="slot-number">' + (index + 1) + '</span><small>' + (index === 0 ? "먼저" : index === steps.length - 1 ? "마지막" : "다음") + '</small>';
      target.setAttribute("aria-label", index + 1 + "번째 자리");
      slots.appendChild(target);
      return target;
    });

    const tray = document.createElement("div");
    tray.className = "activity-tray sequence-tray";
    const sourceItems = [...steps, ...(distractor ? [{ option: distractor, step: "extra" }] : [])];
    tray.style.gridTemplateColumns = "repeat(" + Math.min(4, sourceItems.length) + ", minmax(0, 1fr))";
    const sources = shuffled(sourceItems, seed).map((item) => {
      const token = createToken(item.option);
      token.dataset.step = String(item.step);
      token.dataset.label = optionName(item.option);
      tray.appendChild(token);
      return token;
    });

    let placed = 0;
    setupPickAndDrop(
      controller,
      sources,
      targets,
      (source, target) => {
        const step = Number(source.dataset.step);
        if (!Number.isInteger(step) || source.dataset.step !== target.dataset.activityDrop) {
          const expected = Number.isInteger(step) ? targets[step] : targets.find((item) => !item.disabled);
          onMistake(source, expected);
          return false;
        }
        const option = steps[step].option;
        source.disabled = true;
        source.classList.add("is-placed");
        target.replaceChildren(
          Object.assign(document.createElement("span"), {
            className: "slot-number",
            textContent: String(step + 1),
          }),
          createVisual(option, "sequence-slot-visual"),
        );
        target.classList.add("is-filled");
        target.setAttribute("aria-label", step + 1 + "번째 자리, " + optionName(option) + " 놓음");
        target.disabled = true;
        placed += 1;
        onProgress("prompt");
        announce(placed + "단계를 놓았어요.");
        if (placed === steps.length) onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(slots, tray);
    return {
      hint: () => {
        const source = sources.find((item) => !item.disabled && item.dataset.step !== "extra");
        if (source) pulse([source, targets[Number(source.dataset.step)]]);
      },
      replay: () => pulse(targets.filter((target) => !target.disabled), "is-replay"),
    };
  }

  function renderOrder(context) {
    const { controller, stage, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const base = correctOption(round);
    const sizeLabels = ["작게", "중간", "크게"];
    const slots = document.createElement("div");
    slots.className = "sequence-slots size-slots";
    const targets = sizeLabels.map((label, index) => {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "sequence-slot size-slot size-" + (index + 1);
      target.dataset.activityDrop = String(index);
      target.innerHTML = "<span class=\"slot-number\">" + (index + 1) + "</span><small>" + label + "</small>";
      target.setAttribute("aria-label", label + " 자리");
      slots.appendChild(target);
      return target;
    });
    const tray = document.createElement("div");
    tray.className = "activity-tray size-tray";
    const sources = shuffled(
      sizeLabels.map((label, index) => ({ label, size: index })),
      seed,
    ).map((item) => {
      const token = createToken(base, "activity-token size-token size-" + (item.size + 1));
      token.dataset.size = String(item.size);
      token.dataset.label = item.label + " " + optionName(base);
      token.setAttribute("aria-label", token.dataset.label);
      tray.appendChild(token);
      return token;
    });
    let placed = 0;
    setupPickAndDrop(
      controller,
      sources,
      targets,
      (source, target) => {
        if (source.dataset.size !== target.dataset.activityDrop) {
          onMistake(source, targets[Number(source.dataset.size)]);
          return false;
        }
        source.disabled = true;
        source.classList.add("is-placed");
        const visual = createVisual(base, "sequence-slot-visual size-" + (Number(source.dataset.size) + 1));
        target.replaceChildren(
          Object.assign(document.createElement("span"), {
            className: "slot-number",
            textContent: String(Number(source.dataset.size) + 1),
          }),
          visual,
        );
        target.classList.add("is-filled");
        target.setAttribute("aria-label", sizeLabels[Number(source.dataset.size)] + " " + optionName(base) + " 놓음");
        target.disabled = true;
        placed += 1;
        onProgress("prompt");
        announce(sizeLabels[Number(source.dataset.size)] + " 그림을 놓았어요.");
        if (placed === 3) onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(slots, tray);
    return {
      hint: () => {
        const source = sources.find((item) => !item.disabled);
        if (source) pulse([source, targets[Number(source.dataset.size)]]);
      },
      replay: () => pulse(sources.filter((source) => !source.disabled), "is-replay"),
    };
  }

  const TRACE_POINTS = Object.freeze({
    circle: [
      [50, 14],
      [78, 25],
      [84, 53],
      [70, 82],
      [37, 84],
      [16, 60],
      [22, 29],
    ],
    square: [
      [18, 18],
      [50, 18],
      [82, 18],
      [82, 50],
      [82, 82],
      [50, 82],
      [18, 82],
      [18, 50],
    ],
    triangle: [
      [50, 14],
      [65, 38],
      [80, 76],
      [50, 78],
      [20, 76],
      [35, 38],
    ],
    wave: [
      [15, 50],
      [28, 26],
      [43, 65],
      [59, 30],
      [74, 65],
      [85, 42],
    ],
  });

  function traceKind(option, gameKey) {
    if (option.type === "shape" && TRACE_POINTS[option.visual]) return option.visual;
    return {
      extra005: "circle",
      extra006: "triangle",
      extra007: "square",
    }[gameKey] || "wave";
  }

  function renderTrace(context) {
    const { controller, stage, round, gameKey, seed, onComplete, onMistake, onProgress, announce } = context;
    const traceBoard = document.createElement("div");
    traceBoard.className = "trace-board";
    traceBoard.hidden = true;
    const tray = document.createElement("div");
    tray.className = "activity-tray";
    const sources = shuffled(round.options, seed).map((option) => {
      const token = createToken(option);
      token.dataset.optionIndex = String(round.options.indexOf(option));
      token.dataset.label = optionName(option);
      tray.appendChild(token);
      return token;
    });
    const target = document.createElement("button");
    target.type = "button";
    target.className = "trace-start-target";
    target.dataset.activityDrop = "trace";
    target.innerHTML = "<span aria-hidden=\"true\">✦</span><strong>먼저 맞는 그림을 놓아요</strong>";
    target.setAttribute("aria-label", "맞는 그림을 놓는 자리");

    setupPickAndDrop(
      controller,
      sources,
      [target],
      (source) => {
        const option = round.options[Number(source.dataset.optionIndex)];
        if (!option.correct) {
          onMistake(source, sources.find((item) => round.options[Number(item.dataset.optionIndex)]?.correct));
          return false;
        }
        sources.forEach((item) => {
          item.disabled = true;
          item.hidden = true;
        });
        target.hidden = true;
        traceBoard.hidden = false;
        const faint = createVisual(option, "trace-faint-visual");
        traceBoard.appendChild(faint);
        const points = TRACE_POINTS[traceKind(option, gameKey)];
        let next = 0;
        points.forEach(([left, top], index) => {
          const point = document.createElement("button");
          point.type = "button";
          point.className = "trace-point";
          point.style.left = left + "%";
          point.style.top = top + "%";
          point.textContent = String(index + 1);
          point.setAttribute("aria-label", index + 1 + "번째 점");
          controller.on(point, "click", () => {
            if (index !== next) {
              onMistake(point, traceBoard.querySelector(".trace-point[data-next=\"true\"]"));
              return;
            }
            point.disabled = true;
            point.classList.add("is-done");
            point.dataset.next = "false";
            next += 1;
            onProgress("prompt");
            announce(index + 1 + "번째 점을 이었어요.");
            const following = traceBoard.querySelectorAll(".trace-point")[next];
            if (following) {
              following.dataset.next = "true";
              following.focus({ preventScroll: true });
            }
            if (next === points.length) onComplete(point);
          });
          if (index === 0) point.dataset.next = "true";
          traceBoard.appendChild(point);
        });
        controller.later(() => {
          traceBoard.querySelector('.trace-point[data-next="true"]')?.focus({ preventScroll: true });
        }, 0);
        announce("좋아요. 이제 1번 점부터 차례로 눌러요.");
        return true;
      },
      announce,
    );
    stage.append(target, tray, traceBoard);
    return {
      hint: () =>
        pulse(
          traceBoard.hidden
            ? sources.find((source) => round.options[Number(source.dataset.optionIndex)]?.correct)
            : traceBoard.querySelector(".trace-point[data-next=\"true\"]"),
        ),
      replay: () => pulse(traceBoard.hidden ? target : traceBoard, "is-replay"),
    };
  }

  function renderCompare(context) {
    const { controller, stage, round, onComplete, onMistake, onProgress, announce } = context;
    const groupValues = (round.scene || []).slice(0, 2);
    const groups = groupValues.map((value, index) => {
      const parts = visualTokens(value);
      const side = index === 0 ? "왼쪽" : "오른쪽";
      const objects = parts.filter((part) => part !== "왼쪽" && part !== "오른쪽");
      return { side, objects: objects.length ? objects : ["★"] };
    });

    const board = document.createElement("div");
    board.className = "compare-groups";
    const pieceButtons = [];
    let counted = 0;
    const total = groups.reduce((sum, group) => sum + group.objects.length, 0);

    groups.forEach((group) => {
      const panel = document.createElement("section");
      panel.className = "compare-group";
      const heading = document.createElement("h3");
      heading.textContent = group.side;
      const counter = document.createElement("strong");
      counter.className = "compare-count";
      counter.textContent = "0";
      const pieces = document.createElement("div");
      pieces.className = "compare-pieces";
      let groupCount = 0;
      group.objects.forEach((visual, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "compare-piece";
        button.textContent = visual;
        button.setAttribute("aria-label", group.side + " 그림 " + (index + 1) + " 세기");
        controller.on(button, "click", () => {
          if (button.disabled) return;
          button.disabled = true;
          button.classList.add("is-counted");
          groupCount += 1;
          counted += 1;
          counter.textContent = String(groupCount);
          counter.setAttribute("aria-label", group.side + " " + groupCount + "개");
          onProgress("prompt");
          announce(group.side + " " + groupCount + "개를 셌어요.");
          if (counted === total) {
            answers.forEach((answer) => { answer.disabled = false; });
            answers[0]?.focus({ preventScroll: true });
            announce("양쪽을 모두 셌어요. 알맞은 관계를 골라요.");
          }
        });
        pieceButtons.push(button);
        pieces.appendChild(button);
      });
      panel.append(heading, counter, pieces);
      board.appendChild(panel);
    });

    const tray = document.createElement("div");
    tray.className = "activity-tray compare-answers";
    const answers = round.options.map((option, index) => {
      const button = createToken(option, "activity-token compare-answer");
      button.disabled = true;
      button.dataset.optionIndex = String(index);
      controller.on(button, "click", () => {
        if (button.disabled) return;
        if (option.correct) onComplete(button);
        else onMistake(button, answers.find((item) => round.options[Number(item.dataset.optionIndex)]?.correct));
      });
      tray.appendChild(button);
      return button;
    });

    stage.append(board, tray);
    return {
      hint: () => {
        const uncounted = pieceButtons.find((button) => !button.disabled);
        if (uncounted) pulse(uncounted);
        else pulse(answers.find((item) => round.options[Number(item.dataset.optionIndex)]?.correct));
      },
      replay: () => pulse(pieceButtons.filter((button) => !button.disabled), "is-replay"),
    };
  }

  const RENDERERS = Object.freeze({
    count: renderCount,
    compare: renderCompare,
    drag: renderDrag,
    sort: renderSort,
    sequence: renderSequence,
    memory: renderMemory,
    pattern: renderPattern,
    spot: renderSpot,
    trace: renderTrace,
    order: renderOrder,
  });

  function render(config) {
    activeController?.destroy();
    const controller = createController();
    activeController = controller;
    const mode = resolveMode(config.gameKey);
    const stage = config.stage;
    stage.innerHTML = "";
    stage.className = "activity-stage mode-" + mode;
    stage.dataset.mode = mode;
    stage.setAttribute("role", "group");
    stage.setAttribute("aria-label", metaFor(mode).label);

    const context = {
      ...config,
      controller,
      mode,
      seed: config.gameKey + ":" + config.roundIndex + ":" + mode,
    };
    const renderer = RENDERERS[mode];
    const activity = renderer ? renderer(context) : null;

    return {
      mode,
      label: metaFor(mode).label,
      instruction: metaFor(mode).instruction,
      hint: activity?.hint || (() => {}),
      replay: activity?.replay || (() => {}),
      destroy() {
        if (activeController === controller) activeController = null;
        controller.destroy();
      },
    };
  }

  function cleanup() {
    activeController?.destroy();
    activeController = null;
  }

  window.MONGLE_INTERACTIONS = Object.freeze({
    resolveMode,
    metaFor,
    allAssignments,
    render,
    cleanup,
  });
})();
