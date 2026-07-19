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
    countCompare: {
      label: "세 묶음 비교",
      instruction: "세 묶음을 하나씩 센 뒤 가장 많거나 적은 묶음을 골라요.",
    },
    drag: {
      label: "관계 연결",
      instruction: "그림을 누른 뒤 알맞은 자리를 눌러 모두 연결해요.",
    },
    sort: {
      label: "두 바구니 분류",
      instruction: "그림을 누른 뒤 알맞은 바구니를 눌러 모두 나눠요.",
    },
    sequence: {
      label: "순서 만들기",
      instruction: "그림과 자리를 차례로 눌러 처음부터 마지막까지 놓아요.",
    },
    memory: {
      label: "기억 카드 짝맞추기",
      instruction: "카드를 두 장씩 뒤집어 같은 그림 짝을 모두 찾아요.",
    },
    pattern: {
      label: "규칙 완성",
      instruction: "그림을 누른 뒤 알맞은 빈칸을 눌러 규칙을 완성해요.",
    },
    spot: {
      label: "그림 속에서 찾기",
      instruction: "여러 그림을 살펴보고 정답 그림 하나를 찾아요.",
    },
    trace: {
      label: "손가락 그리기",
      instruction: "맞는 도형을 찾고 굵은 안내선을 손가락으로 따라 그려요.",
    },
    order: {
      label: "크기 비교",
      instruction: "그림과 자리를 차례로 눌러 실제 크기 순서대로 놓아요.",
    },
    draw: {
      label: "자유 그림",
      instruction: "색과 굵기를 고르고 손가락으로 그림을 그려요.",
    },
  });

  const MODE_KEYS = Object.freeze({
    count: new Set([
      "counting",
      "extra016",
      "extra017",
      "extra018",
      "extra019",
      "extra020",
    ]),
    countCompare: new Set(["extra021", "extra022"]),
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
      "extra061",
      "extra075",
      "extra076",
      "extra077",
      "extra078",
      "extra079",
      "extra080",
      "extra084",
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
    ]),
    trace: new Set(["shapes", "extra005", "extra006", "extra007", "extra050"]),
    order: new Set(["sizes", "extra012", "extra013", "extra014"]),
    compare: new Set(["more", "extra023"]),
    draw: new Set(["extra089"]),
  });

  const SAFETY_RELATION_KEYS = new Set([
    "extra061",
    "extra075",
    "extra076",
    "extra077",
    "extra078",
    "extra079",
    "extra080",
    "extra084",
  ]);

  let activeController = null;

  function metaFor(mode, gameKey) {
    if (mode === "trace" && gameKey === "extra050") {
      return {
        label: "몸으로 따라 하기",
        instruction: "맞는 동작 그림을 찾고 몸으로 두 번 따라 해요.",
      };
    }
    if (mode === "compare" && gameKey === "more") {
      return {
        label: "두 묶음 비교",
        instruction: "양쪽 그림을 모두 세고 더 많은 묶음의 개수를 골라요.",
      };
    }
    if (mode === "drag" && gameKey === "body") {
      return {
        label: "몸의 쓰임 연결",
        instruction: "질문 그림을 보고 알맞은 몸 부분을 빈자리에 놓아요.",
      };
    }
    if (mode === "drag" && SAFETY_RELATION_KEYS.has(gameKey)) {
      return {
        label: "안전 상황 연결",
        instruction: "여러 상황을 읽고 도움이 되는 행동을 각각 연결해요.",
      };
    }
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
      button.classList.remove("is-grabbed", "is-dragging");
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
      button.classList.add("is-grabbed");
      button.setPointerCapture?.(pointerId);
    });

    controller.on(button, "pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      if (event.cancelable) event.preventDefault();
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
      if (!moved) {
        button.classList.remove("is-grabbed");
        return;
      }
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

  const DEMO_SESSION_PREFIX = "mongle-place-demo-v1:";

  function showTapToPlaceDemo(context, demo) {
    const { controller, stage, mode, roundIndex } = context;
    const source = demo?.source;
    const target = demo?.target;
    if (roundIndex !== 0 || !source || !target) return;

    const storageKey = DEMO_SESSION_PREFIX + mode;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "seen");
    } catch {
      // Storage can be unavailable in strict privacy modes; the demo still works.
    }

    const overlay = document.createElement("div");
    overlay.className = "tap-place-demo";
    overlay.setAttribute("aria-hidden", "true");
    const hand = document.createElement("span");
    hand.className = "tap-place-demo-hand";
    hand.textContent = "☝️";
    const note = document.createElement("span");
    note.className = "tap-place-demo-note";
    note.textContent = demo.text || "그림을 한 번 누르고, 반짝이는 자리를 눌러요";
    overlay.append(hand, note);

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      source.classList.remove("is-demo-start");
      target.classList.remove("is-demo-target");
      overlay.classList.add("is-leaving");
      controller.later(() => overlay.remove(), 180);
    };

    controller.later(() => {
      if (dismissed) return;
      if (!source.isConnected || !target.isConnected || source.disabled || target.disabled) return;
      const stageRect = stage.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      overlay.style.setProperty("--demo-source-x", sourceRect.left + sourceRect.width / 2 - stageRect.left + "px");
      overlay.style.setProperty("--demo-source-y", sourceRect.top + sourceRect.height / 2 - stageRect.top + "px");
      overlay.style.setProperty("--demo-target-x", targetRect.left + targetRect.width / 2 - stageRect.left + "px");
      overlay.style.setProperty("--demo-target-y", targetRect.top + targetRect.height / 2 - stageRect.top + "px");
      source.classList.add("is-demo-start");
      target.classList.add("is-demo-target");
      stage.appendChild(overlay);
      controller.later(dismiss, 3300);
    }, 260);

    controller.on(stage, "pointerdown", dismiss, { capture: true });
    controller.on(stage, "click", dismiss, { capture: true });
    controller.on(stage, "keydown", dismiss, { capture: true });
    controller.addCleanup(() => {
      source.classList.remove("is-demo-start");
      target.classList.remove("is-demo-target");
      overlay.remove();
    });
  }

  function renderSpot(context) {
    const { controller, stage, game, round, roundIndex, difficulty, seed, onComplete, onMistake, announce } = context;
    const correct = correctOption(round);
    const baseCount = [4, 5, 6][Math.min(2, roundIndex || 0)];
    const desiredCount = Math.max(3, Math.min(6, baseCount + (difficulty === "challenge" ? 1 : difficulty === "support" ? -1 : 0)));
    const optionVisuals = new Set(round.options.map((option) => cleanVisual(option.visual)));
    const sceneDistractors = (round.scene || [])
      .map(cleanVisual)
      .filter((visual, index, visuals) =>
        visual !== cleanVisual(correct.visual) &&
        !optionVisuals.has(visual) &&
        visuals.indexOf(visual) === index,
      )
      .map((visual) => ({ label: "주변 그림", visual }));
    const wrongOptions = round.options.filter((option) => option !== correct);
    const distractorPool = [...sceneDistractors, ...wrongOptions];
    const items = round.options.map((option) => ({ option, target: option === correct }));
    let distractorIndex = 0;
    while (items.length < desiredCount && distractorPool.length) {
      const source = distractorPool[distractorIndex % distractorPool.length];
      items.push({ option: { ...source }, target: false });
      distractorIndex += 1;
    }
    const board = document.createElement("div");
    board.className = "spot-board spot-single-target";
    board.dataset.itemCount = String(items.length);
    board.setAttribute("aria-label", items.length + "개 그림 중 정답 하나 찾기");
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
        announce(optionName(correct) + " 그림을 찾았어요.");
        onComplete(button);
      });
      board.appendChild(button);
    });
    const scenarioVisuals = game.category === "heart"
      ? (round.scene || []).map(cleanVisual).filter(Boolean)
      : [];
    if (scenarioVisuals.length) {
      const scenario = document.createElement("div");
      scenario.className = "spot-scenario";
      scenario.setAttribute("role", "img");
      scenario.setAttribute("aria-label", "상황 그림: " + scenarioVisuals.join(", "));
      scenarioVisuals.forEach((visual) => {
        const item = document.createElement("span");
        item.textContent = visual;
        item.setAttribute("aria-hidden", "true");
        scenario.appendChild(item);
      });
      stage.append(scenario);
    }
    stage.append(board);
    return {
      requiredActions: 1,
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

  function renderCountCompare(context) {
    const { controller, stage, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const correct = correctOption(round);
    const options = shuffled(round.options, seed);
    const board = document.createElement("div");
    board.className = "count-compare-board";
    const pieceButtons = [];
    const selectButtons = [];
    const groups = [];
    let counted = 0;
    const total = options.reduce((sum, option) => sum + Math.max(1, visualTokens(option.visual).length), 0);

    options.forEach((option, optionIndex) => {
      const group = document.createElement("section");
      group.className = "count-compare-group";
      const count = document.createElement("strong");
      count.className = "compare-count";
      count.textContent = "0";
      const pieces = document.createElement("div");
      pieces.className = "count-compare-pieces";
      const visuals = visualTokens(option.visual);
      let groupCount = 0;
      (visuals.length ? visuals : [cleanVisual(option.visual)]).forEach((visual, pieceIndex) => {
        const piece = document.createElement("button");
        piece.type = "button";
        piece.className = "compare-piece";
        piece.textContent = visual;
        piece.setAttribute("aria-label", optionName(option) + "의 " + (pieceIndex + 1) + "번째 그림 세기");
        controller.on(piece, "click", () => {
          if (piece.disabled) return;
          piece.disabled = true;
          piece.classList.add("is-counted");
          groupCount += 1;
          counted += 1;
          count.textContent = String(groupCount);
          onProgress("prompt");
          announce(optionIndex + 1 + "번째 묶음 " + groupCount + "개.");
          if (counted === total) {
            selectButtons.forEach((button) => { button.disabled = false; });
            announce("세 묶음을 모두 셌어요. 질문에 맞는 묶음을 골라요.");
          }
        });
        pieceButtons.push(piece);
        pieces.appendChild(piece);
      });
      const select = document.createElement("button");
      select.type = "button";
      select.className = "count-compare-select";
      select.textContent = "이 묶음 고르기";
      select.disabled = true;
      select.setAttribute("aria-label", optionName(option) + " 묶음 고르기");
      controller.on(select, "click", () => {
        if (select.disabled) return;
        if (option !== correct) {
          onMistake(select, selectButtons[options.indexOf(correct)]);
          return;
        }
        select.classList.add("is-correct");
        onComplete(select);
      });
      selectButtons.push(select);
      group.append(count, pieces, select);
      groups.push(group);
      board.appendChild(group);
    });

    stage.append(board);
    return {
      requiredActions: total + 1,
      hint: () => {
        const uncounted = pieceButtons.find((button) => !button.disabled);
        if (uncounted) pulse(uncounted);
        else pulse(selectButtons[options.indexOf(correct)]);
      },
      replay: () => pulse(groups, "is-replay"),
    };
  }

  function renderMemory(context) {
    const { controller, stage, game, round, roundIndex, difficulty, seed, onComplete, onMistake, onProgress, announce } = context;
    const desiredPairs = difficulty === "support" && roundIndex === 0 ? 2 : Math.min(3, 2 + roundIndex);
    const candidates = [];
    [...game.rounds.map(correctOption), ...round.options].forEach((option) => {
      const visual = cleanVisual(option?.visual);
      if (!candidates.some((item) => cleanVisual(item.visual) === visual)) candidates.push(option);
    });
    const pairOptions = candidates.slice(0, Math.max(2, Math.min(desiredPairs, candidates.length)));
    const cards = shuffled(
      pairOptions.flatMap((option, pair) => [
        { option, pair, copy: 0 },
        { option, pair, copy: 1 },
      ]),
      seed + ":pairs",
    );
    const initialPreviewDuration = cards.length <= 4 ? 2200 : 3000;
    const replayPreviewDuration = cards.length <= 4 ? 1600 : 2200;
    const counter = createCounter("찾은 짝", 0, pairOptions.length);
    const previewNote = document.createElement("p");
    previewNote.className = "memory-preview-note";
    previewNote.setAttribute("aria-live", "polite");
    previewNote.textContent = "먼저 그림을 보여줄게요. 어디에 있는지 기억해요!";
    const board = document.createElement("div");
    board.className = "memory-board memory-pair-board";
    board.dataset.cardCount = String(cards.length);
    board.setAttribute("aria-label", cards.length + "장 카드에서 " + pairOptions.length + "쌍 찾기");
    const cardButtons = [];
    let first = null;
    let locked = true;
    let matched = 0;

    cards.forEach((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-card is-preview";
      button.dataset.pair = String(card.pair);
      button.dataset.copy = String(card.copy);
      button.disabled = true;
      button.setAttribute("aria-label", optionName(card.option) + " 그림 미리 보기");
      const front = document.createElement("span");
      front.className = "memory-front";
      front.textContent = "?";
      front.setAttribute("aria-hidden", "true");
      const back = createVisual(card.option, "memory-back");
      button.append(front, back);

      controller.on(button, "click", () => {
        if (locked || button.disabled || button === first) return;
        button.classList.add("is-open");
        button.setAttribute("aria-label", optionName(card.option) + " 카드");
        if (!first) {
          first = button;
          announce(optionName(card.option) + " 카드예요. 같은 그림을 찾아요.");
          return;
        }

        const previous = first;
        first = null;
        locked = true;
        if (previous.dataset.pair === button.dataset.pair) {
          previous.disabled = true;
          button.disabled = true;
          previous.classList.add("is-matched");
          button.classList.add("is-matched");
          matched += 1;
          setCounter(counter, matched, pairOptions.length);
          onProgress("prompt");
          announce(optionName(card.option) + " 짝을 찾았어요. " + matched + "쌍 완료.");
          controller.later(() => {
            locked = false;
            if (matched === pairOptions.length) onComplete(button);
          }, 300);
          return;
        }

        previous.classList.add("is-miss");
        button.classList.add("is-miss");
        const matchingCard = cardButtons.find(
          (item) => item !== previous && !item.disabled && item.dataset.pair === previous.dataset.pair,
        );
        onMistake(button, matchingCard);
        announce("그림이 달라요. 두 자리를 기억해 두었다가 다시 찾아요.");
        controller.later(() => {
          [previous, button].forEach((item) => {
            item.classList.remove("is-open", "is-miss", "try-again");
            const cardIndex = cardButtons.indexOf(item);
            item.setAttribute("aria-label", "기억 카드 " + (cardIndex + 1) + " 뒤집기");
          });
          locked = false;
        }, 720);
      });
      cardButtons.push(button);
      board.appendChild(button);
    });

    const coverCards = () => {
      cardButtons.forEach((button, index) => {
        if (button.classList.contains("is-matched")) return;
        button.classList.remove("is-preview", "is-open", "is-miss", "try-again");
        button.disabled = false;
        button.setAttribute("aria-label", "기억 카드 " + (index + 1) + " 뒤집기");
      });
      locked = false;
      previewNote.textContent = "이제 카드를 두 장씩 뒤집어 같은 그림을 찾아요.";
      announce("그림을 모두 덮었어요. 같은 그림 두 장을 찾아요.");
    };

    const previewCards = () => {
      if (locked) return;
      locked = true;
      first = null;
      cardButtons.forEach((button) => {
        if (button.classList.contains("is-matched")) return;
        button.classList.remove("is-open", "is-miss", "try-again");
        button.classList.add("is-preview");
        button.disabled = true;
      });
      previewNote.textContent = "그림 위치를 한 번 더 기억해요!";
      announce("아직 찾지 못한 그림을 한 번 더 보여줄게요.");
      controller.later(coverCards, replayPreviewDuration);
    };

    stage.append(previewNote, counter, board);
    announce("먼저 모든 그림을 보여줄게요. 어디에 있는지 기억해요.");
    controller.later(coverCards, initialPreviewDuration);
    return {
      requiredActions: pairOptions.length * 2,
      completion: "같은 그림 " + pairOptions.length + "쌍을 모두 찾았어!",
      prompt: "같은 그림 두 장을 찾아 짝을 모두 맞춰 볼까?",
      helper: "한 번에 두 장씩 뒤집고 자리를 기억해요.",
      speech: "먼저 그림 위치를 보여줄게요. 어디에 있는지 기억한 뒤 같은 그림 두 장씩 찾아 보자.",
      hint: () => {
        const source = first || cardButtons.find((item) => !item.disabled);
        const match = source && cardButtons.find((item) => item !== source && !item.disabled && item.dataset.pair === source.dataset.pair);
        pulse([source, match].filter(Boolean));
      },
      replay: previewCards,
    };
  }

  function renderLegacyPattern(context) {
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
    tray.className = "activity-tray pattern-answer-tray";
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
      requiredActions: 1,
      hint: () => pulse(sources.find((source) => round.options[Number(source.dataset.optionIndex)]?.correct)),
      replay: () => pulse(track, "is-replay"),
    };
  }

  function renderPattern(context) {
    const { controller, stage, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const correct = correctOption(round);
    const rawSequence = (round.scene || []).slice(-6);
    const missingIndex = Math.max(0, rawSequence.findIndex((item) => item === "❓"));
    const completed = rawSequence.length
      ? rawSequence.map((item) => item === "❓" ? cleanVisual(correct.visual) : cleanVisual(item))
      : [cleanVisual(correct.visual), "●", cleanVisual(correct.visual), "●"];
    const knownIndex = completed.findIndex((visual, index) =>
      index !== missingIndex && round.options.some((option) => cleanVisual(option.visual) === visual),
    );
    const hiddenIndexes = [...new Set([knownIndex >= 0 ? knownIndex : 0, missingIndex])].slice(0, 2);
    while (hiddenIndexes.length < 2 && hiddenIndexes.length < completed.length) {
      const next = completed.findIndex((_, index) => !hiddenIndexes.includes(index));
      if (next < 0) break;
      hiddenIndexes.push(next);
    }

    const answerFor = (index) =>
      round.options.find((option) => cleanVisual(option.visual) === completed[index]) || {
        label: completed[index],
        visual: completed[index],
      };
    const answers = hiddenIndexes.map((index) => ({ option: answerFor(index), targetIndex: index }));
    const usedVisuals = new Set(answers.map((item) => cleanVisual(item.option.visual)));
    const distractors = round.options
      .filter((option) => !usedVisuals.has(cleanVisual(option.visual)))
      .slice(0, 2)
      .map((option) => ({ option, targetIndex: "extra" }));
    while (distractors.length < 2) {
      const fallback = round.options[distractors.length % round.options.length];
      distractors.push({ option: fallback, targetIndex: "extra" });
    }

    const track = document.createElement("div");
    track.className = "pattern-track pattern-two-blanks";
    track.setAttribute("aria-label", "규칙에서 빠진 두 칸을 채워요");
    const targets = [];
    completed.forEach((visual, index) => {
      if (!hiddenIndexes.includes(index)) {
        const cell = document.createElement("span");
        cell.className = "pattern-cell";
        cell.textContent = visual;
        cell.setAttribute("aria-hidden", "true");
        track.appendChild(cell);
        return;
      }
      const target = document.createElement("button");
      target.type = "button";
      target.className = "pattern-cell pattern-blank";
      target.dataset.activityDrop = String(index);
      target.textContent = "?";
      target.setAttribute("aria-label", index + 1 + "번째 빠진 칸");
      targets.push(target);
      track.appendChild(target);
    });

    const tray = document.createElement("div");
    tray.className = "activity-tray pattern-answer-tray";
    tray.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
    const sourceItems = shuffled([...answers, ...distractors], seed);
    const sources = sourceItems.map((item, index) => {
      const token = createToken(item.option);
      token.dataset.sourceIndex = String(index);
      token.dataset.targetIndex = String(item.targetIndex);
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
        if (source.dataset.targetIndex !== target.dataset.activityDrop) {
          const expected = targets.find((item) => item.dataset.activityDrop === source.dataset.targetIndex)
            || sources.find((item) => item.dataset.targetIndex !== "extra" && !item.disabled);
          onMistake(source, expected);
          return false;
        }
        const item = sourceItems[Number(source.dataset.sourceIndex)];
        source.disabled = true;
        source.classList.add("is-placed");
        target.textContent = "";
        target.appendChild(createVisual(item.option));
        target.classList.add("is-filled");
        target.setAttribute("aria-label", optionName(item.option) + "로 채움");
        target.disabled = true;
        placed += 1;
        onProgress("prompt");
        announce("빠진 칸 " + placed + "개를 채웠어요.");
        if (placed === targets.length) onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(track, tray);
    return {
      requiredActions: targets.length,
      completion: "빠진 " + targets.length + "칸을 찾아 규칙을 완성했어!",
      demo: {
        source: sources.find((item) => item.dataset.targetIndex !== "extra"),
        target: targets.find((item) => item.dataset.activityDrop === sources.find((source) => source.dataset.targetIndex !== "extra")?.dataset.targetIndex),
      },
      hint: () => {
        const source = sources.find((item) => item.dataset.targetIndex !== "extra" && !item.disabled);
        if (source) pulse([source, targets.find((item) => item.dataset.activityDrop === source.dataset.targetIndex)]);
      },
      replay: () => pulse(targets.filter((target) => !target.disabled), "is-replay"),
    };
  }

  const DEEP_SORT_CONFIG = Object.freeze({
    routines: ["몸을 지키는 행동", "다른 행동"],
    extra036: ["빵집 음식", "다른 음식"],
    extra057: ["동물", "동물이 아니에요"],
    extra059: ["입는 것", "입지 않아요"],
    extra060: ["놀이감", "놀이감이 아니에요"],
    extra063: ["차례를 지키는 행동", "다른 행동"],
    extra065: ["실수를 다정하게 고치는 행동", "도움이 되지 않아요"],
    extra066: ["고마움을 전하는 행동", "다른 행동"],
    extra070: ["몸을 편안하게 돕는 행동", "도움이 되지 않아요"],
    extra071: ["젖은 옷을 보송하게 하는 행동", "도움이 되지 않아요"],
    extra073: ["상쾌한 아침을 돕는 행동", "다른 행동"],
    extra081: ["비 오는 날 안전한 준비", "안전하지 않아요"],
    extra083: ["추운 날 따뜻한 선택", "따뜻하게 돕지 않아요"],
    extra086: ["식탁 준비를 돕는 행동", "어린이가 하면 위험해요"],
  });

  const ROUND_SORT_CONFIG = Object.freeze({
    words: [
      ["먹을 수 있어요", "먹지 않아요"],
      ["타고 움직여요", "타는 것이 아니에요"],
      ["머리에 써요", "머리에 쓰지 않아요"],
    ],
    extra029: [
      ["과일", "과일이 아니에요"],
      ["동그라미 모양", "다른 모양"],
      ["파란색", "다른 색"],
    ],
    extra046: [
      ["낮과 어울려요", "밤과 어울려요"],
      ["밤과 어울려요", "낮과 어울려요"],
      ["밤과 어울려요", "낮과 어울려요"],
    ],
  });

  function renderSort(context) {
    const { controller, stage, game, gameKey, round, roundIndex, seed, onComplete, onMistake, onProgress, announce } = context;
    const tray = document.createElement("div");
    tray.className = "activity-tray sort-tray";
    const deepLabels = DEEP_SORT_CONFIG[gameKey];
    const roundLabels = ROUND_SORT_CONFIG[gameKey]?.[roundIndex];
    const labels = deepLabels || roundLabels || ["질문에 맞아요", "다른 그림이에요"];
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
    const chosenRounds = roundIndex === 0 ? game.rounds.slice(0, 2) : game.rounds;
    const items = deepLabels
      ? chosenRounds.flatMap((item, itemIndex) => {
          const correct = correctOption(item);
          const wrongs = item.options.filter((option) => option !== correct);
          const wrong = wrongs[(roundIndex + itemIndex) % wrongs.length];
          return [
            { option: correct, expected: "correct" },
            { option: wrong, expected: "other" },
          ];
        })
      : round.options.map((option) => ({
          option,
          expected: option.correct ? "correct" : "other",
        }));
    const task = document.createElement("p");
    task.className = "sequence-task sort-task";
    task.textContent = items.length + "개 그림을 하나도 남기지 말고 두 바구니에 나눠요.";
    const counter = createCounter("나눈 그림", 0, items.length);
    let placed = 0;
    const sources = shuffled(items, seed).map((item) => {
      const token = createToken(item.option);
      token.dataset.itemIndex = String(items.indexOf(item));
      token.dataset.expected = item.expected;
      token.dataset.label = optionName(item.option);
      tray.appendChild(token);
      return token;
    });

    setupPickAndDrop(
      controller,
      sources,
      targets,
      (source, target) => {
        const item = items[Number(source.dataset.itemIndex)];
        const option = item.option;
        const expected = item.expected;
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
        setCounter(counter, placed, items.length);
        announce(optionName(option) + ", " + target.querySelector("strong").textContent + " 바구니.");
        onProgress("prompt");
        if (placed === sources.length) onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(task, counter, tray, bins);
    return {
      requiredActions: items.length,
      completion: "그림 " + items.length + "개를 두 바구니에 모두 알맞게 나눴어!",
      demo: {
        source: sources[0],
        target: targets[sources[0]?.dataset.expected === "correct" ? 0 : 1],
        text: "그림을 누르고, 어울리는 바구니를 눌러요",
      },
      prompt: deepLabels || roundLabels ? labels[0] + "과 ‘" + labels[1] + "’로 나눠 볼까?" : "세 그림을 알맞은 두 바구니에 모두 나눠 볼까?",
      helper: "그림 하나를 고른 뒤 알맞은 바구니를 눌러요.",
      hint: () => {
        const source = sources.find((item) => !item.disabled);
        if (!source) return;
        pulse([source, targets[source.dataset.expected === "correct" ? 0 : 1]]);
      },
      replay: () => pulse(sources.filter((source) => !source.disabled), "is-replay"),
    };
  }

  function renderBodyFunction(context) {
    const { controller, stage, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const correct = correctOption(round);
    const tray = document.createElement("div");
    tray.className = "activity-tray body-function-tray";
    const sources = shuffled(
      round.options.map((option, index) => ({ option, index })),
      seed,
    ).map((item) => {
      const token = createToken(item.option);
      token.dataset.optionIndex = String(item.index);
      token.dataset.label = optionName(item.option);
      tray.appendChild(token);
      return token;
    });
    const correctSource = sources.find(
      (source) => round.options[Number(source.dataset.optionIndex)] === correct,
    );
    const target = document.createElement("button");
    target.type = "button";
    target.className = "single-drop-target body-function-target";
    target.dataset.activityDrop = "body-part";
    target.setAttribute("aria-label", "알맞은 몸 부분을 놓는 자리");
    target.innerHTML =
      "<span aria-hidden=\"true\">🧩</span>" +
      "<strong>몸 부분 놓기</strong>" +
      "<small>그림을 끌거나, 그림과 이곳을 차례로 눌러요</small>";

    setupPickAndDrop(
      controller,
      sources,
      [target],
      (source) => {
        const option = round.options[Number(source.dataset.optionIndex)];
        if (!option?.correct) {
          onMistake(source, correctSource);
          return false;
        }
        source.disabled = true;
        source.classList.add("is-placed");
        target.replaceChildren(
          createVisual(option),
          Object.assign(document.createElement("strong"), {
            textContent: optionName(option),
          }),
        );
        target.classList.add("is-filled");
        target.setAttribute("aria-label", optionName(option) + " 놓음");
        target.disabled = true;
        onProgress("prompt");
        announce(optionName(option) + " 그림을 놓았어요.");
        onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(tray, target);
    return {
      demo: { source: correctSource, target },
      hint: () => pulse([correctSource, target].filter(Boolean)),
      replay: () => pulse([...sources.filter((source) => !source.disabled), target], "is-replay"),
    };
  }

  function renderLegacyDrag(context) {
    if (context.gameKey === "body") return renderBodyFunction(context);
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

  function renderDrag(context) {
    const { controller, stage, game, gameKey, roundIndex, seed, onComplete, onMistake, onProgress, announce } = context;
    const isSafetyJourney = SAFETY_RELATION_KEYS.has(gameKey);
    const pairCount = roundIndex === 0 ? 2 : Math.min(3, game.rounds.length);
    const selectedRounds = Array.from({ length: pairCount }, (_, offset) =>
      game.rounds[(roundIndex + offset) % game.rounds.length],
    );
    const pairs = selectedRounds.map((item, match) => ({
      clue: isSafetyJourney ? [] : (item.scene || []).map(cleanVisual),
      prompt: item.prompt,
      option: correctOption(item),
      match,
    }));

    const targetsBoard = document.createElement("div");
    targetsBoard.className = "sequence-slots relation-targets";
    if (isSafetyJourney) targetsBoard.classList.add("safety-relation-targets");
    targetsBoard.style.gridTemplateColumns = isSafetyJourney ? "1fr" : "repeat(" + pairCount + ", minmax(0, 1fr))";
    const targets = shuffled(pairs, seed + ":clues").map((pair) => {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "sequence-slot relation-target";
      if (isSafetyJourney) target.classList.add("safety-relation-target");
      target.dataset.activityDrop = String(pair.match);
      const clue = document.createElement("span");
      clue.className = pair.clue.length ? "relation-clue-visual" : "relation-clue-text";
      clue.textContent = pair.clue.length ? pair.clue.join(" ") : pair.prompt;
      const caption = document.createElement("small");
      caption.textContent = "알맞은 그림 자리";
      target.append(clue, caption);
      target.setAttribute("aria-label", pair.prompt + ", 알맞은 그림 놓는 자리");
      targetsBoard.appendChild(target);
      return target;
    });

    const tray = document.createElement("div");
    tray.className = "activity-tray relation-tray";
    tray.style.gridTemplateColumns = "repeat(" + pairCount + ", minmax(0, 1fr))";
    const sources = shuffled(pairs, seed + ":answers").map((pair) => {
      const token = createToken(pair.option);
      token.dataset.match = String(pair.match);
      token.dataset.label = optionName(pair.option);
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
        const pair = pairs[Number(source.dataset.match)];
        source.disabled = true;
        source.classList.add("is-placed");
        target.replaceChildren(createVisual(pair.option, "sequence-slot-visual"));
        target.classList.add("is-filled");
        target.setAttribute("aria-label", pair.prompt + ", " + optionName(pair.option) + " 연결 완료");
        target.disabled = true;
        placed += 1;
        onProgress("prompt");
        announce(optionName(pair.option) + " 연결 완료. " + placed + "개 했어요.");
        if (placed === pairCount) onComplete(target);
        return true;
      },
      announce,
    );

    stage.append(tray, targetsBoard);
    return {
      requiredActions: pairCount,
      completion: isSafetyJourney
        ? "상황 " + pairCount + "개에 도움이 되는 행동을 모두 연결했어!"
        : "단서 " + pairCount + "개와 알맞은 그림을 모두 연결했어!",
      demo: {
        source: sources[0],
        target: targets.find((item) => item.dataset.activityDrop === sources[0]?.dataset.match),
      },
      prompt: isSafetyJourney ? "도움이 되는 행동을 알맞은 상황에 모두 연결해 볼까?" : "",
      helper: isSafetyJourney ? pairCount + "가지 상황을 하나씩 읽고 행동 그림을 놓아요." : "",
      hint: () => {
        const source = sources.find((item) => !item.disabled);
        if (source) pulse([source, targets.find((item) => item.dataset.activityDrop === source.dataset.match)]);
      },
      replay: () => pulse(targets.filter((target) => !target.disabled), "is-replay"),
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
      const selectedRounds = roundIndex < 2
        ? game.rounds.slice(roundIndex, roundIndex + 2)
        : game.rounds;
      steps = selectedRounds.map((item, index) => ({ option: correctOption(item), step: index }));
      if (roundIndex >= 2) distractor = round.options.find((option) => !option.correct) || null;
    }

    const task = document.createElement("p");
    task.className = "sequence-task";
    task.textContent = ROUND_SEQUENCE_KEYS.has(gameKey)
      ? "그림 조각을 처음부터 차례대로 놓아요."
      : roundIndex < 2
        ? "지금 장면과 다음 장면을 차례대로 놓아요."
        : "세 장면을 처음부터 다시 차례대로 놓아요.";

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
    stage.append(task, slots, tray);
    return {
      completion: "그림 " + steps.length + "장을 처음부터 마지막까지 순서대로 놓았어!",
      demo: {
        source: sources.find((item) => item.dataset.step === "0"),
        target: targets[0],
        text: "먼저 할 그림을 누르고, 1번 자리를 눌러요",
      },
      hint: () => {
        const source = sources.find((item) => !item.disabled && item.dataset.step !== "extra");
        if (source) pulse([source, targets[Number(source.dataset.step)]]);
      },
      replay: () => pulse(targets.filter((target) => !target.disabled), "is-replay"),
    };
  }

  function renderLegacyOrder(context) {
    const { controller, stage, round, seed, onComplete, onMistake, onProgress, announce } = context;
    const correct = correctOption(round);
    const tray = document.createElement("div");
    tray.className = "activity-tray size-tray";
    const sources = shuffled(
      round.options.map((option, index) => ({ option, index })),
      seed,
    ).map((item) => {
      const token = createToken(item.option, "activity-token size-token");
      token.dataset.optionIndex = String(item.index);
      token.dataset.label = optionName(item.option);
      tray.appendChild(token);
      return token;
    });
    const correctSource = sources.find(
      (source) => round.options[Number(source.dataset.optionIndex)] === correct,
    );
    const target = document.createElement("button");
    target.type = "button";
    target.className = "single-drop-target size-choice-target";
    target.dataset.activityDrop = "answer";
    target.setAttribute("aria-label", "알맞은 크기의 그림을 놓는 자리");
    target.innerHTML =
      "<span aria-hidden=\"true\">📏</span>" +
      "<strong>알맞은 그림 놓기</strong>" +
      "<small>그림을 끌거나, 그림과 이곳을 차례로 눌러요</small>";

    setupPickAndDrop(
      controller,
      sources,
      [target],
      (source) => {
        const option = round.options[Number(source.dataset.optionIndex)];
        if (!option?.correct) {
          onMistake(source, correctSource);
          return false;
        }
        source.disabled = true;
        source.classList.add("is-placed");
        target.replaceChildren(
          createVisual(option, "size-choice-result"),
          Object.assign(document.createElement("strong"), {
            textContent: optionName(option),
          }),
        );
        target.classList.add("is-filled");
        target.setAttribute("aria-label", optionName(option) + " 놓음");
        target.disabled = true;
        onProgress("prompt");
        announce(optionName(option) + " 그림을 놓았어요.");
        onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(tray, target);
    return {
      hint: () => pulse([correctSource, target].filter(Boolean)),
      replay: () => pulse([...sources.filter((source) => !source.disabled), target], "is-replay"),
    };
  }

  function sizeOrderOptions(gameKey, round) {
    if (round.options.every((option) => Number.isInteger(option.sizeRank))) {
      return [...round.options].sort((left, right) => left.sizeRank - right.sizeRank);
    }
    if (gameKey === "extra014") {
      const rankFor = (option) => {
        const text = optionName(option) + " " + String(option.subtitle || "");
        if (/작은|작음/.test(text)) return 0;
        if (/중간/.test(text)) return 1;
        return 2;
      };
      return [...round.options].sort((left, right) => rankFor(left) - rankFor(right));
    }
    if (gameKey === "extra012" || gameKey === "extra013") {
      const actual = round.options.filter((option) => !/같/.test(optionName(option)) && option.visual !== "〓");
      return actual.sort((left, right) => {
        if (gameKey === "extra012") return Number(left.correct) - Number(right.correct);
        return Number(right.correct) - Number(left.correct);
      });
    }
    return [...round.options];
  }

  function renderOrder(context) {
    const { controller, stage, round, gameKey, seed, onComplete, onMistake, onProgress, announce } = context;
    const ordered = sizeOrderOptions(gameKey, round);
    const sizeLabels = ordered.length === 2 ? ["더 작게", "더 크게"] : ["작게", "중간", "크게"];
    const tray = document.createElement("div");
    tray.className = "activity-tray size-tray";
    tray.style.gridTemplateColumns = "repeat(" + ordered.length + ", minmax(0, 1fr))";
    const sourceItems = shuffled(ordered.map((option, rank) => ({ option, rank })), seed);
    const sources = sourceItems.map((item) => {
      const token = createToken(item.option, "activity-token size-token");
      token.classList.add("size-" + (item.rank + 1));
      token.dataset.rank = String(item.rank);
      token.dataset.label = optionName(item.option);
      tray.appendChild(token);
      return token;
    });

    const slots = document.createElement("div");
    slots.className = "sequence-slots size-slots";
    slots.style.gridTemplateColumns = "repeat(" + ordered.length + ", minmax(0, 1fr))";
    const targets = ordered.map((option, rank) => {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "sequence-slot size-slot size-" + (rank + 1);
      target.dataset.activityDrop = String(rank);
      target.innerHTML = "<span class=\"slot-number\">" + (rank + 1) + "</span><small>" + sizeLabels[rank] + "</small>";
      target.setAttribute("aria-label", sizeLabels[rank] + " 자리");
      slots.appendChild(target);
      return target;
    });

    let placed = 0;
    setupPickAndDrop(
      controller,
      sources,
      targets,
      (source, target) => {
        if (source.dataset.rank !== target.dataset.activityDrop) {
          onMistake(source, targets[Number(source.dataset.rank)]);
          return false;
        }
        const rank = Number(source.dataset.rank);
        const option = ordered[rank];
        source.disabled = true;
        source.classList.add("is-placed");
        target.replaceChildren(
          Object.assign(document.createElement("span"), { className: "slot-number", textContent: String(rank + 1) }),
          createVisual(option, "sequence-slot-visual size-" + (rank + 1)),
        );
        target.classList.add("is-filled");
        target.setAttribute("aria-label", sizeLabels[rank] + " " + optionName(option) + " 놓음");
        target.disabled = true;
        placed += 1;
        onProgress("prompt");
        announce(optionName(option) + "를 " + sizeLabels[rank] + " 자리에 놓았어요.");
        if (placed === ordered.length) onComplete(target);
        return true;
      },
      announce,
    );
    stage.append(tray, slots);
    return {
      requiredActions: ordered.length,
      completion: "그림 " + ordered.length + "개를 실제 크기 순서대로 잘 놓았어!",
      demo: {
        source: sources.find((item) => item.dataset.rank === "0"),
        target: targets[0],
        text: "가장 작은 그림을 누르고, 첫 자리를 눌러요",
      },
      hint: () => {
        const source = sources.find((item) => !item.disabled);
        if (source) pulse([source, targets[Number(source.dataset.rank)]]);
      },
      replay: () => pulse(targets.filter((target) => !target.disabled), "is-replay"),
    };
  }

  const TRACE_POINTS = Object.freeze({
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
    if (option.type === "shape" && ["circle", "triangle", "square"].includes(option.visual)) {
      return option.visual;
    }
    return {
      extra005: "circle",
      extra006: "triangle",
      extra007: "square",
    }[gameKey] || "wave";
  }

  function sampleTraceEdges(vertices, samplesPerEdge, closed = true) {
    const points = [];
    const edgeCount = closed ? vertices.length : vertices.length - 1;
    for (let edge = 0; edge < edgeCount; edge += 1) {
      const start = vertices[edge];
      const end = vertices[(edge + 1) % vertices.length];
      for (let step = 0; step < samplesPerEdge; step += 1) {
        const progress = step / samplesPerEdge;
        points.push({
          x: start.x + (end.x - start.x) * progress,
          y: start.y + (end.y - start.y) * progress,
        });
      }
    }
    points.push({ ...(closed ? vertices[0] : vertices.at(-1)) });
    return points;
  }

  function buildTraceGuide(kind, width, height) {
    const size = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = size * 0.32;

    if (kind === "circle") {
      return Array.from({ length: 121 }, (_, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 120;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      });
    }

    if (kind === "square") {
      return sampleTraceEdges(
        [
          { x: centerX - radius, y: centerY - radius },
          { x: centerX + radius, y: centerY - radius },
          { x: centerX + radius, y: centerY + radius },
          { x: centerX - radius, y: centerY + radius },
        ],
        28,
      );
    }

    if (kind === "triangle") {
      return sampleTraceEdges(
        [
          { x: centerX, y: centerY - radius },
          { x: centerX + radius * 0.94, y: centerY + radius * 0.78 },
          { x: centerX - radius * 0.94, y: centerY + radius * 0.78 },
        ],
        36,
      );
    }

    return Array.from({ length: 101 }, (_, index) => {
      const progress = index / 100;
      return {
        x: width * (0.12 + progress * 0.76),
        y: centerY + Math.sin(progress * Math.PI * 4) * size * 0.17,
      };
    });
  }

  function tracePathLength(points) {
    let length = 0;
    for (let index = 1; index < points.length; index += 1) {
      length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
    }
    return length;
  }

  function drawTraceLine(context, points, color, width) {
    if (!points.length) return;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  }

  function setupShapeDrawing(config) {
    const { controller, traceBoard, option, kind, onComplete, onMistake, onProgress, announce } = config;
    traceBoard.classList.add("is-drawing-board");

    const heading = document.createElement("div");
    heading.className = "trace-draw-heading";
    const badge = createVisual(option, "trace-draw-visual");
    const headingText = document.createElement("strong");
    headingText.textContent = optionName(option) + "를 그려 봐요";
    heading.append(badge, headingText);

    const canvasShell = document.createElement("div");
    canvasShell.className = "trace-canvas-shell";
    const canvas = document.createElement("canvas");
    canvas.className = "trace-canvas";
    canvas.tabIndex = 0;
    canvas.dataset.traceKind = kind;
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      optionName(option) + " 굵은 안내선. 손가락이나 마우스로 선을 따라 그려요. 키보드 사용자는 아래의 키보드로 점 이어 보기 버튼을 누르세요.",
    );
    const dotLayer = document.createElement("div");
    dotLayer.className = "trace-dot-layer";
    dotLayer.hidden = true;
    canvasShell.append(canvas, dotLayer);

    const status = document.createElement("p");
    status.className = "trace-status";
    status.id = "trace-status-" + Math.random().toString(36).slice(2);
    status.setAttribute("aria-live", "polite");
    status.textContent = "노란 시작점부터 천천히 이어 그려요.";
    canvas.setAttribute("aria-describedby", status.id);

    const progress = document.createElement("div");
    progress.className = "trace-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "도형 그리기 진행");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    const progressFill = document.createElement("span");
    progress.appendChild(progressFill);

    const actions = document.createElement("div");
    actions.className = "trace-actions";
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "trace-clear";
    clearButton.textContent = "다시 그리기";
    const finishButton = document.createElement("button");
    finishButton.type = "button";
    finishButton.className = "activity-confirm trace-finish";
    finishButton.textContent = "다 그렸어요!";
    actions.append(clearButton, finishButton);
    const alternateButton = document.createElement("button");
    alternateButton.type = "button";
    alternateButton.className = "trace-alternate";
    alternateButton.textContent = "키보드로 점 이어 보기";
    alternateButton.setAttribute("aria-pressed", "false");
    traceBoard.append(heading, canvasShell, status, progress, alternateButton, actions);

    const context = canvas.getContext("2d");
    let cssWidth = 0;
    let cssHeight = 0;
    let guidePoints = [];
    let strokes = [];
    let activeStroke = null;
    let activePointer = null;
    let finished = false;
    let completionQueued = false;
    let alternateActive = false;
    let alternateNext = 0;
    const alternatePoints = [];

    const pixelStrokes = () =>
      strokes.map((stroke) => stroke.map((point) => ({ x: point.x * cssWidth, y: point.y * cssHeight })));

    const renderCanvas = () => {
      if (!cssWidth || !cssHeight) return;
      context.clearRect(0, 0, cssWidth, cssHeight);

      drawTraceLine(context, guidePoints, "#e7dbf6", 30);
      context.setLineDash([7, 11]);
      drawTraceLine(context, guidePoints, "#765b9b", 4);
      context.setLineDash([]);

      const start = guidePoints[0];
      context.beginPath();
      context.arc(start.x, start.y, 26, 0, Math.PI * 2);
      context.fillStyle = "#ffd45d";
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = "#76591f";
      context.stroke();
      context.fillStyle = "#513d16";
      context.font = "900 12px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("시작", start.x, start.y);

      pixelStrokes().forEach((stroke) => drawTraceLine(context, stroke, "#f26c62", 15));

      if (finished) {
        context.beginPath();
        context.arc(cssWidth - 38, 38, 25, 0, Math.PI * 2);
        context.fillStyle = "#2f956f";
        context.fill();
        context.fillStyle = "white";
        context.font = "900 30px sans-serif";
        context.fillText("✓", cssWidth - 38, 39);
      }
    };

    const updateAlternatePositions = () => {
      if (!guidePoints.length) return;
      const pointCount = kind === "triangle" ? 6 : 8;
      while (alternatePoints.length < pointCount) {
        const index = alternatePoints.length;
        const point = document.createElement("button");
        point.type = "button";
        point.className = "trace-point trace-access-point";
        point.textContent = String(index + 1);
        point.setAttribute("aria-label", "키보드 대체, " + (index + 1) + "번째 점");
        point.disabled = index !== 0;
        controller.on(point, "click", () => {
          if (!alternateActive || finished || index !== alternateNext) return;
          point.disabled = true;
          point.classList.add("is-done");
          point.dataset.next = "false";
          alternateNext += 1;
          const percentage = Math.round((alternateNext / pointCount) * 100);
          progressFill.style.width = percentage + "%";
          progress.setAttribute("aria-valuenow", String(percentage));
          onProgress("prompt");
          if (alternateNext === pointCount) {
            finalizeDrawing(point);
            return;
          }
          const following = alternatePoints[alternateNext];
          following.disabled = false;
          following.dataset.next = "true";
          following.focus({ preventScroll: true });
          announce(alternateNext + "개 점을 이었어요.");
        });
        if (index === 0) point.dataset.next = "true";
        alternatePoints.push(point);
        dotLayer.appendChild(point);
      }
      alternatePoints.forEach((point, index) => {
        const guideIndex = Math.round((index / pointCount) * (guidePoints.length - 1));
        const guide = guidePoints[guideIndex];
        point.style.left = (guide.x / cssWidth) * 100 + "%";
        point.style.top = (guide.y / cssHeight) * 100 + "%";
      });
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      cssWidth = rect.width;
      cssHeight = rect.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.max(1, Math.round(cssWidth * scale));
      canvas.height = Math.max(1, Math.round(cssHeight * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
      guidePoints = buildTraceGuide(kind, cssWidth, cssHeight);
      updateAlternatePositions();
      renderCanvas();
    };

    const nearestDistance = (point) => {
      let nearest = Infinity;
      guidePoints.forEach((guide) => {
        nearest = Math.min(nearest, Math.hypot(point.x - guide.x, point.y - guide.y));
      });
      return nearest;
    };

    const measure = () => {
      const drawnStrokes = pixelStrokes().filter((stroke) => stroke.length > 1);
      const drawn = drawnStrokes.flat();
      if (!drawn.length || !guidePoints.length) {
        return { coverage: 0, guidedLength: 0, beganAtStart: false, finishedAtStart: false, pass: false };
      }
      const tolerance = Math.max(25, Math.min(cssWidth, cssHeight) * 0.09);
      const coverageFor = (points) =>
        guidePoints.filter((guide) =>
          points.some((point) => Math.hypot(point.x - guide.x, point.y - guide.y) <= tolerance),
        ).length / guidePoints.length;
      const guidedLengthFor = (points) => {
        let length = 0;
        for (let index = 1; index < points.length; index += 1) {
          const previous = points[index - 1];
          const current = points[index];
          const midpoint = { x: (previous.x + current.x) / 2, y: (previous.y + current.y) / 2 };
          if (
            nearestDistance(previous) <= tolerance * 1.35 &&
            nearestDistance(midpoint) <= tolerance * 1.35 &&
            nearestDistance(current) <= tolerance * 1.35
          ) {
            length += Math.hypot(current.x - previous.x, current.y - previous.y);
          }
        }
        return length;
      };
      const guidedRatioFor = (points) => {
        const total = tracePathLength(points);
        return total > 0 ? guidedLengthFor(points) / total : 0;
      };
      const coverage = coverageFor(drawn);
      const guidedLength = drawnStrokes.reduce((total, stroke) => total + guidedLengthFor(stroke), 0);
      const guideLength = tracePathLength(guidePoints);
      const start = guidePoints[0];
      const nearStart = (point) =>
        Boolean(point && Math.hypot(point.x - start.x, point.y - start.y) <= tolerance * 1.55);
      const beganAtStart = drawnStrokes.some((stroke) => nearStart(stroke[0]));
      let finishedAtStart = false;
      let pass = false;

      drawnStrokes.forEach((stroke, startIndex) => {
        if (!nearStart(stroke[0])) return;
        const connectedStrokes = [stroke];
        let end = stroke.at(-1);
        for (let index = startIndex + 1; index < drawnStrokes.length; index += 1) {
          const nextStroke = drawnStrokes[index];
          const gap = Math.hypot(nextStroke[0].x - end.x, nextStroke[0].y - end.y);
          if (
            gap > tolerance * 1.8 ||
            guidedLengthFor(nextStroke) < 8 ||
            guidedRatioFor(nextStroke) < 0.62
          ) {
            continue;
          }
          connectedStrokes.push(nextStroke);
          end = nextStroke.at(-1);
        }
        if (!nearStart(end)) return;
        finishedAtStart = true;
        const connected = connectedStrokes.flat();
        const connectedGuided = connectedStrokes.reduce(
          (total, item) => total + guidedLengthFor(item),
          0,
        );
        const connectedTotal = connectedStrokes.reduce(
          (total, item) => total + tracePathLength(item),
          0,
        );
        if (
          coverageFor(connected) >= 0.86 &&
          connectedGuided >= guideLength * 0.62 &&
          connectedTotal > 0 &&
          connectedGuided / connectedTotal >= 0.72
        ) {
          pass = true;
        }
      });

      return { coverage, guidedLength, beganAtStart, finishedAtStart, pass };
    };

    const updateProgress = () => {
      const result = measure();
      const percentage = Math.min(100, Math.round(result.coverage * 100));
      progressFill.style.width = percentage + "%";
      progress.setAttribute("aria-valuenow", String(percentage));
      if (percentage < 15) status.textContent = "노란 시작점부터 천천히 이어 그려요.";
      else if (percentage < 45) status.textContent = "좋아요! 굵은 선을 따라 계속 이어요.";
      else if (percentage < 68) status.textContent = "거의 다 왔어요. 빈 곳을 조금 더 그려요!";
      else if (!result.beganAtStart) status.textContent = "노란 시작점에서 한 번 시작해 볼까요?";
      else if (!result.finishedAtStart) status.textContent = "노란 시작점까지 돌아오면 완성이에요!";
      else if (!result.pass) status.textContent = "안내선 가까이에서 조금만 더 이어 볼까요?";
      return result;
    };

    const finalizeDrawing = (source) => {
      if (finished || completionQueued) return;
      completionQueued = true;
      finished = true;
      canvasShell.classList.add("is-complete");
      status.textContent = "멋진 " + optionName(option) + " 완성!";
      progressFill.style.width = "100%";
      progress.setAttribute("aria-valuenow", "100");
      onProgress("prompt");
      announce(optionName(option) + "를 직접 완성했어요.");
      renderCanvas();
      controller.later(() => onComplete(source), 380);
    };

    const completeDrawing = (source) => {
      if (finished || completionQueued) return;
      const result = updateProgress();
      if (!result.pass) {
        if (result.coverage < 0.08) {
          pulse(canvasShell);
          announce("먼저 노란 시작점에서 손가락으로 선을 그려요.");
          return;
        }
        status.textContent = !result.beganAtStart
          ? "노란 시작점에서 시작해 볼까요?"
          : !result.finishedAtStart
            ? "좋아요! 노란 시작점까지 돌아오면 완성이에요."
            : "잘하고 있어요! 빈 안내선을 조금 더 이어 그려요.";
        announce(status.textContent);
        onMistake(source, canvasShell);
        return;
      }
      finalizeDrawing(canvas);
    };

    const eventPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      };
    };

    const appendPoint = (point) => {
      if (!activeStroke || !cssWidth || !cssHeight) return;
      const normalized = { x: point.x / cssWidth, y: point.y / cssHeight };
      const previous = activeStroke.at(-1);
      if (!previous) {
        activeStroke.push(normalized);
        return;
      }
      const distance = Math.hypot((normalized.x - previous.x) * cssWidth, (normalized.y - previous.y) * cssHeight);
      const steps = Math.max(1, Math.ceil(distance / 5));
      for (let step = 1; step <= steps; step += 1) {
        activeStroke.push({
          x: previous.x + (normalized.x - previous.x) * (step / steps),
          y: previous.y + (normalized.y - previous.y) * (step / steps),
        });
      }
    };

    const stopDrawing = (event) => {
      if (event.pointerId !== activePointer) return;
      appendPoint(eventPoint(event));
      activePointer = null;
      activeStroke = null;
      canvas.classList.remove("is-drawing");
      renderCanvas();
      const result = updateProgress();
      if (result.pass) completeDrawing(canvas);
    };

    controller.on(canvas, "pointerdown", (event) => {
      if (finished || activePointer !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      activePointer = event.pointerId;
      activeStroke = [];
      strokes.push(activeStroke);
      canvas.setPointerCapture?.(activePointer);
      appendPoint(eventPoint(event));
      canvas.classList.add("is-drawing");
      renderCanvas();
    });
    controller.on(canvas, "pointermove", (event) => {
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      appendPoint(eventPoint(event));
      renderCanvas();
    });
    controller.on(canvas, "pointerup", stopDrawing);
    controller.on(canvas, "pointercancel", stopDrawing);

    controller.on(clearButton, "click", () => {
      if (finished) return;
      strokes = [];
      activeStroke = null;
      activePointer = null;
      progressFill.style.width = "0%";
      progress.setAttribute("aria-valuenow", "0");
      status.textContent = "깨끗해졌어요. 노란 시작점부터 다시 그려요.";
      announce("깨끗하게 지웠어요. 다시 그려 봐요.");
      renderCanvas();
      canvas.focus({ preventScroll: true });
    });
    controller.on(finishButton, "click", () => completeDrawing(finishButton));
    controller.on(alternateButton, "click", () => {
      if (finished) return;
      alternateActive = !alternateActive;
      alternateButton.setAttribute("aria-pressed", String(alternateActive));
      alternateButton.textContent = alternateActive ? "손가락으로 직접 그리기" : "키보드로 점 이어 보기";
      dotLayer.hidden = !alternateActive;
      actions.hidden = alternateActive;
      canvas.style.pointerEvents = alternateActive ? "none" : "";
      canvas.tabIndex = alternateActive ? -1 : 0;
      if (alternateActive) {
        status.textContent = "키보드로 1번 점부터 차례로 이어요.";
        alternatePoints[alternateNext]?.focus({ preventScroll: true });
      } else {
        updateProgress();
        canvas.focus({ preventScroll: true });
      }
    });

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasShell);
    controller.addCleanup(() => resizeObserver.disconnect());
    controller.later(() => {
      resizeCanvas();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      traceBoard.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      controller.later(() => canvas.focus({ preventScroll: true }), reducedMotion ? 0 : 320);
    }, 0);
    announce("좋아요. 이제 노란 시작점부터 굵은 선을 따라 직접 그려요.");
    return canvasShell;
  }

  function setupPointTrace(config) {
    const { controller, traceBoard, option, onComplete, onMistake, onProgress, announce } = config;
    traceBoard.classList.add("is-point-trace");
    const faint = createVisual(option, "trace-faint-visual");
    traceBoard.appendChild(faint);
    const points = TRACE_POINTS.wave;
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
          onMistake(point, traceBoard.querySelector('.trace-point[data-next="true"]'));
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
  }

  function setupActionPractice(config) {
    const { controller, traceBoard, option, onComplete, onProgress, announce } = config;
    traceBoard.classList.add("is-action-practice");
    const visual = createVisual(option, "action-practice-visual");
    const heading = document.createElement("strong");
    heading.className = "action-practice-heading";
    heading.textContent = optionName(option) + "를 몸으로 따라 해요";
    const counter = createCounter("따라 했어요", 0, 2);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "activity-confirm action-practice-button";
    button.textContent = "한 번 했어요!";
    let attempts = 0;
    controller.on(button, "click", () => {
      if (button.disabled) return;
      attempts += 1;
      setCounter(counter, attempts, 2);
      onProgress("prompt");
      if (attempts < 2) {
        button.textContent = "한 번 더 해요!";
        pulse(visual, "is-replay");
        announce(optionName(option) + "를 한 번 더 따라 해요.");
        return;
      }
      button.disabled = true;
      button.textContent = "두 번 완료!";
      announce(optionName(option) + " 동작을 두 번 따라 했어요.");
      controller.later(() => onComplete(button), 280);
    });
    traceBoard.append(visual, heading, counter, button);
    announce(optionName(option) + "를 보고 몸으로 따라 한 뒤 버튼을 눌러요.");
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
    target.innerHTML = '<span aria-hidden="true">✦</span><strong>먼저 맞는 그림을 놓아요</strong>';
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
        const kind = traceKind(option, gameKey);
        if (gameKey === "extra050") {
          setupActionPractice({ controller, traceBoard, option, onComplete, onProgress, announce });
        } else if (kind === "wave") {
          setupPointTrace({ controller, traceBoard, option, onComplete, onMistake, onProgress, announce });
        } else {
          setupShapeDrawing({ controller, traceBoard, option, kind, onComplete, onMistake, onProgress, announce });
        }
        return true;
      },
      announce,
    );
    stage.append(target, tray, traceBoard);
    return {
      requiredActions: gameKey === "extra050" ? 3 : 2,
      demo: {
        source: sources.find((source) => round.options[Number(source.dataset.optionIndex)]?.correct),
        target,
        text: "맞는 그림을 누르고, 그리기 자리를 눌러요",
      },
      hint: () =>
        pulse(
          traceBoard.hidden
            ? sources.find((source) => round.options[Number(source.dataset.optionIndex)]?.correct)
            : traceBoard.querySelector('.action-practice-button, .trace-point[data-next="true"], .trace-canvas-shell'),
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

  function renderDraw(context) {
    const { controller, stage, round, roundIndex, onComplete, onMistake, onProgress, announce } = context;
    const board = document.createElement("div");
    board.className = "drawing-board";

    const promptCard = document.createElement("div");
    promptCard.className = "drawing-prompt-card";
    const promptVisual = document.createElement("span");
    promptVisual.setAttribute("aria-hidden", "true");
    promptVisual.textContent = cleanVisual(round.scene?.[0] || "🎨");
    const promptText = document.createElement("strong");
    promptText.textContent = roundIndex === 2 ? "마음대로 그려요" : "보고 떠오르는 그림을 그려요";
    promptCard.append(promptVisual, promptText);

    const toolbar = document.createElement("div");
    toolbar.className = "drawing-toolbar";
    toolbar.setAttribute("aria-label", "그림 도구");
    const palette = document.createElement("div");
    palette.className = "drawing-palette";
    const colors = [
      ["빨강", "#ef6258"],
      ["노랑", "#f4b942"],
      ["초록", "#39a97b"],
      ["파랑", "#3f8fd2"],
      ["보라", "#8a67b7"],
      ["검정", "#4b3b35"],
    ];
    let activeColor = colors[Math.min(roundIndex, colors.length - 1)][1];
    let activeWidth = 14;
    const colorButtons = colors.map(([label, color]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "drawing-color";
      button.style.setProperty("--drawing-color", color);
      button.setAttribute("aria-label", label + " 색연필");
      button.setAttribute("aria-pressed", String(color === activeColor));
      controller.on(button, "click", () => {
        activeColor = color;
        colorButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        announce(label + " 색을 골랐어요.");
      });
      palette.appendChild(button);
      return button;
    });

    const sizes = document.createElement("div");
    sizes.className = "drawing-sizes";
    const sizeButtons = [
      ["가는 선", 8],
      ["보통 선", 14],
      ["굵은 선", 24],
    ].map(([label, width]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "drawing-size";
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", String(width === activeWidth));
      const dot = document.createElement("span");
      dot.style.width = Math.max(8, width) + "px";
      dot.style.height = Math.max(8, width) + "px";
      button.appendChild(dot);
      controller.on(button, "click", () => {
        activeWidth = width;
        sizeButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        announce(label + "을 골랐어요.");
      });
      sizes.appendChild(button);
      return button;
    });
    toolbar.append(palette, sizes);

    const shell = document.createElement("div");
    shell.className = "drawing-canvas-shell";
    const canvas = document.createElement("canvas");
    canvas.className = "drawing-canvas";
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "빈 그림판. 손가락이나 마우스로 자유롭게 그려요.");
    shell.appendChild(canvas);

    const status = document.createElement("p");
    status.className = "drawing-status";
    status.setAttribute("aria-live", "polite");
    status.textContent = "색을 고르고 그림판에 두 번 이상 그려 봐요.";

    const actions = document.createElement("div");
    actions.className = "drawing-actions";
    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "drawing-tool-button";
    undo.textContent = "↶ 되돌리기";
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "drawing-tool-button";
    clear.textContent = "모두 지우기";
    const stamp = document.createElement("button");
    stamp.type = "button";
    stamp.className = "drawing-tool-button";
    stamp.textContent = "● 점 도장";
    const finish = document.createElement("button");
    finish.type = "button";
    finish.className = "activity-confirm drawing-finish";
    finish.textContent = "그림 완성!";
    actions.append(undo, clear, stamp, finish);

    board.append(promptCard, toolbar, shell, status, actions);
    stage.appendChild(board);

    const context2d = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let strokes = [];
    let activeStroke = null;
    let activePointer = null;
    let finished = false;
    const syncStrokeCount = () => {
      canvas.dataset.strokeCount = String(strokes.length);
    };
    syncStrokeCount();

    const renderCanvas = () => {
      if (!width || !height) return;
      context2d.clearRect(0, 0, width, height);
      context2d.fillStyle = "#fffdf8";
      context2d.fillRect(0, 0, width, height);
      context2d.save();
      context2d.globalAlpha = 0.075;
      context2d.font = Math.round(Math.min(width, height) * 0.38) + "px sans-serif";
      context2d.textAlign = "center";
      context2d.textBaseline = "middle";
      context2d.fillText(cleanVisual(round.scene?.[0] || "🎨"), width / 2, height / 2);
      context2d.restore();
      strokes.forEach((stroke) => {
        if (!stroke.points.length) return;
        context2d.beginPath();
        const first = stroke.points[0];
        context2d.moveTo(first.x * width, first.y * height);
        stroke.points.slice(1).forEach((point) => context2d.lineTo(point.x * width, point.y * height));
        if (stroke.points.length === 1) {
          context2d.lineTo(first.x * width + 0.1, first.y * height + 0.1);
        }
        context2d.strokeStyle = stroke.color;
        context2d.lineWidth = stroke.width;
        context2d.lineCap = "round";
        context2d.lineJoin = "round";
        context2d.stroke();
      });
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context2d.setTransform(scale, 0, 0, scale, 0, 0);
      renderCanvas();
    };
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resizeCanvas) : null;
    observer?.observe(canvas);
    controller.addCleanup(() => observer?.disconnect());
    controller.on(window, "resize", resizeCanvas);
    controller.later(resizeCanvas, 0);

    const eventPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      };
    };
    const totalLength = () => strokes.reduce((sum, stroke) => {
      let length = 0;
      for (let index = 1; index < stroke.points.length; index += 1) {
        length += Math.hypot(
          (stroke.points[index].x - stroke.points[index - 1].x) * width,
          (stroke.points[index].y - stroke.points[index - 1].y) * height,
        );
      }
      return sum + length;
    }, 0);
    const updateStatus = () => {
      const count = strokes.length;
      status.textContent = count < 2
        ? "좋아요! 선을 한 번 더 그려 볼까요?"
        : "멋져요! 더 그리거나 그림 완성을 눌러요.";
    };

    controller.on(canvas, "pointerdown", (event) => {
      if (finished || activePointer !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      activePointer = event.pointerId;
      activeStroke = { color: activeColor, width: activeWidth, points: [eventPoint(event)] };
      strokes.push(activeStroke);
      syncStrokeCount();
      canvas.setPointerCapture?.(activePointer);
      canvas.classList.add("is-drawing");
      renderCanvas();
    });
    controller.on(canvas, "pointermove", (event) => {
      if (event.pointerId !== activePointer || !activeStroke) return;
      event.preventDefault();
      const point = eventPoint(event);
      const previous = activeStroke.points.at(-1);
      if (Math.hypot((point.x - previous.x) * width, (point.y - previous.y) * height) >= 2) {
        activeStroke.points.push(point);
        renderCanvas();
      }
    });
    const stopStroke = (event) => {
      if (event.pointerId !== activePointer) return;
      canvas.releasePointerCapture?.(activePointer);
      activePointer = null;
      activeStroke = null;
      canvas.classList.remove("is-drawing");
      updateStatus();
      onProgress("prompt");
    };
    controller.on(canvas, "pointerup", stopStroke);
    controller.on(canvas, "pointercancel", stopStroke);

    controller.on(undo, "click", () => {
      if (finished || !strokes.length) return;
      strokes.pop();
      syncStrokeCount();
      renderCanvas();
      updateStatus();
      announce("마지막 선을 되돌렸어요.");
    });
    controller.on(clear, "click", () => {
      if (finished) return;
      strokes = [];
      syncStrokeCount();
      renderCanvas();
      status.textContent = "깨끗해졌어요. 다시 그려 봐요.";
      announce("그림판을 모두 지웠어요.");
    });
    controller.on(stamp, "click", () => {
      if (finished) return;
      const index = strokes.length % 6;
      strokes.push({
        color: activeColor,
        width: Math.max(18, activeWidth),
        points: [{ x: 0.2 + (index % 3) * 0.3, y: 0.28 + Math.floor(index / 3) * 0.38 }],
      });
      syncStrokeCount();
      renderCanvas();
      updateStatus();
      onProgress("prompt");
      announce("점 도장을 찍었어요.");
    });
    controller.on(finish, "click", () => {
      if (finished) return;
      if (strokes.length < 2 || (totalLength() < 70 && strokes.filter((stroke) => stroke.points.length === 1).length < 3)) {
        status.textContent = "선을 두 번 이상 길게 그려 주세요.";
        onMistake(finish, canvas);
        announce("그림판에 선을 조금 더 그려 볼까요?");
        return;
      }
      finished = true;
      shell.classList.add("is-complete");
      status.textContent = "멋진 그림이 완성됐어요!";
      announce("나만의 그림을 완성했어요.");
      controller.later(() => onComplete(finish), 280);
    });

    return {
      hint: () => pulse([canvas, finish]),
      replay: () => pulse(promptCard, "is-replay"),
    };
  }

  const RENDERERS = Object.freeze({
    count: renderCount,
    countCompare: renderCountCompare,
    compare: renderCompare,
    drag: renderDrag,
    sort: renderSort,
    sequence: renderSequence,
    memory: renderMemory,
    pattern: renderPattern,
    spot: renderSpot,
    trace: renderTrace,
    order: renderOrder,
    draw: renderDraw,
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
    stage.setAttribute("aria-label", metaFor(mode, config.gameKey).label);

    const context = {
      ...config,
      controller,
      mode,
      seed: config.gameKey + ":" + config.roundIndex + ":" + mode,
    };
    const renderer = RENDERERS[mode];
    const activity = renderer ? renderer(context) : null;
    if (activity?.demo) showTapToPlaceDemo(context, activity.demo);
    const minimumActions = {
      count: 2,
      countCompare: 4,
      compare: 3,
      drag: 2,
      sort: 6,
      sequence: 2,
      memory: 4,
      pattern: 2,
      spot: 1,
      trace: 2,
      order: 2,
      draw: 3,
    };
    stage.dataset.requiredActions = String(activity?.requiredActions || minimumActions[mode] || 1);

    return {
      mode,
      label: metaFor(mode, config.gameKey).label,
      instruction: metaFor(mode, config.gameKey).instruction,
      prompt: activity?.prompt || "",
      helper: activity?.helper || "",
      speech: activity?.speech || activity?.prompt || "",
      completion: activity?.completion || "",
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
