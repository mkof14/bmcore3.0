#!/usr/bin/env node
/**
 * Generate anatomical HDM silhouette WebPs (dark/light + 480w).
 * Requires: npm i @resvg/resvg-js  (or run from a folder that has it)
 * and system Python3 + Pillow for the clinical data fill.
 *
 * Usage (from repo root, with resvg available):
 *   node scripts/generate-hdm-human.mjs
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_SVG = join(ROOT, 'scripts/hdm-human-silhouette.svg');

const CX = 200;
const R = [
  [0, 16], [20, 22], [40, 45], [44, 76], [38, 106], [22, 126],
  [16, 138], [17, 156], [38, 168], [80, 176], [108, 194],
  [122, 228], [130, 272], [128, 318], [122, 368], [116, 412], [118, 442], [108, 462],
  [94, 454], [92, 416], [96, 366], [100, 318], [94, 268], [76, 232], [62, 218],
  [66, 248], [68, 288], [64, 328], [54, 368], [58, 402], [72, 432], [70, 458], [52, 478], [28, 492],
  [58, 518], [66, 565], [64, 615], [56, 660], [54, 710], [50, 765], [42, 815],
  [52, 842], [74, 856], [88, 866],
  [70, 860], [50, 846], [38, 822], [40, 770], [42, 715], [42, 665], [40, 615], [38, 565], [32, 525], [18, 502], [0, 495],
];

function toBeziers(points, cx) {
  const cmds = [`M ${cx + points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    cmds.push(`C ${cx + c1x} ${c1y} ${cx + c2x} ${c2y} ${cx + p2[0]} ${p2[1]}`);
  }
  return cmds;
}

const right = toBeziers(R, CX);
const L = [...R].reverse().slice(1).map(([x, y]) => [-x, y]);
const left = [];
for (let i = 0; i < L.length - 1; i++) {
  const p0 = L[Math.max(0, i - 1)];
  const p1 = L[i];
  const p2 = L[i + 1];
  const p3 = L[Math.min(L.length - 1, i + 2)];
  const c1x = p1[0] + (p2[0] - p0[0]) / 6;
  const c1y = p1[1] + (p2[1] - p0[1]) / 6;
  const c2x = p2[0] - (p3[0] - p1[0]) / 6;
  const c2y = p2[1] - (p3[1] - p1[1]) / 6;
  left.push(`C ${CX + c1x} ${c1y} ${CX + c2x} ${c2y} ${CX + p2[0]} ${p2[1]}`);
}

const d = [...right, ...left, 'Z'].join(' ');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1747" viewBox="0 0 400 890">
  <rect width="100%" height="100%" fill="black"/>
  <path d="${d}" fill="white"/>
</svg>`;
writeFileSync(OUT_SVG, svg);
console.log('wrote', OUT_SVG);
console.log('Rasterize + fill with: python3 (Pillow) using this SVG mask — see prior generation session.');
