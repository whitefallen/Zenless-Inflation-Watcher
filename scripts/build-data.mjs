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
    const mapRun = r => ({
      boss: r.boss,
      score: r.score,
      star: r.star,
      total_star: r.total_star,
      challenge_time: r.challenge_time,
      buffer: r.buffer,
      avatars: (r.avatar_list ?? []).map(mapAvatar),
      buddy: mapBuddy(r.buddy),
    });
    const runs = (d.list ?? []).map(mapRun);
    // hadal_mem_detail_v2 added a separate hard track. It is scored
    // independently — total_score/total_max_score cover d.list only — so keep it
    // out of `runs` rather than merging the two.
    const hardRuns = (d.hard_list ?? []).map(mapRun);

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
      has_hard: d.has_hard ?? false,
      hard_rank_percent: d.hard_rank_percent ?? 0,
      hard_runs: hardRuns,
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

// ── HOLO BOSS ─────────────────────────────────────────────────────────────────
function buildHoloBoss() {
  const dir = join(ROOT, 'holoBoss');
  let files;
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('unknown'));
  } catch {
    return []; // folder only exists once the mode has been fetched
  }

  const seasons = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (!raw.data) continue;

    const d = raw.data;
    const clears = (d.list ?? []).map(r => ({
      boss: r.boss?.name,
      boss_icon: r.boss?.icon,
      medal_icon: r.boss?.medal?.medal_icon,
      medal_id: r.boss?.medal?.medal_id,
      no_injured: r.boss?.medal?.is_no_injured ?? false,
      // The API calls this `rank`, but it is a percentile scaled by 100 —
      // 1000 means top 10%. Renamed to match rank_percent elsewhere.
      rank_percent: r.rank,
      star: r.star,
      // challenge_time here is a DURATION (the clear time), not a timestamp.
      clear_seconds: (r.challenge_time?.hour ?? 0) * 3600
        + (r.challenge_time?.minute ?? 0) * 60
        + (r.challenge_time?.second ?? 0),
      avatars: (r.avatar_list ?? []).map(mapAvatar),
    }));

    seasons.push({
      // No zone/schedule id in this payload — the start date identifies it.
      season_id: d.start_time
        ? d.start_time.year * 10000 + d.start_time.month * 100 + d.start_time.day
        : 0,
      start_time: d.start_time,
      end_time: d.end_time,
      unlock: d.unlock ?? false,
      total_star: clears.reduce((sum, c) => sum + (c.star || 0), 0),
      flawless: clears.filter(c => c.no_injured).length,
      clears,
    });
  }

  seasons.sort((a, b) => a.season_id - b.season_id);
  return seasons;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const shiyu = buildShiyu();
const deadlyAssault = buildDeadlyAssault();
const voidFront = buildVoidFront();
const holoBoss = buildHoloBoss();

console.log(`✓ shiyu: ${shiyu.length} periods`);
console.log(`✓ deadlyAssault: ${deadlyAssault.length} periods`);
console.log(`✓ voidFront: ${voidFront.length} periods`);
console.log(`✓ holoBoss: ${holoBoss.length} seasons`);

writeFileSync(OUT, JSON.stringify({ shiyu, deadlyAssault, voidFront, holoBoss }));
console.log(`✓ wrote ${OUT}`);
