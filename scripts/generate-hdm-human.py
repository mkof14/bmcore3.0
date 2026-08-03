#!/usr/bin/env python3
"""Composite photorealistic HDM human: photo cutout + math overlay treatment."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
CUT = ROOT / "scripts/hdm-human-photo-cutout.png"
OUT_W, OUT_H = 800, 1747
rng = random.Random(42)


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


def make_overlay(size: tuple[int, int], dark: bool) -> Image.Image:
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


def compose(dark: bool) -> Image.Image:
    cut = Image.open(CUT).convert("RGBA")
    base = fit_cutout(cut, OUT_W, OUT_H)
    r, g, b, a = base.split()
    a = a.point(lambda v: 0 if v < 12 else v).filter(ImageFilter.GaussianBlur(0.4))
    base = Image.merge("RGBA", (r, g, b, a))
    graded = clinical_grade(base, dark=dark)
    wash = Image.new("RGBA", graded.size, (15, 23, 42, 0) if dark else (241, 245, 249, 0))
    wash.putalpha(a.point(lambda v: int(v * (0.28 if dark else 0.12))))
    graded = Image.alpha_composite(graded, wash)
    ov = make_overlay(graded.size, dark=dark)
    ov_r, ov_g, ov_b, ov_a = ov.split()
    ov_a = ImageChops.multiply(ov_a, a.point(lambda v: int(v * 0.85)))
    graded = Image.alpha_composite(graded, Image.merge("RGBA", (ov_r, ov_g, ov_b, ov_a)))
    graded = Image.alpha_composite(graded, thin_edge(a, dark=dark))
    fr, fg, fb, _ = graded.split()
    return Image.merge("RGBA", (fr, fg, fb, a))


def save_webp(im: Image.Image, path: Path, quality: int = 82) -> None:
    im.save(path, "WEBP", quality=quality, method=6)
    print("wrote", path, path.stat().st_size)


def main() -> None:
    if not CUT.exists():
        raise SystemExit(f"missing cutout master: {CUT}")
    dark = compose(True)
    light = compose(False)
    save_webp(dark, ROOT / "public/hdm-human.webp", 84)
    save_webp(light, ROOT / "public/hdm-human-light.webp", 84)
    d480 = dark.resize((480, int(1747 * 480 / 800)), Image.Resampling.LANCZOS)
    l480 = light.resize((480, int(1747 * 480 / 800)), Image.Resampling.LANCZOS)
    save_webp(d480, ROOT / "public/hdm-human-480.webp", 80)
    save_webp(l480, ROOT / "public/hdm-human-light-480.webp", 80)


if __name__ == "__main__":
    main()
