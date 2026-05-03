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
 * The app shell lazy-loads these files instead of the monolithic zzz-data.json,
 * so navigating directly to #shiyu only fetches shiyu data.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

const full = JSON.parse(readFileSync(join(dataDir, 'zzz-data.json'), 'utf8'));

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
