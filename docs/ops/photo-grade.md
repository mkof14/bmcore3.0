# People photo grade (marketing)

## Goal

Unify mixed stock people photography under a cool-slate clinical look that matches BioMath Core (slate + sparse orange), without a full custom 3D / studio shoot.

## Approach

1. **Shared CSS** — class `bm-people-photo` (slight desaturate, cool hue shift) plus `bm-people-photo-wash` (slate → soft orange soft-light wash).
2. **Applied on** — `PageHero` marketing/member banners, Home `WhatCanYouUnderstand` portrait, Home `EverythingChanges` life portraits.
3. **Asset regrade** — worst outliers (purple-glow portrait, mismatched lifestyle heroes, food/nature catalog fillers) were re-exported as cooler WebP assets under `public/`.

## Residuals

- Poses, framing, and lighting still differ across stock sources — grade unifies *color*, not composition.
- Category heroes that were already abstract/clinical were left as-is; nutrition / environmental nature stock was replaced with brand data-grid WebPs.
- Remote Supabase blog `featured_image` URLs (if any) are not rewritten client-side; seed posts use `/blog/cover-*.webp`.
