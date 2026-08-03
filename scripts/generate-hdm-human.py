#!/usr/bin/env python3
"""Composite photorealistic HDM human: photo cutout + math overlay treatment.

Female and male public WebPs are LOCKED (see scripts/hdm-locked/ and docs/ops/hdm-figures.md).
By default this script writes previews under .tmp-hdm-out/ and refuses to overwrite
frozen public/hdm-human*.webp paths unless --force is passed.

Usage:
  python3 scripts/generate-hdm-human.py            # both → .tmp-hdm-out/
  python3 scripts/generate-hdm-human.py female
  python3 scripts/generate-hdm-human.py male
  python3 scripts/generate-hdm-human.py male --force   # overwrite locked public assets
"""
from __future__ import annotations

import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_W, OUT_H = 800, 1747
PREVIEW_DIR = ROOT / ".tmp-hdm-out"
LOCKED_DIR = ROOT / "scripts/hdm-locked"

# Canonical frozen production paths — do not overwrite without --force.
FROZEN_PUBLIC = frozenset(
    {
        ROOT / "public/hdm-human-female.webp",
        ROOT / "public/hdm-human-female-light.webp",
        ROOT / "public/hdm-human-female-480.webp",
        ROOT / "public/hdm-human-female-light-480.webp",
        ROOT / "public/hdm-human-male.webp",
        ROOT / "public/hdm-human-male-light.webp",
        ROOT / "public/hdm-human-male-480.webp",
        ROOT / "public/hdm-human-male-light-480.webp",
        # Legacy female aliases
        ROOT / "public/hdm-human.webp",
        ROOT / "public/hdm-human-light.webp",
        ROOT / "public/hdm-human-480.webp",
        ROOT / "public/hdm-human-light-480.webp",
    }
)

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


def _alpha_bbox(alpha: Image.Image, thresh: int = 16) -> tuple[int, int, int, int]:
    """Tight bbox ignoring fringe alpha so wide poses don't inflate empty padding."""
    solid = alpha.point(lambda v: 255 if v >= thresh else 0)
    bbox = solid.getbbox()
    if not bbox:
        raise SystemExit("empty cutout")
    return bbox


def _optical_cx(alpha: Image.Image, thresh: int = 40) -> float:
    """Mean horizontal midline of solid rows (body axis), ignoring soft fringe."""
    solid = alpha.point(lambda v: 255 if v >= thresh else 0)
    bbox = solid.getbbox()
    if not bbox:
        # Fall back to any-alpha bbox center.
        bbox = alpha.getbbox()
        if not bbox:
            raise SystemExit("empty cutout")
        return (bbox[0] + bbox[2]) * 0.5
    x0, y0, x1, y1 = bbox
    px = solid.load()
    mids: list[float] = []
    for y in range(y0, y1):
        left = None
        right = None
        for x in range(x0, x1):
            if px[x, y]:
                if left is None:
                    left = x
                right = x
        if left is not None and right is not None:
            mids.append((left + right) * 0.5)
    if not mids:
        return (x0 + x1) * 0.5
    return sum(mids) / len(mids)


# Female-locked placement on the 800×1747 canvas (bodyCubes / hotspot reference).
_FEMALE_TOP_FRAC = 74 / 1747
_FEMALE_OPTICAL_CX_FRAC = 403.6 / 800  # measured solid mid-of-row on locked female WebP


def fit_cutout(cut: Image.Image, tw: int, th: int, pad_frac: float = 0.045) -> Image.Image:
    """Fit cutout into OUT canvas with consistent head-to-toe height.

    Height is the primary constraint (match female ~90% frame). Wide poses may
    exceed canvas width and are cropped — never shrink the whole figure to
    preserve side padding (that left male ~61% tall).

    Horizontal placement uses the solid-body optical axis (not the soft-alpha
    bbox). Male cutouts carry a wide left fringe that used to bias center-crop
    ~140px right of the hotspot column. Vertical top + optical CX match female.
    """
    a = cut.split()[-1]
    # Soft silhouette extent (hair/feet fringe); optical axis uses solid body.
    bbox = _alpha_bbox(a, thresh=16)
    person = cut.crop(bbox)
    pw, ph = person.size
    opt_cx = _optical_cx(person.split()[-1], thresh=40)

    max_h = int(th * (1 - 2 * pad_frac))
    scale = max_h / ph
    nw, nh = max(1, int(pw * scale)), max(1, int(ph * scale))
    opt_cx *= scale
    person = person.resize((nw, nh), Image.Resampling.LANCZOS)

    # Place so body midline → female optical CX (hotspot axis). x may be negative
    # (drop left fringe) or person may overhang the right — composite overlap only.
    target_cx = tw * _FEMALE_OPTICAL_CX_FRAC
    x = int(round(target_cx - opt_cx))
    y = int(round(th * _FEMALE_TOP_FRAC))
    y = max(0, min(y, th - nh))

    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    src_x0 = max(0, -x)
    dst_x0 = max(0, x)
    copy_w = min(nw - src_x0, tw - dst_x0)
    if copy_w > 0:
        tile = person.crop((src_x0, 0, src_x0 + copy_w, nh))
        canvas.alpha_composite(tile, (dst_x0, y))
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


