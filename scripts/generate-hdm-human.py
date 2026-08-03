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


def soften_crown_hair(img: Image.Image, *, dark: bool) -> Image.Image:
    """Crush short-hair specular just under the silhouette top — never the forehead."""
    # Local import keeps the rest of the module Pillow-only at import time.
    import numpy as np

    arr = np.array(img)
    rgb = arr[..., :3].astype(np.float32)
    a = arr[..., 3].astype(np.float32)
    lum = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    h, w = a.shape
    opaque = a >= 40
    if not opaque.any():
        return img

    top_y = np.full(w, h, dtype=np.int32)
    for x in range(w):
        col = np.where(opaque[:, x])[0]
        if len(col):
            top_y[x] = int(col[0])
    k = 21
    pad = np.pad(top_y.astype(np.float32), (k // 2, k // 2), mode="edge")
    top_s = np.convolve(pad, np.ones(k) / k, mode="valid")

    ys = np.where(opaque)[0]
    y0, y1 = int(ys.min()), int(ys.max())
    fh = max(1, y1 - y0)
    xs = np.where(opaque)[1]
    x0, x1 = int(xs.min()), int(xs.max())
    cx = (x0 + x1) * 0.5
    fw = max(1, x1 - x0)

    yy = np.arange(h, dtype=np.float32)[:, None]
    xx = np.arange(w, dtype=np.float32)[None, :]
    dist = yy - top_s[None, :]
    # Tight band from silhouette crown only (avoids forehead).
    depth = fh * (0.042 if dark else 0.038)
    hair = opaque & (dist >= -1.5) & (dist <= depth) & (np.abs(xx - cx) <= fw * 0.36)
    temple = (
        opaque
        & (np.abs(xx - cx) > fw * 0.20)
        & (np.abs(xx - cx) <= fw * 0.40)
        & (dist >= -1.5)
        & (dist <= fh * 0.075)
    )
    hair = hair | temple

    # Light mode: short hair reads silvery on pale UI — darken the whole crown band.
    # Dark mode: only crush hot specular speckles.
    thr = 108.0 if dark else 70.0
    hot = hair & (lum >= thr)
    if not hot.any():
        return img

    dark_ref = hair & (lum < (80 if dark else 95))
    if dark_ref.sum() > 40:
        ref = np.median(rgb[dark_ref], axis=0).astype(np.float32)
    else:
        ref = np.array([50.0, 42.0, 36.0] if dark else [58.0, 48.0, 40.0], dtype=np.float32)

    m = np.zeros((h, w), dtype=np.float32)
    if dark:
        m[hot] = np.clip((lum[hot] - thr) / 55.0, 0.45, 0.92)
    else:
        # Even midtone crown hair gets pulled toward brown on light plates.
        m[hot] = np.clip(0.35 + (lum[hot] - thr) / 90.0, 0.35, 0.88)
    m_img = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(1.6)
    )
    m = np.array(m_img).astype(np.float32) / 255.0
    # Hard stop: no spill onto forehead / face.
    m[dist > depth * 1.25] = 0
    m[dist > fh * 0.09] = 0
    m[~opaque] = 0

    blur = np.array(
        Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    ).astype(np.float32)
    tex = (lum - blur) * 0.18
    mul = 0.86 + np.clip(blur, 0, 160) / 160.0 * 0.30
    target = np.clip(ref[None, None, :] * mul[..., None] + tex[..., None], 0, 255)
    out = rgb * (1.0 - m[..., None]) + target * m[..., None]
    arr[..., :3] = np.clip(out, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


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


def thin_edge(alpha: Image.Image, dark: bool, *, male: bool = False) -> Image.Image:
    solid = alpha.point(lambda v: 255 if v > 40 else 0)
    dil = solid.filter(ImageFilter.MaxFilter(3))
    ero = solid.filter(ImageFilter.MinFilter(3))
    edge = ImageChops.subtract(dil, ero).filter(ImageFilter.GaussianBlur(0.6))
    color = (186, 198, 214) if dark else (51, 65, 85)
    strength = 0.55 if dark else 0.45
    if male:
        # Male short-hair fringe reads as blown white if the rim is too bright.
        strength *= 0.55 if dark else 0.7
        color = (120, 132, 148) if dark else (55, 60, 70)
    e = edge.point(lambda v: int(v * strength))
    # Further fade the crown rim for male.
    if male:
        bbox = solid.getbbox()
        if bbox:
            x0, y0, x1, y1 = bbox
            fh = max(1, y1 - y0)
            fade = Image.new("L", alpha.size, 255)
            fd = ImageDraw.Draw(fade)
            fd.ellipse(
                [x0 - 20, y0 - 20, x1 + 20, y0 + int(fh * 0.14)],
                fill=90,
            )
            fade = fade.filter(ImageFilter.GaussianBlur(18))
            e = ImageChops.multiply(e, fade)
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
    wash = Image.new("RGBA", graded.size, (15, 23, 42, 0) if dark else (241, 245, 249, 0))
    wash.putalpha(a.point(lambda v: int(v * (0.28 if dark else 0.12))))
    graded = Image.alpha_composite(graded, wash)
    ov = make_overlay(graded.size, dark=dark, rng=rng)
    ov_r, ov_g, ov_b, ov_a = ov.split()
    ov_a = ImageChops.multiply(ov_a, a.point(lambda v: int(v * 0.85)))
    if male:
        # Soften math overlay on the crown so short hair isn't read as blown white.
        bbox = a.point(lambda v: 255 if v >= 40 else 0).getbbox()
        if bbox:
            x0, y0, x1, y1 = bbox
            fh = max(1, y1 - y0)
            crown_fade = Image.new("L", graded.size, 255)
            cd = ImageDraw.Draw(crown_fade)
            cd.ellipse(
                [x0 - 30, y0 - 24, x1 + 30, y0 + int(fh * 0.12)],
                fill=55,
            )
            crown_fade = crown_fade.filter(ImageFilter.GaussianBlur(16))
            ov_a = ImageChops.multiply(ov_a, crown_fade)
    graded = Image.alpha_composite(graded, Image.merge("RGBA", (ov_r, ov_g, ov_b, ov_a)))
    graded = Image.alpha_composite(graded, thin_edge(a, dark=dark, male=male))
    # Hair recovery last so wash/overlay/edge cannot re-blow the crown.
    if male:
        graded = soften_crown_hair(graded, dark=dark)
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
