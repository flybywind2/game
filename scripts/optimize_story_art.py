#!/usr/bin/env python3
"""Resize the story illustrations to the largest size the layout actually shows.

The same file is used in two places. The story path renders it at most 180x82 CSS
pixels, but the story intro card inside a game shows it up to about 342x150 CSS
pixels, which needs 684px of real pixels on a 2x screen. The originals are
960x720, and the service worker precaches all ten, so the excess lands on every
first visit.

720x540 covers the largest on-screen use at a 2x device pixel ratio while cutting
the download. Measured with tests/check-perf.mjs before and after.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

TARGET_WIDTH = 720
TARGET_HEIGHT = 540
QUALITY = 80


def main() -> int:
    story_dir = Path(__file__).resolve().parent.parent / "assets" / "generated" / "story"
    files = sorted(story_dir.glob("chapter-*.webp"))
    if not files:
        print(f"No chapter art found in {story_dir}", file=sys.stderr)
        return 1

    before_total = 0
    after_total = 0
    for path in files:
        before = path.stat().st_size
        with Image.open(path) as image:
            source = image.convert("RGB")
            if source.width <= TARGET_WIDTH and source.height <= TARGET_HEIGHT:
                print(f"skip {path.name}: already {source.width}x{source.height}")
                before_total += before
                after_total += before
                continue
            resized = source.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)
        temporary = path.with_suffix(".webp.tmp")
        resized.save(temporary, format="WEBP", quality=QUALITY, method=6)
        after = temporary.stat().st_size
        if after >= before:
            temporary.unlink()
            print(f"keep {path.name}: re-encode was not smaller")
            before_total += before
            after_total += before
            continue
        temporary.replace(path)
        before_total += before
        after_total += after
        print(f"{path.name}: {before // 1024}KB -> {after // 1024}KB")

    saved = before_total - after_total
    print(
        f"total {before_total // 1024}KB -> {after_total // 1024}KB "
        f"(saved {saved // 1024}KB)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
