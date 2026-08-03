#!/usr/bin/env python3
"""Composite photorealistic HDM human: photo cutout + math overlay treatment.

Supports female (locked) and male figures. Usage:
  python3 scripts/generate-hdm-human.py            # both
  python3 scripts/generate-hdm-human.py female
  python3 scripts/generate-hdm-human.py male
"""
from __future__ import annotations

import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_W, OUT_H = 800, 1747

FIGURES = {
    "female": {
        "cut": ROOT / "scripts/hdm-human-female-photo-cutout.png",
        # Backward-compat aliases kept in sync with female.
        "out_dark": [
            ROOT / "public/hdm-human-female.webp",
            ROOT / "public/hdm-human.webp",
        ],
        "out_light": [
            ROOT / "public/hdm-human-female-light.webp",
            ROOT / "public/hdm-human-light.webp",
        ],
        "out_dark_480": [
            ROOT / "public/hdm-human-female-480.webp",
            ROOT / "public/hdm-human-480.webp",
        ],
        "out_light_480": [
            ROOT / "public/hdm-human-female-light-480.webp",
            ROOT / "public/hdm-human-light-480.webp",
        ],
        "seed": 42,
    },
    "male": {
        "cut": ROOT / "scripts/hdm-human-male-photo-cutout.png",
        "out_dark": [ROOT / "public/hdm-human-male.webp"],
        "out_light": [ROOT / "public/hdm-human-male-light.webp"],
        "out_dark_480": [ROOT / "public/hdm-human-male-480.webp"],
        "out_light_480": [ROOT / "public/hdm-human-male-light-480.webp"],
        "seed": 77,
    },
}

# Prefer new female cutout name; fall back to legacy master path.
if not FIGURES["female"]["cut"].exists():
    FIGURES["female"]["cut"] = ROOT / "scripts/hdm-human-photo-cutout.png"


def fit_cutout(cut: Image.Image, tw: int, th: int, pad_frac: float = 0.045) -> Image.Image:
    a = cut.split()[-1]
    bbox = a.getbbox()
    if not bbox:
        raise SystemExit("empty cutout")
    person = cut.crop(bbox)
    pw, ph = person.size
    max_w = int(tw * (1 - 2 * pad_frac))
    max_h = int(th * (1 - 2 * pad_frac))
    scale = min(max_w / pw, max_h / ph)
    nw, nh = max(1, int(pw * scale)), max(1, int(ph * scale))
    person = person.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    x = (tw - nw) // 2
    y = max(int(th * pad_frac * 0.6), (th - nh) // 2 - int(th * 0.01))
    canvas.alpha_composite(person, (x, y))
    return canvas


def clinical_grade(img: Image.Image, dark: bool) -> Image.Image:
    r, g, b, a = img.split()
    rgb = Image.merge("RGB", (r, g, b))
    rgb = ImageEnhance.Color(rgb).enhance(0.55)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.12)
    rgb = ImageEnhance.Brightness(rgb).enhance(0.92 if dark else 1.05)
    rr, gg, bb = rgb.split()
    rr = rr.point(lambda v: int(v * 0.88 + 8))
    gg = gg.point(lambda v: int(v * 0.94 + 12))
    bb = bb.point(lambda v: min(255, int(v * 1.08 + 18)))
    rgb = Image.merge("RGB", (rr, gg, bb))
    wash = Image.new("RGB", img.size, (30, 41, 59) if dark else (226, 232, 240))
    rgb = Image.blend(rgb, wash, 0.35 if dark else 0.18)
    return Image.merge("RGBA", (*rgb.split(), a))


def make_overlay(size: tuple[int, int], dark: bool, rng: random.Random) -> Image.Image:
    w, h = size
    ov = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    grid = (148, 163, 184, 38) if dark else (71, 85, 105, 32)
    accent = (251, 146, 60, 160)
    cyan = (125, 211, 252, 120) if dark else (14, 165, 233, 90)
    step = 18
    for x in range(0, w, step):
        d.line([(x, 0), (x, h)], fill=grid, width=1)
    for y in range(0, h, step):
        d.line([(0, y), (w, y)], fill=grid, width=1)
    nodes = [
        (rng.randint(int(w * 0.28), int(w * 0.72)), rng.randint(int(h * 0.08), int(h * 0.92)))
        for _ in range(70)
    ]
    for i, (x1, y1) in enumerate(nodes):
        for j in range(i + 1, min(i + 6, len(nodes))):
            x2, y2 = nodes[j]
            if math.hypot(x2 - x1, y2 - y1) < 90:
                col = accent if rng.random() < 0.22 else cyan
                d.line([(x1, y1), (x2, y2)], fill=(*col[:3], 55 if dark else 45), width=1)
    for x, y in nodes:
        rad = 1 if rng.random() < 0.7 else 2
        col = accent if rng.random() < 0.28 else cyan
        d.ellipse([x - rad, y - rad, x + rad, y + rad], fill=col)
    for _ in range(10):
        x0 = rng.randint(int(w * 0.35), int(w * 0.55))
        y0 = rng.randint(int(h * 0.15), int(h * 0.8))
        pts = []
        x, y = x0, y0
        for _k in range(14):
            pts.append((x, y))
            x += 4
            y += rng.randint(-5, 5)
        d.line(pts, fill=(*cyan[:3], 90), width=1)
    return ov