def clean_feet_alpha(img: Image.Image) -> Image.Image:
    """Strip studio-floor spill under ankles; keep foot silhouettes intact."""
    w, h = img.size
    alpha = img.split()[-1].point(lambda v: 255 if v >= 40 else 0)
    bbox = alpha.getbbox()
    if not bbox:
        return img
    _x0, _y0, _x1, y1 = bbox
    # Bottom ~7% of the figure bbox: kill dark/low-alpha floor fringe.
    y_zone = max(0, y1 - max(22, int((y1 - _y0) * 0.07)))
    px = img.load()
    for y in range(y_zone, h):
        # Stronger kill on the very last rows (sole contact / floor plate).
        bottom_boost = (y - y_zone) / max(1, (h - 1 - y_zone))
        for x in range(w):
            rr, gg, bb, aa = px[x, y]
            if aa == 0:
                continue
            lum = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
            # Floor spill is dark / semi-transparent; real feet stay brighter.
            if aa < 110 and lum < (78 if bottom_boost > 0.55 else 68):
                px[x, y] = (0, 0, 0, 0)
            elif lum < (38 if bottom_boost > 0.55 else 30) and aa < 210:
                px[x, y] = (0, 0, 0, 0)
            elif aa < (70 if bottom_boost > 0.45 else 50):
                px[x, y] = (0, 0, 0, 0)
    # Soften only the bottom band edge.
    r, g, b, a = img.split()
    band = Image.new("L", (w, h), 0)
    bd = ImageDraw.Draw(band)
    bd.rectangle([0, y_zone, w, h], fill=255)
    a_blur = a.filter(ImageFilter.GaussianBlur(0.5))
    a = Image.composite(a_blur, a, band)
    return Image.merge("RGBA", (r, g, b, a))


def soften_crown_hair(img: Image.Image) -> Image.Image:
    """Lift crushed hair blacks / compress harsh highlights near the crown."""
    w, h = img.size
    r, g, b, a = img.split()
    rgb = Image.merge("RGB", (r, g, b))
    # Soft blurred plate — reduces crunchy specular grain in short hair.
    soft = rgb.filter(ImageFilter.GaussianBlur(2.2))
    soft = ImageEnhance.Contrast(soft).enhance(0.72)
    soft = ImageEnhance.Brightness(soft).enhance(1.14)
    # Cool slate wash matching clinical body grade.
    wash = Image.new("RGB", (w, h), (58, 70, 88))
    soft = Image.blend(soft, wash, 0.22)

    alpha = a.point(lambda v: 255 if v >= 40 else 0)
    bbox = alpha.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    fh = max(1, y1 - y0)
    fw = max(1, x1 - x0)
    # Crown region: top ~14% of figure height, centered.
    y_end = y0 + max(14, int(fh * 0.14))
    cx = (x0 + x1) * 0.5
    rx = fw * 0.32
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse(
        [int(cx - rx), y0 - int(fh * 0.02), int(cx + rx), y_end],
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(10))
    # Don't over-soften bright facial skin inside the ellipse.
    lum = rgb.convert("L")
    face_protect = lum.point(lambda v: 0 if v < 95 else min(255, int((v - 95) * 3.6)))
    face_protect = ImageChops.multiply(face_protect, mask)
    mask = ImageChops.subtract(mask, face_protect.point(lambda v: int(v * 0.9)))
    mask = ImageChops.multiply(mask, a)
    # Stronger mix on darkest hair (crushed blacks), lighter on midtones.
    dark_boost = lum.point(lambda v: 255 if v < 70 else max(0, 255 - int((v - 70) * 2.2)))
    mask = ImageChops.lighter(mask, ImageChops.multiply(mask, dark_boost).point(lambda v: int(v * 0.55)))
    mask = ImageChops.multiply(mask, a)

    blended = Image.composite(soft, rgb, mask)
    return Image.merge("RGBA", (*blended.split(), a))


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


