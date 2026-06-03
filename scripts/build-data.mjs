import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(__dirname, '..', 'public', 'data', 'zzz-data.json');

// Ensure public/data/ exists (it's gitignored so won't be present in CI)
mkdirSync(join(__dirname, '..', 'public', 'data'), { recursive: true });

function mapAvatar(a) {
  return {
    id: a.id,
    level: a.level,
    rarity: a.rarity,
    element: a.element_type ?? a.element,
    profession: a.avatar_profession ?? a.profession,
    rank: a.rank,
    sub: a.sub_element_type ?? a.sub ?? 0,
    url: a.role_square_url ?? a.url,
  };
}

function mapBuddy(b) {
  if (!b) return undefined;
  return { id: b.id, rarity: b.rarity, url: b.bangboo_rectangle_url ?? b.url };
}

// ── SHIYU ────────────────────────────────────────────────────────────────────
function buildShiyu() {
  const dir = join(ROOT, 'shiyu');
  const files = readdirSync(dir).filter(
    f => f.endsWith('.json') && !f.includes('unknown')
  );

  const periods = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (!raw.data || !raw.data.hadal_info_v2) continue; // skip old schema / null

    const info = raw.data.hadal_info_v2;
    const layers = (info.fitfh_layer_detail?.layer_challenge_info_list ?? []).map(l => ({
      layer_id: l.layer_id,
      rating: l.rating,
      score: l.score,
      max_score: l.max_score,
      buffer: l.buffer,
      challenge_time: l.challenge_time,
      avatars: (l.avatar_list ?? []).map(mapAvatar),
      buddy: mapBuddy(l.buddy),
    }));

    periods.push({
      zone_id: info.zone_id,
      begin: info.hadal_begin_time,
      end: info.hadal_end_time,
      pass5: info.pass_fifth_floor,
      brief: info.brief,
      layers,
    });
  }

  periods.sort((a, b) => a.zone_id - b.zone_id);
  return periods;
}

// ── DEADLY ASSAULT ────────────────────────────────────────────────────────────
function buildDeadlyAssault() {
  const dir = join(ROOT, 'deadlyAssault');
  const files = readdirSync(dir).filter(
    f => f.endsWith('.json') && !f.includes('unknown')
  );

  const periods = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (!raw.data) continue;

    const d = raw.data;
    const runs = (d.list ?? []).map(r => ({
      boss: r.boss,
      score: r.score,
      star: r.star,
      total_star: r.total_star,
      challenge_time: r.challenge_time,
      buffer: r.buffer,
      avatars: (r.avatar_list ?? []).map(mapAvatar),
      buddy: mapBuddy(r.buddy),
    }));

    periods.push({
      start_time: d.start_time,
      end_time: d.end_time,
      zone_id: d.zone_id,
      total_score: d.total_score,
      total_max_score: d.total_max_score ?? 195000,
      room_max_score: d.room_max_score ?? 65000,
      total_star: d.total_star,
      rank_percent: d.rank_percent,
      runs,
    });
  }

  periods.sort((a, b) => {
    const ta = a.start_time;
    const tb = b.start_time;
    return (ta.year - tb.year) || (ta.month - tb.month) || (ta.day - tb.day);
  });
  return periods;
}

// ── VOID FRONT ────────────────────────────────────────────────────────────────
function mapSubChallenge(s) {
  return {
    name: s.name,
    star: s.star,
    buffer: s.buffer,
    avatars: (s.avatar_list ?? []).map(mapAvatar),
    buddy: mapBuddy(s.buddy),
  };
}

function buildVoidFront() {
  const dir = join(ROOT, 'voidFront');
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));

  const periods = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (!raw.data) continue;

    const detail = raw.data.void_front_battle_detail;
    const brief = detail.void_front_battle_abstract_info_brief;
    const bossRec = detail.boss_challenge_record;
    const mainRec = bossRec.main_challenge_record;

    // sub_challenges: from sub_challenge_record_list (v1) or main_challenge_record_list (v2)
    let subChallenges = [];
    if (detail.main_challenge_record_list) {
      // v2: collect all sub_challenge_record entries sorted by node_id ascending
      const sorted = [...detail.main_challenge_record_list].sort(
        (a, b) => a.node_id - b.node_id
      );
      for (const node of sorted) {
        subChallenges.push(...(node.sub_challenge_record ?? []).map(mapSubChallenge));
      }
    } else if (bossRec.sub_challenge_record_list) {
      // v1
      subChallenges = bossRec.sub_challenge_record_list.map(mapSubChallenge);
    }

    const main = {
      name: mainRec.name,
      score: mainRec.score,
      max_score: mainRec.max_score,
      score_ratio: mainRec.score_ratio,
      star: mainRec.star,
      challenge_time: mainRec.challenge_time,
      buffer: mainRec.buffer,
      avatars: (mainRec.avatar_list ?? []).map(mapAvatar),
      buddy: mapBuddy(mainRec.buddy),
      sub_challenges: subChallenges,
    };

    periods.push({
      void_front_id: raw.data.void_front_id,
      total_score: brief.total_score,
      max_score: brief.max_score,
      rank_percent: brief.rank_percent,
      ending: brief.ending_record_name,
      ending_id: brief.ending_record_id,
      ending_bg: brief.ending_record_bg_pic,
      start_time: brief.start_time,
      end_time: brief.end_time,
      boss: bossRec.boss_info,
      main,
    });
  }

  periods.sort((a, b) => a.void_front_id - b.void_front_id);
  return periods;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const shiyu = buildShiyu();
const deadlyAssault = buildDeadlyAssault();
const voidFront = buildVoidFront();

console.log(`✓ shiyu: ${shiyu.length} periods`);
console.log(`✓ deadlyAssault: ${deadlyAssault.length} periods`);
console.log(`✓ voidFront: ${voidFront.length} periods`);

writeFileSync(OUT, JSON.stringify({ shiyu, deadlyAssault, voidFront }));
console.log(`✓ wrote ${OUT}`);
