/*
  Migration script: Rename files from legacy date-based naming to
  ID-based naming (Mode-ID.json) using season IDs from the JSON data
  
  - Deadly Assault: data.zone_id
  - Shiyu Defense: data.schedule_id
  - Void Front: data.void_front_battle_abstract_info_brief.void_front_id
*/

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

/**
 * Extract the season ID from API response based on game mode
 */
function getSeasonId(mode, json) {
  if (!json || !json.data) return null;
  
  if (mode === 'deadly') {
    return json.data.zone_id || null;
  } else if (mode === 'shiyu') {
    return json.data.schedule_id || null;
  } else if (mode === 'void-front') {
    return json.data.void_front_battle_abstract_info_brief?.void_front_id || null;
  }
  return null;
}

function buildFileName(mode, seasonId) {
  const modeNames = {
    'deadly': 'deadly-assault',
    'shiyu': 'shiyu-defense',
    'void-front': 'void-front'
  };
  const modeName = modeNames[mode] || 'unknown-mode';
  const idSafe = seasonId != null ? String(seasonId) : 'unknown-id';
  return `${modeName}-${idSafe}.json`;
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
  
  const prefix = mode === 'deadly' ? 'deadly-assault' : (mode === 'void-front' ? 'void-front' : 'shiyu-defense');
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    // Skip already migrated files (new ID-based pattern: prefix-ID.json)
    const idPattern = new RegExp(`^${prefix}-(\\d+)\\.json$`);
    if (idPattern.test(file)) {
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
    
    const seasonId = getSeasonId(mode, json);
    if (seasonId == null) {
      console.warn(`Skipping ${dir}/${file}: could not derive season ID`);
      skipped++;
      continue;
    }
    
    const targetName = buildFileName(mode, seasonId);
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
    await migrateDir('voidFront', 'void-front');
    console.log('Migration completed.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
})();
