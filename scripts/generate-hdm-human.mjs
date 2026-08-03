#!/usr/bin/env node
/**
 * Rebuild HDM human WebPs from photographic cutout masters.
 *
 * Source masters (checked in):
 *   scripts/hdm-human-female-photo-cutout.png — locked female alpha cutout
 *   scripts/hdm-human-male-photo-cutout.png   — male alpha cutout
 *   (legacy aliases: hdm-human-photo-cutout.png / photo-base.png)
 *
 * Output:
 *   public/hdm-human-female*.webp (+ legacy hdm-human*.webp aliases)
 *   public/hdm-human-male*.webp
 *
 * Usage (repo root, Pillow required):
 *   python3 scripts/generate-hdm-human.py          # male + sync female aliases
 *   python3 scripts/generate-hdm-human.py male
 *   python3 scripts/generate-hdm-human.py female --force-female
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const py = join(ROOT, 'scripts/generate-hdm-human.py');

const r = spawnSync('python3', [py], { cwd: ROOT, stdio: 'inherit' });
process.exit(r.status ?? 1);
