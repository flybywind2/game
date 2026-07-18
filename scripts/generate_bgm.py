#!/usr/bin/env python3
"""Generate Mongle Meadow, an original loopable background track.

The piece is synthesized entirely with Python's standard library.  It is an
eight-bar, 80 BPM music-box arrangement in C major, written specifically for
the Mongle toddler learning site.  Every voice reaches zero at the loop seam
so repeating playback does not click.
"""

from __future__ import annotations

import argparse
import math
import struct
import wave
from array import array
from pathlib import Path


SAMPLE_RATE = 44_100
TEMPO = 80
BEAT_SECONDS = 60.0 / TEMPO
BAR_SECONDS = BEAT_SECONDS * 4
BAR_COUNT = 8
DURATION_SECONDS = BAR_SECONDS * BAR_COUNT
TAU = math.tau


def midi_frequency(note: int) -> float:
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def envelope(position: float, duration: float, attack: float, release: float) -> float:
    """A smooth envelope that is exactly zero at both endpoints."""
    if position <= 0.0 or position >= duration:
        return 0.0
    attack_gain = min(1.0, position / attack)
    release_gain = min(1.0, (duration - position) / release)
    # Smoothstep avoids sharp derivative changes that can sound clicky.
    attack_gain = attack_gain * attack_gain * (3.0 - 2.0 * attack_gain)
    release_gain = release_gain * release_gain * (3.0 - 2.0 * release_gain)
    return attack_gain * release_gain


def stereo_gains(pan: float) -> tuple[float, float]:
    """Equal-power panning, where -1 is left and +1 is right."""
    angle = (pan + 1.0) * math.pi / 4.0
    return math.cos(angle), math.sin(angle)


def add_pad(
    left: array,
    right: array,
    start: float,
    duration: float,
    notes: tuple[int, ...],
    amplitude: float,
) -> None:
    start_index = int(start * SAMPLE_RATE)
    end_index = min(len(left), int((start + duration) * SAMPLE_RATE))
    frequencies = tuple(midi_frequency(note) for note in notes)
    per_note = amplitude / math.sqrt(len(notes))

    for index in range(start_index, end_index):
        position = index / SAMPLE_RATE - start
        env = envelope(position, duration, attack=0.42, release=0.62)
        if env == 0.0:
            continue
        # Very slow tremolo adds warmth without drawing attention.
        tremolo = 0.93 + 0.07 * math.sin(TAU * 0.23 * position)
        left_value = 0.0
        right_value = 0.0
        for voice, frequency in enumerate(frequencies):
            phase = TAU * frequency * position
            tone = math.sin(phase) + 0.14 * math.sin(2.0 * phase + 0.3)
            pan = -0.42 + 0.84 * voice / max(1, len(frequencies) - 1)
            gain_l, gain_r = stereo_gains(pan)
            left_value += tone * gain_l
            right_value += tone * gain_r
        left[index] += left_value * per_note * env * tremolo
        right[index] += right_value * per_note * env * tremolo


def add_music_box(
    left: array,
    right: array,
    start: float,
    note: int,
    duration: float,
    amplitude: float,
    pan: float,
) -> None:
    start_index = int(start * SAMPLE_RATE)
    end_index = min(len(left), int((start + duration) * SAMPLE_RATE))
    frequency = midi_frequency(note)
    gain_l, gain_r = stereo_gains(pan)

    for index in range(start_index, end_index):
        position = index / SAMPLE_RATE - start
        env = envelope(position, duration, attack=0.012, release=duration * 0.82)
        # Music-box partials: bright at the onset, then gently disappear.
        shimmer = math.exp(-4.2 * position / duration)
        fundamental = math.sin(TAU * frequency * position)
        partials = (
            0.34 * math.sin(TAU * frequency * 2.01 * position + 0.15)
            + 0.16 * math.sin(TAU * frequency * 3.98 * position + 0.4)
            + 0.07 * math.sin(TAU * frequency * 6.03 * position + 0.7)
        )
        value = (fundamental + shimmer * partials) * env * amplitude
        left[index] += value * gain_l
        right[index] += value * gain_r


