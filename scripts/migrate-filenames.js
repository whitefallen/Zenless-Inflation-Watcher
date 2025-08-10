/*
  Migration script: Rename files from legacy month_week.json to
  Mode-YYYY-MM-DD-YYYY-MM-DD.json when season dates can be derived
*/

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

function toYMD(date) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function timestampObjectToDateString(ts) {
  if (!ts || typeof ts !== 'object') return null;
  const d = new Date(Date.UTC(ts.year, (ts.month || 1) - 1, ts.day || 1));
  return toYMD(d);
}

function parsePossiblyEpochString(v) {
  if (!v) return null;
  if (typeof v === 'string' && /^\d+$/.test(v)) {
    const ms = Number(v) * 1000;
    return toYMD(ms);
  }
  if (typeof v === 'number') {
    return toYMD(v * 1000);
  }
  try {
    return toYMD(new Date(v));
  } catch {
    return null;
  }
}

function deriveWindow(mode, json) {
  if (!json || !json.data) return { start: null, end: null };
  if (mode === 'deadly') {
    const start = timestampObjectToDateString(json.data.start_time);
    const end = timestampObjectToDateString(json.data.end_time);
    return { start, end };
  }
  // shiyu
  const start =
    timestampObjectToDateString(json.data.hadal_begin_time) ||
    parsePossiblyEpochString(json.data.begin_time);
  const end =
    timestampObjectToDateString(json.data.hadal_end_time) ||
    parsePossiblyEpochString(json.data.end_time);
  return { start, end };
}

function buildFileName(mode, start, end) {
  const modeName = mode === 'deadly' ? 'deadly-assault' : 'shiyu-defense';
  const startSafe = start || 'unknown-start';
  const endSafe = end || 'unknown-end';
  return `${modeName}-${startSafe}-${endSafe}.json`;
}

async function migrateDir(dir, mode) {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) {
    console.log(`Skipping ${dir}: not found`);
    return;
  }
  const files = await fsp.readdir(full);
  let migrated = 0;
  let skipped = 0;
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    // skip already migrated files
    if (/^(deadly-assault|shiyu-defense)-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.json$/.test(file)) {
      continue;
    }
    const srcPath = path.join(full, file);
    let json;
    try {
      const content = await fsp.readFile(srcPath, 'utf-8');
      json = JSON.parse(content);
    } catch (e) {
      console.warn(`Skipping ${dir}/${file}: unreadable JSON`);
      skipped++;
      continue;
    }
    const { start, end } = deriveWindow(mode, json);
    if (!start || !end) {
      console.warn(`Skipping ${dir}/${file}: could not derive season window`);
      skipped++;
      continue;
    }
    const targetName = buildFileName(mode, start, end);
    const dstPath = path.join(full, targetName);
    if (fs.existsSync(dstPath)) {
      console.warn(`Conflict for ${dir}/${file} -> ${targetName}: target exists. Leaving original in place.`);
      skipped++;
      continue;
    }
    await fsp.rename(srcPath, dstPath);
    console.log(`Renamed ${dir}/${file} -> ${targetName}`);
    migrated++;
  }
  console.log(`Done ${dir}: migrated=${migrated}, skipped=${skipped}`);
}

(async () => {
  try {
    await migrateDir('deadlyAssault', 'deadly');
    await migrateDir('shiyu', 'shiyu');
    console.log('Migration completed.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
})();


