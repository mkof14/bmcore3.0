# HDM female / male figures (locked)

Photorealistic Human Data Model silhouettes used on the home HDM block.

## Status

**Female and male WebPs are locked.** Treat the current set as canonical. Do not regenerate random stock photos or overwrite production files unless product explicitly asks.

- Served from: `public/hdm-human-female*.webp`, `public/hdm-human-male*.webp`
- Legacy female aliases: `public/hdm-human.webp` (+ light / 480 variants)
- Bit-identical masters: `scripts/hdm-locked/` (see README there)
- App paths: `src/components/home/humanDataModel/humanAsset.ts`
- Cache bust query: `FIGURE_CACHE` in `HumanSilhouette.tsx` (bump only when assets intentionally change)

## Generator protection

`scripts/generate-hdm-human.py` (and the thin `generate-hdm-human.mjs` wrapper) **will not overwrite** frozen `public/hdm-human*.webp` paths unless you pass `--force`.

Safe defaults:

```bash
# Preview-only: writes under .tmp-hdm-out/ (does not touch public/)
python3 scripts/generate-hdm-human.py male
python3 scripts/generate-hdm-human.py both
```

Intentional production update:

```bash
python3 scripts/generate-hdm-human.py female --force
python3 scripts/generate-hdm-human.py male --force
cp public/hdm-human-female*.webp public/hdm-human-male*.webp public/hdm-human.webp public/hdm-human-light*.webp public/hdm-human-480.webp scripts/hdm-locked/
# bump FIGURE_CACHE, commit, deploy
```

## Related

- People marketing photo grade (unrelated stock): `docs/ops/photo-grade.md`
