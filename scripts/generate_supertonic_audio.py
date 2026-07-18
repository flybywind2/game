#!/usr/bin/env python3
"""Generate the Mongle game's fixed Korean voice lines with Supertonic 3 F1.

Run with the project's Supertonic virtual environment::

    /home/ubuntu/project/.venv-supertonic/bin/python \
        scripts/generate_supertonic_audio.py

The script reads ``app.js`` instead of maintaining a second phrase list. It
keeps completed MP3 files so an interrupted run can be resumed, and replaces
``tts-manifest.js`` only after every required phrase has a valid audio file.
Use ``--list-only`` to inspect the extracted phrases without loading the model
or writing any files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from collections.abc import Iterable, Sequence
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent

MODEL = "supertonic-3"
VOICE = "F1"
LANGUAGE = "ko"
TOTAL_STEPS = 8
SPEED = 0.95
MP3_BITRATE = "96k"
SAMPLE_RATE = 44_100

SHARED_PHRASES = (
    "괜찮아. 다시 한번 찾아볼까?",
    "정답 친구가 살짝 움직일 거야.",
    "소리를 켰어요.",
)

# The app's data uses JSON-compatible, double-quoted JavaScript strings. The
# pattern deliberately ignores computed values and template literals.
JS_STRING_PATTERN = r'"(?:\\.|[^"\\])*"'
ROUND_PHRASE_RE = re.compile(
    rf"(?m)^\s*(?P<kind>prompt|speech|success)\s*:\s*"
    rf"(?P<literal>{JS_STRING_PATTERN})\s*,"
)
GAME_TITLE_RE = re.compile(
    rf"(?m)^    (?P<key>[A-Za-z_$][\w$]*)\s*:\s*\{{\s*\n"
    rf"      title\s*:\s*(?P<literal>{JS_STRING_PATTERN})\s*,"
)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate static Korean Supertonic 3 F1 MP3 assets."
    )
    parser.add_argument(
        "--app",
        type=Path,
        default=PROJECT_DIR / "app.js",
        help="JavaScript game-data file (default: %(default)s)",
    )
    parser.add_argument(
        "--extra-games",
        type=Path,
        nargs="*",
        default=sorted((PROJECT_DIR / "data").glob("extra-games-*.json")),
        help="Extra game JSON chunks (default: data/extra-games-*.json)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_DIR / "audio" / "tts",
        help="Directory for generated MP3 files (default: %(default)s)",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=PROJECT_DIR / "tts-manifest.js",
        help="JavaScript audio manifest path (default: %(default)s)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate MP3 files even when a valid hashed file exists.",
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="Print extracted phrases without loading Supertonic or writing files.",
    )
    return parser.parse_args(argv)


def decode_js_string(literal: str) -> str:
    """Decode the JSON-compatible JavaScript string used by app.js."""
    try:
        value = json.loads(literal)
    except json.JSONDecodeError as error:
        raise ValueError(f"Unsupported JavaScript string literal: {literal}") from error
    if not isinstance(value, str):
        raise ValueError(f"Expected a string literal, got: {literal}")
    return value


def ordered_unique(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        normalized = value.strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
    return result


def extract_round_phrases(source: str, app_path: Path) -> list[str]:
    """Extract only the instruction and success actually spoken for each round.

    A round's ``speech`` overrides its display-only ``prompt``. Encountering the
    ``success`` property closes the round, which avoids relying on nested option
    arrays or exact object indentation.
    """
    spoken: list[str] = []
    pending_prompt: str | None = None
    pending_speech: str | None = None
    round_number = 0

    for match in ROUND_PHRASE_RE.finditer(source):
        kind = match.group("kind")
        value = decode_js_string(match.group("literal"))

        if kind == "prompt":
            if pending_prompt is not None or pending_speech is not None:
                raise RuntimeError(
                    f"A new prompt started before round {round_number + 1} had a success "
                    f"phrase in {app_path}."
                )
            pending_prompt = value
        elif kind == "speech":
            if pending_speech is not None:
                raise RuntimeError(
                    f"Round {round_number + 1} has multiple speech strings in {app_path}."
                )
            pending_speech = value
        else:  # success
            instruction = pending_speech or pending_prompt
            if instruction is None:
                raise RuntimeError(
                    f"Success phrase {value!r} has no prompt or speech in {app_path}."
                )
            spoken.extend((instruction, value))
            round_number += 1
            pending_prompt = None
            pending_speech = None

    if pending_prompt is not None or pending_speech is not None:
        raise RuntimeError(
            f"Round {round_number + 1} has no success phrase in {app_path}."
        )
    if round_number == 0:
        raise RuntimeError(
            f"No complete prompt/speech and success round pairs found in {app_path}."
        )
    return spoken




def extract_extra_game_phrases(
    extra_paths: Sequence[Path],
) -> tuple[list[str], list[str]]:
    """Return spoken phrases and titles from fully expanded extra-game JSON."""
    phrases: list[str] = []
    titles: list[str] = []
    for extra_path in extra_paths:
        resolved = extra_path.expanduser().resolve()
        try:
            data = json.loads(resolved.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError(f"Could not read extra game data: {resolved}") from error
        if not isinstance(data, dict):
            raise RuntimeError(f"Extra game data must be an object: {resolved}")

        for key, game in data.items():
            if not isinstance(game, dict) or not isinstance(game.get("title"), str):
                raise RuntimeError(f"{resolved}/{key}: missing title")
            rounds = game.get("rounds")
            if not isinstance(rounds, list) or len(rounds) != 3:
                raise RuntimeError(f"{resolved}/{key}: expected exactly three rounds")
            titles.append(game["title"])
            for index, round_data in enumerate(rounds, start=1):
                if not isinstance(round_data, dict):
                    raise RuntimeError(f"{resolved}/{key}/round{index}: invalid round")
                instruction = round_data.get("speech") or round_data.get("prompt")
                success = round_data.get("success")
                if not isinstance(instruction, str) or not isinstance(success, str):
                    raise RuntimeError(
                        f"{resolved}/{key}/round{index}: missing speech/prompt or success"
                    )
                phrases.extend((instruction, success))
    return phrases, titles


def extract_phrases(
    app_path: Path,
    extra_paths: Sequence[Path] = (),
) -> tuple[list[str], list[str]]:
    """Return runtime ``(phrases, game_titles)`` from app and extra JSON."""
    try:
        source = app_path.read_text(encoding="utf-8")
    except OSError as error:
        raise RuntimeError(f"Could not read app data: {app_path}") from error

    core_titles = ordered_unique(
        decode_js_string(match.group("literal")) for match in GAME_TITLE_RE.finditer(source)
    )
    core_round_phrases = extract_round_phrases(source, app_path)
    extra_round_phrases, extra_titles = extract_extra_game_phrases(extra_paths)
    game_titles = ordered_unique([*core_titles, *extra_titles])
    round_phrases = [*core_round_phrases, *extra_round_phrases]

    if not game_titles:
        raise RuntimeError(
            f"No top-level game titles found in {app_path}. "
            "Expected each GAMES entry to have a six-space-indented title property."
        )

    completion_phrases = [
        f"우와, 다 해냈어! {title} 놀이 끝!" for title in game_titles
    ]
    phrases = ordered_unique(
        [*round_phrases, *SHARED_PHRASES, *completion_phrases]
    )
    return phrases, game_titles


def hashed_filename(text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
    return f"{digest}.mp3"


def build_asset_map(phrases: Sequence[str], output_dir: Path) -> dict[str, Path]:
    result: dict[str, Path] = {}
    owners: dict[str, str] = {}
    for phrase in phrases:
        filename = hashed_filename(phrase)
        previous = owners.get(filename)
        if previous is not None and previous != phrase:
            raise RuntimeError(
                f"Hash collision for {filename}: {previous!r} and {phrase!r}"
            )
        owners[filename] = phrase
        result[phrase] = output_dir / filename
    return result


def run_checked(command: Sequence[str]) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except subprocess.CalledProcessError as error:
        detail = (error.stderr or error.stdout or "unknown command failure").strip()
        raise RuntimeError(f"Command failed: {' '.join(command[:2])}: {detail}") from error


def valid_mp3(path: Path, ffprobe: str) -> bool:
    if not path.is_file() or path.stat().st_size < 512:
        return False
    try:
        result = run_checked(
            [
                ffprobe,
                "-v",
                "error",
                "-select_streams",
                "a:0",
                "-show_entries",
                "stream=codec_name,sample_rate,channels",
                "-of",
                "json",
                str(path),
            ]
        )
        streams = json.loads(result.stdout).get("streams", [])
        if not streams:
            return False
        stream = streams[0]
        return (
            stream.get("codec_name") == "mp3"
            and int(stream.get("sample_rate", 0)) == SAMPLE_RATE
            and int(stream.get("channels", 0)) == 1
        )
    except (OSError, RuntimeError, TypeError, ValueError, json.JSONDecodeError):
        return False


def encode_mp3(ffmpeg: str, wav_path: Path, mp3_path: Path) -> None:
    run_checked(
        [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(wav_path),
            "-map_metadata",
            "-1",
            "-ac",
            "1",
            "-ar",
            str(SAMPLE_RATE),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            MP3_BITRATE,
            "-id3v2_version",
            "3",
            str(mp3_path),
        ]
    )


def generate_assets(
    phrases: Sequence[str],
    asset_map: dict[str, Path],
    output_dir: Path,
    *,
    force: bool,
) -> tuple[int, int]:
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise RuntimeError("Both ffmpeg and ffprobe must be installed and available on PATH.")

    try:
        from supertonic import TTS
    except ImportError as error:
        raise RuntimeError(
            "The supertonic package is unavailable. Run this script with "
            "/home/ubuntu/project/.venv-supertonic/bin/python."
        ) from error

    output_dir.mkdir(parents=True, exist_ok=True)
    pending = [
        phrase
        for phrase in phrases
        if force or not valid_mp3(asset_map[phrase], ffprobe)
    ]
    reused = len(phrases) - len(pending)
    if not pending:
        print(f"All {len(phrases)} audio files are already valid; reusing them.", flush=True)
        return 0, reused

    print(
        f"Loading {MODEL} voice {VOICE}; {len(pending)} of {len(phrases)} files need generation...",
        flush=True,
    )
    tts = TTS(model=MODEL, auto_download=True)
    voice_style = tts.get_voice_style(VOICE)

    generated = 0
    with tempfile.TemporaryDirectory(prefix=".supertonic-", dir=output_dir) as temp_name:
        temp_dir = Path(temp_name)
        for index, phrase in enumerate(pending, start=1):
            target = asset_map[phrase]
            wav_path = temp_dir / f"{target.stem}.wav"
            encoded_path = temp_dir / target.name
            print(f"[{index}/{len(pending)}] {phrase}", flush=True)

            last_error: Exception | None = None
            for attempt in range(1, 3):
                try:
                    wav, _duration = tts.synthesize(
                        phrase,
                        voice_style=voice_style,
                        lang=LANGUAGE,
                        total_steps=TOTAL_STEPS,
                        speed=SPEED,
                    )
                    tts.save_audio(wav, str(wav_path))
                    encode_mp3(ffmpeg, wav_path, encoded_path)
                    if not valid_mp3(encoded_path, ffprobe):
                        raise RuntimeError(f"Encoded MP3 did not pass validation: {encoded_path}")
                    os.replace(encoded_path, target)
                    wav_path.unlink(missing_ok=True)
                    generated += 1
                    last_error = None
                    break
                except Exception as error:  # Keep one transient-failure retry per phrase.
                    last_error = error
                    wav_path.unlink(missing_ok=True)
                    encoded_path.unlink(missing_ok=True)
                    if attempt == 1:
                        print(f"  retrying after: {error}", file=sys.stderr, flush=True)
            if last_error is not None:
                raise RuntimeError(f"Could not generate phrase: {phrase!r}") from last_error

    return generated, reused


def manifest_asset_path(asset_path: Path, manifest_path: Path) -> str:
    relative = Path(os.path.relpath(asset_path, manifest_path.parent)).as_posix()
    return relative if relative.startswith(".") else f"./{relative}"


def write_manifest(
    manifest_path: Path,
    phrases: Sequence[str],
    asset_map: dict[str, Path],
) -> None:
    audio_map = {
        phrase: manifest_asset_path(asset_map[phrase], manifest_path) for phrase in phrases
    }
    metadata = {
        "engine": "Supertonic 3",
        "model": MODEL,
        "voice": VOICE,
        "language": LANGUAGE,
        "steps": TOTAL_STEPS,
        "speed": SPEED,
        "sampleRate": SAMPLE_RATE,
        "phraseCount": len(phrases),
    }
    content = (
        "/* Generated by scripts/generate_supertonic_audio.py. Do not edit by hand. */\n"
        "window.MONGLE_TTS_AUDIO = Object.freeze(\n"
        f"{json.dumps(audio_map, ensure_ascii=False, indent=2)}\n"
        ");\n"
        "window.MONGLE_TTS_META = Object.freeze(\n"
        f"{json.dumps(metadata, ensure_ascii=False, indent=2)}\n"
        ");\n"
    )

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = manifest_path.with_name(f".{manifest_path.name}.tmp")
    temporary.write_text(content, encoding="utf-8")
    os.replace(temporary, manifest_path)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    app_path = args.app.expanduser().resolve()
    output_dir = args.output_dir.expanduser().resolve()
    manifest_path = args.manifest.expanduser().resolve()

    extra_paths = [path.expanduser().resolve() for path in args.extra_games]
    phrases, game_titles = extract_phrases(app_path, extra_paths)
    print(
        f"Found {len(phrases)} unique phrases across {len(game_titles)} games in {app_path}.",
        flush=True,
    )
    if args.list_only:
        for index, phrase in enumerate(phrases, start=1):
            print(f"{index:>3}. {phrase}")
        return 0

    asset_map = build_asset_map(phrases, output_dir)
    generated, reused = generate_assets(
        phrases,
        asset_map,
        output_dir,
        force=args.force,
    )
    write_manifest(manifest_path, phrases, asset_map)
    print(
        f"Done: generated {generated}, reused {reused}, wrote {manifest_path}",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Interrupted; completed MP3 files were kept and the manifest was not replaced.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
