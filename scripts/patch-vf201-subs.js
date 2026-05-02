import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'public', 'data', 'zzz-data.json');
const rawPath = join(__dirname, '..', '..', '..', '..', 'voidFront', 'void-front-201.json');

const raw = JSON.parse(readFileSync(rawPath, 'utf8')).data;
const battles = raw.void_front_battle_detail.main_challenge_record_list;

function mapAvatar(a) {
  return {
    id: a.id,
    level: a.level,
    rarity: a.rarity,
    element: a.element_type,
    profession: a.avatar_profession,
    rank: a.rank,
    url: a.role_square_url,
  };
}

function mapSub(s) {
  return {
    name: s.name,
    star: s.star,
    buffer: s.buffer ? { name: s.buffer.name, icon: s.buffer.icon } : undefined,
    avatars: (s.avatar_list || []).map(mapAvatar),
    buddy: s.buddy ? { id: s.buddy.id, url: s.buddy.bangboo_rectangle_url } : undefined,
  };
}

// Collect all sub-challenges across all battles, in order (battle 1 subs first, then battle 2)
const allSubs = [];
for (const battle of [...battles].reverse()) {
  for (const sub of (battle.sub_challenge_record || [])) {
    allSubs.push(mapSub(sub));
  }
}

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const vf201 = data.voidFront.find(p => p.void_front_id === 201);
if (!vf201) throw new Error('VF 201 not found');

vf201.main.sub_challenges = allSubs;
writeFileSync(dataPath, JSON.stringify(data));
console.log(`Patched VF 201: added ${allSubs.length} sub-challenges (${allSubs.map(s => s.name).join(', ')})`);
