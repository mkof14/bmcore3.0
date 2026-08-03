#!/usr/bin/env node
/**
 * Rebuild HDM human WebPs from photographic cutout masters.
 *
 * Female and male public assets are LOCKED. Default writes go to .tmp-hdm-out/.
 * Pass --force only with explicit approval to overwrite public/hdm-human*.webp.
 *
 * Source masters (checked in):
 *   scripts/hdm-human-female-photo-cutout.png
 *   scripts/hdm-human-male-photo-cutout.png
 * Locked WebP copies:
 *   scripts/hdm-locked/  (see README + docs/ops/hdm-figures.md)
 *
 * Usage (repo root, Pillow required):
 *   python3 scripts/generate-hdm-human.py              # preview → .tmp-hdm-out/
 *   python3 scripts/generate-hdm-human.py male
 *   python3 scripts/generate-hdm-human.py female --force
 *   python3 scripts/generate-hdm-human.py both --force
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const py = join(ROOT, 'scripts/generate-hdm-human.py');

const extra = process.argv.slice(2);
const r = spawnSync('python3', [py, ...extra], { cwd: ROOT, stdio: 'inherit' });
process.exit(r.status ?? 1);