def thin_edge(alpha: Image.Image, dark: bool) -> Image.Image:
    solid = alpha.point(lambda v: 255 if v > 40 else 0)
    dil = solid.filter(ImageFilter.MaxFilter(3))
    ero = solid.filter(ImageFilter.MinFilter(3))
    edge = ImageChops.subtract(dil, ero).filter(ImageFilter.GaussianBlur(0.6))
    color = (186, 198, 214) if dark else (51, 65, 85)
    e = edge.point(lambda v: int(v * (0.55 if dark else 0.45)))
    layer = Image.new("RGBA", alpha.size, (*color, 0))
    layer.putalpha(e)
    return layer


def compose(cut_path: Path, dark: bool, seed: int) -> Image.Image:
    rng = random.Random(seed + (1 if dark else 0))
    cut = Image.open(cut_path).convert("RGBA")
    base = fit_cutout(cut, OUT_W, OUT_H)
    r, g, b, a = base.split()
    a = a.point(lambda v: 0 if v < 12 else v).filter(ImageFilter.GaussianBlur(0.4))
    base = Image.merge("RGBA", (r, g, b, a))
    graded = clinical_grade(base, dark=dark)
    wash = Image.new("RGBA", graded.size, (15, 23, 42, 0) if dark else (241, 245, 249, 0))
    wash.putalpha(a.point(lambda v: int(v * (0.28 if dark else 0.12))))
    graded = Image.alpha_composite(graded, wash)
    ov = make_overlay(graded.size, dark=dark, rng=rng)
    ov_r, ov_g, ov_b, ov_a = ov.split()
    ov_a = ImageChops.multiply(ov_a, a.point(lambda v: int(v * 0.85)))
    graded = Image.alpha_composite(graded, Image.merge("RGBA", (ov_r, ov_g, ov_b, ov_a)))
    graded = Image.alpha_composite(graded, thin_edge(a, dark=dark))
    fr, fg, fb, _ = graded.split()
    return Image.merge("RGBA", (fr, fg, fb, a))


def save_webp(im: Image.Image, path: Path, quality: int = 82) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)
    print("wrote", path, path.stat().st_size)


def build_figure(name: str) -> None:
    cfg = FIGURES[name]
    cut = cfg["cut"]
    if not cut.exists():
        raise SystemExit(f"missing cutout master for {name}: {cut}")
    # Do not regenerate female from scratch unless cutout exists — still OK to rebuild grade.
    dark = compose(cut, True, cfg["seed"])
    light = compose(cut, False, cfg["seed"])
    for p in cfg["out_dark"]:
        save_webp(dark, p, 84)
    for p in cfg["out_light"]:
        save_webp(light, p, 84)
    d480 = dark.resize((480, int(1747 * 480 / 800)), Image.Resampling.LANCZOS)
    l480 = light.resize((480, int(1747 * 480 / 800)), Image.Resampling.LANCZOS)
    for p in cfg["out_dark_480"]:
        save_webp(d480, p, 80)
    for p in cfg["out_light_480"]:
        save_webp(l480, p, 80)


def main() -> None:
    arg = (sys.argv[1] if len(sys.argv) > 1 else "both").lower().strip()
    if arg in ("both", "all"):
        # Female first (locked master); male second.
        # Skip rewriting female public assets unless --force-female.
        force_female = "--force-female" in sys.argv
        if force_female:
            build_figure("female")
        else:
            # Ensure female named aliases exist without regenerating grade from cutout.
            for src, dst in [
                ("public/hdm-human.webp", "public/hdm-human-female.webp"),
                ("public/hdm-human-light.webp", "public/hdm-human-female-light.webp"),
                ("public/hdm-human-480.webp", "public/hdm-human-female-480.webp"),
                ("public/hdm-human-light-480.webp", "public/hdm-human-female-light-480.webp"),
            ]:
                sp, dp = ROOT / src, ROOT / dst
                if sp.exists() and (not dp.exists() or dp.stat().st_mtime < sp.stat().st_mtime):
                    dp.write_bytes(sp.read_bytes())
                    print("synced", dp)
        build_figure("male")
        return
    if arg not in FIGURES:
        raise SystemExit(f"unknown figure {arg!r}; use female|male|both")
    build_figure(arg)


if __name__ == "__main__":
    main()
