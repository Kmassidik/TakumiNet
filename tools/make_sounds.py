#!/usr/bin/env python3
"""Generate Takumi's UI sounds from scratch (Python standard library only).

Every sound is a few sine/noise partials with an envelope, so the files are
original, tiny, and identical on every run.

    python3 tools/make_sounds.py [outdir]     # default: web/sounds
"""
import math
import random
import struct
import sys
import wave
from pathlib import Path

RATE = 22050
PEAK = 0.55          # headroom: never clip
FADE = 0.006         # seconds of fade-in/out to avoid clicks


def tone(freq, dur, f_end=None, decay=6.0, vibrato=0.0):
    """Sine whose pitch glides from freq to f_end with an exponential decay."""
    n = int(RATE * dur)
    f_end = f_end if f_end is not None else freq
    out, phase = [], 0.0
    for i in range(n):
        t = i / n
        f = freq + (f_end - freq) * t
        f *= 1 + vibrato * math.sin(2 * math.pi * 30 * i / RATE)
        phase += 2 * math.pi * f / RATE
        out.append(math.sin(phase) * math.exp(-decay * t))
    return out


def noise(dur, decay=10.0, seed=1):
    rnd = random.Random(seed)
    n = int(RATE * dur)
    prev, out = 0.0, []
    for i in range(n):
        prev = 0.7 * prev + 0.3 * rnd.uniform(-1, 1)   # one-pole low-pass
        out.append(prev * math.exp(-decay * i / n))
    return out


def mix(*parts):
    n = max(len(p) for p in parts)
    return [sum(p[i] for p in parts if i < len(p)) for i in range(n)]


def seq(*parts, gap=0.0):
    pad = [0.0] * int(RATE * gap)
    out = []
    for p in parts:
        out += p + pad
    return out


def overlay(base, extra, at):
    out = base + [0.0] * max(0, int(RATE * at) + len(extra) - len(base))
    for i, v in enumerate(extra):
        out[int(RATE * at) + i] += v
    return out


def finish(samples):
    fade = int(RATE * FADE)
    for i in range(min(fade, len(samples))):
        k = i / fade
        samples[i] *= k
        samples[-1 - i] *= k
    top = max(abs(s) for s in samples) or 1.0
    return [s * PEAK / top for s in samples]


SOUNDS = {
    # placing and removing things
    "devicePlacement":   lambda: mix(tone(520, 0.16, 330, 9), tone(260, 0.16, 165, 11)),
    "addPacketDevice":   lambda: seq(tone(660, 0.07, decay=8), tone(880, 0.10, decay=8)),
    "addPacketButton":   lambda: tone(740, 0.08, decay=9),
    "removeDevice":      lambda: mix(tone(600, 0.20, 200, 7), noise(0.06, 30, 2)),
    "removeLink":        lambda: mix(noise(0.09, 25, 3), tone(320, 0.09, 220, 20)),
    # controls
    "movieControlButton": lambda: tone(1000, 0.045, decay=10),
    "simulationTab":     lambda: seq(tone(800, 0.04, decay=10), tone(1000, 0.05, decay=10), gap=0.01),
    "topologyTab":       lambda: seq(tone(1000, 0.04, decay=10), tone(800, 0.05, decay=10), gap=0.01),
    "newScenarioButton": lambda: seq(tone(523, 0.09, decay=7), tone(659, 0.09, decay=7), tone(784, 0.16, decay=5)),
    # feedback
    "popUp":             lambda: tone(420, 0.13, 820, 6),
    "errorMsg":          lambda: seq(tone(220, 0.11, decay=5, vibrato=0.02), tone(185, 0.17, decay=4, vibrato=0.02), gap=0.01),
}


def write(path, samples):
    data = b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in samples)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data)


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "web/sounds")
    out.mkdir(parents=True, exist_ok=True)
    for name, make in SOUNDS.items():
        write(out / f"{name}.wav", finish(make()))
        print(f"{name}.wav")


if __name__ == "__main__":
    main()
