#!/usr/bin/env node
/**
 * Rebuild HDM human WebPs from the photographic cutout master.
 *
 * Source masters (checked in):
 *   scripts/hdm-human-photo-base.png   — full-body standing photo
 *   scripts/hdm-human-photo-cutout.png — alpha cutout (rembg)
 *
 * Output:
 *   public/hdm-human.webp (+ light + 480w variants)
 *
 * Usage (repo root, Pillow required; rembg only if regenerating cutout):
 *   python3 scripts/generate-hdm-human.py
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const py = join(ROOT, 'scripts/generate-hdm-human.py');

const r = spawnSync('python3', [py], { cwd: ROOT, stdio: 'inherit' });
process.exit(r.status ?? 1);
