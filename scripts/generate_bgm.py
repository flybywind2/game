#!/usr/bin/env python3
"""Generate Mongle Meadow Journey, an original loopable background track.

The piece is synthesized entirely with Python's standard library.  It is an
24-bar arrangement with three clearly different sections: warm music box,
playful marimba, and a sparse starlight bell reprise.  Every voice reaches
zero at the loop seam so repeating playback does not click.
"""

from __future__ import annotations

import argparse
import math
import struct
import wave
from array import array
from pathlib import Path


SAMPLE_RATE = 44_100
TEMPO = 104
BEAT_SECONDS = 60.0 / TEMPO
BAR_SECONDS = BEAT_SECONDS * 4
BAR_COUNT = 24
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


def add_marimba(
    left: array,
    right: array,
    start: float,
    note: int,
    duration: float,
    amplitude: float,
    pan: float,
) -> None:
    """A rounded wooden pluck for the playful middle section."""
    start_index = int(start * SAMPLE_RATE)
    end_index = min(len(left), int((start + duration) * SAMPLE_RATE))
    frequency = midi_frequency(note)
    gain_l, gain_r = stereo_gains(pan)
    for index in range(start_index, end_index):
        position = index / SAMPLE_RATE - start
        env = envelope(position, duration, attack=0.008, release=duration * 0.9)
        decay = math.exp(-3.1 * position / duration)
        phase = TAU * frequency * position
        tone = (
            math.sin(phase)
            + 0.24 * math.sin(2.02 * phase + 0.2)
            + 0.09 * math.sin(3.01 * phase + 0.55)
        )
        value = tone * env * decay * amplitude
        left[index] += value * gain_l
        right[index] += value * gain_r


def add_starlight_bell(
    left: array,
    right: array,
    start: float,
    note: int,
    duration: float,
    amplitude: float,
    pan: float,
) -> None:
    """A soft high bell with slow shimmer for the final section."""
    start_index = int(start * SAMPLE_RATE)
    end_index = min(len(left), int((start + duration) * SAMPLE_RATE))
    frequency = midi_frequency(note)
    gain_l, gain_r = stereo_gains(pan)
    for index in range(start_index, end_index):
        position = index / SAMPLE_RATE - start
        env = envelope(position, duration, attack=0.018, release=duration * 0.9)
        decay = math.exp(-2.4 * position / duration)
        tone = (
            math.sin(TAU * frequency * position)
            + 0.23 * math.sin(TAU * frequency * 2.005 * position + 0.4)
            + 0.12 * math.sin(TAU * frequency * 3.01 * position + 0.8)
        )
        value = tone * env * decay * amplitude
        left[index] += value * gain_l
        right[index] += value * gain_r