def add_soft_bass(
    left: array,
    right: array,
    start: float,
    note: int,
    duration: float = 0.72,
) -> None:
    start_index = int(start * SAMPLE_RATE)
    end_index = min(len(left), int((start + duration) * SAMPLE_RATE))
    frequency = midi_frequency(note)
    gain_l, gain_r = stereo_gains(-0.08)

    for index in range(start_index, end_index):
        position = index / SAMPLE_RATE - start
        env = envelope(position, duration, attack=0.035, release=0.52)
        value = (
            math.sin(TAU * frequency * position)
            + 0.12 * math.sin(TAU * 2.0 * frequency * position)
        ) * env * 0.075
        left[index] += value * gain_l
        right[index] += value * gain_r


def render(output_path: Path) -> tuple[float, float]:
    frame_count = int(DURATION_SECONDS * SAMPLE_RATE)
    left = array("f", [0.0]) * frame_count
    right = array("f", [0.0]) * frame_count

    # Cmaj9 – Am7 – Fmaj7 – G6sus2, followed by a gentle answering phrase.
    # The note sequence below is an original melody written for this project.
    chords = (
        (48, 55, 59, 62, 64),
        (45, 52, 55, 60, 64),
        (41, 48, 52, 55, 60),
        (43, 50, 55, 57, 64),
        (48, 55, 59, 62, 64),
        (45, 52, 55, 60, 64),
        (50, 57, 60, 64, 65),
        (43, 50, 55, 57, 64),
    )
    bass_roots = (36, 33, 29, 31, 36, 33, 38, 31)
    melody = (
        ((0.50, 72), (1.50, 76), (2.50, 79), (3.25, 76)),
        ((0.50, 69), (1.50, 72), (2.50, 76), (3.25, 72)),
        ((0.50, 69), (1.50, 72), (2.50, 76), (3.25, 79)),
        ((0.50, 67), (1.50, 74), (2.50, 76), (3.25, 74)),
        ((0.50, 76), (1.50, 79), (2.50, 81), (3.25, 79)),
        ((0.50, 76), (1.50, 72), (2.50, 69), (3.25, 72)),
        ((0.50, 74), (1.50, 77), (2.50, 81), (3.25, 77)),
        ((0.50, 74), (1.50, 76), (2.50, 79), (3.10, 74)),
    )

    for bar, chord in enumerate(chords):
        bar_start = bar * BAR_SECONDS
        # A brief breath before each next chord also guarantees a clean seam.
        add_pad(left, right, bar_start, BAR_SECONDS - 0.055, chord, amplitude=0.063)
        add_soft_bass(left, right, bar_start + 0.08, bass_roots[bar])
        add_soft_bass(left, right, bar_start + 2.08 * BEAT_SECONDS, bass_roots[bar] + 7)

        for note_index, (beat, note) in enumerate(melody[bar]):
            note_start = bar_start + beat * BEAT_SECONDS
            # The final bell has extra room to decay before the loop restarts.
            remaining = DURATION_SECONDS - note_start - 0.045
            note_duration = min(0.58, remaining)
            pan = -0.28 if (bar + note_index) % 2 == 0 else 0.28
            add_music_box(
                left,
                right,
                note_start,
                note,
                note_duration,
                amplitude=0.105,
                pan=pan,
            )

    peak = max(max(abs(value) for value in left), max(abs(value) for value in right))
    # Leave generous headroom: the site plays this quietly beneath speech.
    scale = 0.62 / peak if peak else 1.0
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output_path), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        for left_value, right_value in zip(left, right):
            # A light soft clip keeps occasional chord peaks rounded.
            l_sample = math.tanh(left_value * scale) / math.tanh(1.0)
            r_sample = math.tanh(right_value * scale) / math.tanh(1.0)
            wav_file.writeframesraw(
                struct.pack(
                    "<hh",
                    round(max(-1.0, min(1.0, l_sample)) * 32767),
                    round(max(-1.0, min(1.0, r_sample)) * 32767),
                )
            )

    seam_delta = max(abs(left[0] - left[-1]), abs(right[0] - right[-1]))
    return peak, seam_delta


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        default=Path("/tmp/mongle-meadow.wav"),
        help="WAV destination (default: /tmp/mongle-meadow.wav)",
    )
    args = parser.parse_args()
    peak, seam_delta = render(args.output)
    print(
        f"Rendered {args.output}: {DURATION_SECONDS:.3f}s, {SAMPLE_RATE} Hz, "
        f"source peak={peak:.6f}, seam delta={seam_delta:.9f}"
    )


if __name__ == "__main__":
    main()
