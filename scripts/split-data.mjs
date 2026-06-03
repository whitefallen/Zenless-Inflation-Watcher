/**
 * split-data.js
 *
 * Reads public/data/zzz-data.json and writes three per-view slices:
 *   public/data/zzz-shiyu.json       → { shiyu: [...] }
 *   public/data/zzz-deadly.json      → { deadlyAssault: [...] }
 *   public/data/zzz-voidfront.json   → { voidFront: [...] }
 *
 * Run: node scripts/split-data.js
 *
 * If zzz-data.json doesn't exist yet, build-data.js is run first automatically.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');
const sourceFile = join(dataDir, 'zzz-data.json');

if (!existsSync(sourceFile)) {
  console.log('zzz-data.json not found — running build-data.js first...');
  mkdirSync(dataDir, { recursive: true });
  execFileSync(process.execPath, [join(__dirname, 'build-data.mjs')], { stdio: 'inherit' });
}

const full = JSON.parse(readFileSync(sourceFile, 'utf8'));

const slices = {
  'zzz-shiyu.json':    { shiyu: full.shiyu },
  'zzz-deadly.json':   { deadlyAssault: full.deadlyAssault },
  'zzz-voidfront.json':{ voidFront: full.voidFront },
};

for (const [file, data] of Object.entries(slices)) {
  const dest = join(dataDir, file);
  writeFileSync(dest, JSON.stringify(data));
  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
  console.log(`✓ ${file}  (${kb} kB)`);
}

const totalKb = (Buffer.byteLength(JSON.stringify(full)) / 1024).toFixed(1);
console.log(`\nSource zzz-data.json: ${totalKb} kB total`);
console.log('Done — per-view files ready.');