def compose(cut_path: Path, dark: bool, seed: int, *, male: bool = False) -> Image.Image:
    rng = random.Random(seed + (1 if dark else 0))
    cut = Image.open(cut_path).convert("RGBA")
    if male:
        cut = clean_feet_alpha(cut)
    base = fit_cutout(cut, OUT_W, OUT_H)
    if male:
        # Second pass after fit: catch any residual floor that scaled into frame.
        base = clean_feet_alpha(base)
    r, g, b, a = base.split()
    # Male: slightly higher floor threshold kills leftover studio fringe.
    a = a.point(lambda v: 0 if v < (18 if male else 12) else v).filter(ImageFilter.GaussianBlur(0.4))
    base = Image.merge("RGBA", (r, g, b, a))
    graded = clinical_grade(base, dark=dark)
    if male:
        graded = soften_crown_hair(graded)
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


def _is_frozen(path: Path) -> bool:
    try:
        return path.resolve() in {p.resolve() for p in FROZEN_PUBLIC}
    except OSError:
        return path in FROZEN_PUBLIC


def save_webp(im: Image.Image, path: Path, quality: int = 82, *, force: bool = False) -> None:
    if _is_frozen(path) and not force:
        raise SystemExit(
            f"refusing to overwrite locked HDM asset: {path}\n"
            f"  masters: {LOCKED_DIR}\n"
            f"  pass --force only with explicit approval (see docs/ops/hdm-figures.md)\n"
            f"  or omit --force to write previews under {PREVIEW_DIR}/"
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)
    print("wrote", path, path.stat().st_size)


def _remap_outs(paths: list[Path], *, force: bool) -> list[Path]:
    """Without --force, redirect frozen public paths into PREVIEW_DIR."""
    if force:
        return paths
    remapped: list[Path] = []
    for p in paths:
        if _is_frozen(p):
            remapped.append(PREVIEW_DIR / p.name)
        else:
            remapped.append(p)
    return remapped


def build_figure(name: str, *, force: bool = False) -> None:
    cfg = FIGURES[name]
    cut = cfg["cut"]
    if not cut.exists():
        raise SystemExit(f"missing cutout master for {name}: {cut}")
    male = name == "male"
    dark = compose(cut, True, cfg["seed"], male=male)
    light = compose(cut, False, cfg["seed"], male=male)
    out_dark = _remap_outs(cfg["out_dark"], force=force)
    out_light = _remap_outs(cfg["out_light"], force=force)
    out_dark_480 = _remap_outs(cfg["out_dark_480"], force=force)
    out_light_480 = _remap_outs(cfg["out_light_480"], force=force)
    if not force:
        print(f"preview mode for {name}: writing under {PREVIEW_DIR} (public/ locked)")
    for p in out_dark:
        save_webp(dark, p, 84, force=force)
    for p in out_light:
        save_webp(light, p, 84, force=force)
    d480 = dark.resize((480, int(1747 * 480 / 800)), Image.Resampling.LANCZOS)
    l480 = light.resize((480, int(1747 * 480 / 800)), Image.Resampling.LANCZOS)
    for p in out_dark_480:
        save_webp(d480, p, 80, force=force)
    for p in out_light_480:
        save_webp(l480, p, 80, force=force)


def main() -> None:
    args = [a.lower().strip() for a in sys.argv[1:]]
    force = "--force" in args or "--force-female" in args
    # Keep --force-female as alias for --force (female-only historical flag).
    figures = [a for a in args if a not in ("--force", "--force-female")]
    arg = figures[0] if figures else "both"
    if arg in ("both", "all"):
        build_figure("female", force=force)
        build_figure("male", force=force)
        return
    if arg not in FIGURES:
        raise SystemExit(f"unknown figure {arg!r}; use female|male|both [--force]")
    build_figure(arg, force=force)


if __name__ == "__main__":
    main()