def add_soft_tick(left: array, right: array, start: float, pan: float, amplitude: float = 0.018) -> None:
    """A tiny brushed pulse that adds motion without sounding like a drum kit."""
    duration = 0.085
    start_index = int(start * SAMPLE_RATE)
    end_index = min(len(left), int((start + duration) * SAMPLE_RATE))
    gain_l, gain_r = stereo_gains(pan)
    for index in range(start_index, end_index):
        position = index / SAMPLE_RATE - start
        env = envelope(position, duration, attack=0.003, release=0.075)
        texture = (
            math.sin(TAU * 1730 * position)
            + 0.55 * math.sin(TAU * 2471 * position + 0.7)
            + 0.32 * math.sin(TAU * 3253 * position + 1.3)
        ) / 1.87
        value = texture * env * amplitude
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

    # Three eight-bar chapters.  Each has its own progression, melodic rhythm,
    # bass motion, and lead instrument so the long loop keeps changing gently.
    section_a_chords = (
        (48, 55, 59, 62, 64),
        (45, 52, 55, 60, 64),
        (41, 48, 52, 55, 60),
        (43, 50, 55, 57, 64),
        (48, 55, 59, 62, 64),
        (45, 52, 55, 60, 64),
        (50, 57, 60, 64, 65),
        (43, 50, 55, 57, 64),
    )
    section_b_chords = (
        (41, 48, 52, 55, 60),
        (40, 48, 52, 55, 59),
        (38, 45, 50, 53, 57),
        (43, 50, 55, 59, 64),
        (45, 52, 55, 60, 64),
        (40, 47, 52, 55, 59),
        (41, 48, 52, 57, 60),
        (43, 50, 55, 57, 64),
    )
    section_c_chords = (
        (48, 55, 59, 62, 64),
        (40, 47, 52, 55, 59),
        (45, 52, 55, 59, 64),
        (41, 48, 52, 55, 60),
        (38, 45, 50, 53, 57),
        (43, 50, 55, 59, 62),
        (40, 48, 52, 55, 60),
        (43, 50, 55, 57, 64),
    )
    chords = section_a_chords + section_b_chords + section_c_chords
    bass_roots = (
        36, 33, 29, 31, 36, 33, 38, 31,
        29, 28, 26, 31, 33, 28, 29, 31,
        36, 28, 33, 29, 26, 31, 28, 31,
    )
    melody_a = (
        ((0.50, 72), (1.50, 76), (2.50, 79), (3.25, 76)),
        ((0.50, 69), (1.50, 72), (2.50, 76), (3.25, 72)),
        ((0.50, 69), (1.50, 72), (2.50, 76), (3.25, 79)),
        ((0.50, 67), (1.50, 74), (2.50, 76), (3.25, 74)),
        ((0.50, 76), (1.50, 79), (2.50, 81), (3.25, 79)),
        ((0.50, 76), (1.50, 72), (2.50, 69), (3.25, 72)),
        ((0.50, 74), (1.50, 77), (2.50, 81), (3.25, 77)),
        ((0.50, 74), (1.50, 76), (2.50, 79), (3.10, 74)),
    )
    melody_b = (
        ((0.25, 69), (1.00, 72), (1.75, 76), (2.75, 72), (3.45, 69)),
        ((0.25, 67), (1.25, 72), (2.00, 76), (3.00, 79)),
        ((0.50, 69), (1.25, 74), (2.25, 77), (3.25, 74)),
        ((0.25, 71), (1.00, 74), (1.75, 79), (2.75, 76), (3.50, 74)),
        ((0.50, 72), (1.50, 76), (2.25, 81), (3.25, 76)),
        ((0.25, 71), (1.25, 76), (2.00, 79), (3.00, 76)),
        ((0.50, 69), (1.25, 72), (2.25, 77), (3.50, 81)),
        ((0.25, 74), (1.25, 79), (2.25, 76), (3.25, 74)),
    )
    melody_c = (
        ((0.75, 79), (2.00, 84), (3.25, 79)),
        ((0.50, 76), (1.75, 79), (3.00, 83)),
        ((0.75, 81), (2.00, 84), (3.25, 88)),
        ((0.50, 79), (1.75, 76), (3.00, 72)),
        ((0.75, 77), (2.00, 81), (3.25, 86)),
        ((0.50, 79), (1.75, 83), (3.00, 86)),
        ((0.75, 76), (2.00, 79), (3.25, 84)),
        ((0.50, 74), (1.75, 79), (3.00, 76)),
    )
    melody = melody_a + melody_b + melody_c

    for bar, chord in enumerate(chords):
        bar_start = bar * BAR_SECONDS
        section = bar // 8
        pad_amplitude = (0.060, 0.047, 0.054)[section]
        add_pad(left, right, bar_start, BAR_SECONDS - 0.055, chord, amplitude=pad_amplitude)
        add_soft_bass(left, right, bar_start + 0.08, bass_roots[bar])
        if section == 0:
            add_soft_bass(left, right, bar_start + 2.08 * BEAT_SECONDS, bass_roots[bar] + 7)
        elif section == 1:
            add_soft_bass(left, right, bar_start + 1.55 * BEAT_SECONDS, bass_roots[bar] + 7, duration=0.48)
            add_soft_bass(left, right, bar_start + 3.05 * BEAT_SECONDS, bass_roots[bar] + 12, duration=0.42)
            for tick_index, beat in enumerate((0.5, 1.5, 2.5, 3.5)):
                add_soft_tick(left, right, bar_start + beat * BEAT_SECONDS, -0.34 if tick_index % 2 == 0 else 0.34)
        else:
            add_soft_bass(left, right, bar_start + 2.55 * BEAT_SECONDS, bass_roots[bar] + 7, duration=0.52)

        for note_index, (beat, note) in enumerate(melody[bar]):
            note_start = bar_start + beat * BEAT_SECONDS
            remaining = DURATION_SECONDS - note_start - 0.045
            pan = -0.28 if (bar + note_index) % 2 == 0 else 0.28
            if section == 0:
                add_music_box(left, right, note_start, note, min(0.58, remaining), amplitude=0.102, pan=pan)
            elif section == 1:
                add_marimba(left, right, note_start, note, min(0.48, remaining), amplitude=0.115, pan=pan)
            else:
                add_starlight_bell(left, right, note_start, note, min(0.92, remaining), amplitude=0.082, pan=pan)

        if section == 2:
            # Quiet answering notes keep the last chapter spacious rather than empty.
            for arp_index, chord_note in enumerate((chord[1] + 12, chord[3] + 12)):
                note_start = bar_start + (1.15 + arp_index * 1.6) * BEAT_SECONDS
                remaining = DURATION_SECONDS - note_start - 0.045
                add_music_box(
                    left,
                    right,
                    note_start,
                    chord_note,
                    min(0.44, remaining),
                    amplitude=0.048,
                    pan=0.2 if arp_index else -0.2,
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
