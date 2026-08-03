# People photo grade (marketing)

## Goal

Unify mixed stock people photography under a cool-slate clinical look that matches BioMath Core (slate + sparse orange), without a full custom 3D / studio shoot.

## Approach

1. **Shared CSS** — class `bm-people-photo` (slight desaturate, cool hue shift) plus `bm-people-photo-wash` (slate → soft orange soft-light wash).
2. **Applied on**
   - `PageHero` (all marketing + Member Zone section banners)
   - Home: `WhatCanYouUnderstand`, `EverythingChanges`, `HumanDataTimeline` still
   - Catalog: category cards + category detail hero (`ServicesCatalog`)
   - Home grid: `HealthCategories` tiles
   - Blog featured images (seed covers are data-viz; class still applied for any remote people URLs)
   - Testimonials avatars (`bm-people-photo` filter only)
3. **Asset regrade** — people WebPs under `public/hero/` and `public/home/` re-exported with a cooler slate grade (desaturate + blue lift + light brand wash).

## Lifestyle / food covers (do not use)

Warm kitchen / food / library stock is **banned** for heroes and category cards.

| Was wrong | Replacement |
|-----------|-------------|
| `public/hero/img_12.webp` family breakfast (“milk and honey” kitchen) | Brand data-viz grid + orange signal (`family-health`) |
| Learning / blog library or food covers | Brand data-viz WebPs (`/hero/pages/learning.webp`, `/blog/cover-*.webp`) |
| Contact Scrabble “CONTACT US” lifestyle flat-lay | Brand data-viz bars (`/hero/pages/contact.webp`) |
| Nutrition / environmental nature fillers | Data-viz `img_09` / `img_10` |

After replacing a hero asset, bump `HERO_CACHE` in `src/data/pageHeroes.ts`.

## Residuals

- Poses, framing, and lighting still differ across stock sources — grade unifies *color*, not composition.
- Full custom photo / 3D shoot remains out of scope.
- Remote Supabase blog `featured_image` URLs (if any) are not rewritten server-side; CSS grade applies in the client; seed posts use `/blog/cover-*.webp`.
- Tiny UI avatars (member profile, admin) may omit the wash layer; prefer `bm-people-photo` when the face is visible.

## HDM figures (separate)

Home Human Data Model female/male cutouts are **locked** and are not part of this marketing photo-grade pass. See `docs/ops/hdm-figures.md`. Do not regenerate `scripts/hdm-locked/` or `public/hdm-human-*` in this workflow.
