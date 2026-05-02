const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const zzzDataPath = path.join(root, 'public/data/zzz-data.json');
const daDir = path.join(root, 'deadlyAssault');

const zzzData = JSON.parse(fs.readFileSync(zzzDataPath, 'utf8'));

// Key a timestamp object as "YYYY-MM-DD"
function tsKey(ts) {
  if (!ts) return null;
  return `${ts.year}-${String(ts.month).padStart(2,'0')}-${String(ts.day).padStart(2,'0')}`;
}

// Build start_time_key -> { total_max_score, room_max_score, zone_id } from raw DA files
const maxScoreMap = {};
fs.readdirSync(daDir)
  .filter(f => f.endsWith('.json') && !f.includes('unknown-id'))
  .forEach(f => {
    const raw = JSON.parse(fs.readFileSync(path.join(daDir, f), 'utf8'));
    const d = raw.data || raw;
    const key = tsKey(d.start_time);
    if (key && d.total_max_score != null) {
      maxScoreMap[key] = {
        zone_id: d.zone_id,
        total_max_score: d.total_max_score,
        room_max_score: d.room_max_score,
      };
    }
  });

let patched = 0;
let missed = 0;
zzzData.deadlyAssault = zzzData.deadlyAssault.map(period => {
  const key = tsKey(period.start_time);
  if (key && maxScoreMap[key]) {
    patched++;
    const { zone_id, total_max_score, room_max_score } = maxScoreMap[key];
    return { ...period, zone_id, total_max_score, room_max_score };
  }
  missed++;
  return period;
});

fs.writeFileSync(zzzDataPath, JSON.stringify(zzzData, null, 2));
console.log(`Patched ${patched} DA periods, missed ${missed}.`);
