# Locked HDM figure WebPs (canonical masters)

**DO NOT regenerate or overwrite these files without an explicit user request.**

These are bit-identical copies of the frozen production assets served from `public/`:

| File | Role |
|------|------|
| `hdm-human-female.webp` (+ `-light`, `-480`, `-light-480`) | Female figure (dark / light / responsive) |
| `hdm-human-male.webp` (+ `-light`, `-480`, `-light-480`) | Male figure (dark / light / responsive) |
| `hdm-human.webp` (+ `-light`, `-480`, `-light-480`) | Legacy aliases of the female set |

## Runtime paths

The app serves from `public/hdm-human-{female,male}*.webp` (see `src/components/home/humanDataModel/humanAsset.ts`). Do not change those URLs casually.

## Intentionally updating

1. Get an explicit go-ahead from the product owner.
2. Rebuild with force:  
   `python3 scripts/generate-hdm-human.py female --force`  
   `python3 scripts/generate-hdm-human.py male --force`
3. Re-copy the new public WebPs into this folder.
4. Bump `FIGURE_CACHE` in `HumanSilhouette.tsx` once.
5. Update `docs/ops/hdm-figures.md` and deploy.

Without `--force`, `scripts/generate-hdm-human.py` refuses to write any frozen `public/hdm-human*.webp` path.
