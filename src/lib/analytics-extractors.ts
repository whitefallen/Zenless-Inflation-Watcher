import type { DeadlyAssaultData, TimeStamp } from '@/types/deadly-assault'
import type { ShiyuDefenseData } from '@/types/shiyu-defense'
import type { VoidFrontData } from '@/types/void-front'
import type { RecordItem } from '@/components/analytics/records-panel'
import type { InflationSeriesPoint } from '@/components/analytics/inflation-tracker'
import type { ElementSeasonPoint } from '@/components/analytics/element-usage-trend'
import type { SynergyTeam } from '@/components/analytics/agent-synergy-heatmap'

// ── Time helpers ────────────────────────────────────────────────────────────

function tsToMs(ts: TimeStamp | undefined): number {
  if (!ts) return 0
  return Date.UTC(ts.year, (ts.month ?? 1) - 1, ts.day ?? 1, ts.hour ?? 0, ts.minute ?? 0, ts.second ?? 0)
}

function tsToLabel(ts: TimeStamp | undefined): string {
  if (!ts) return '—'
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(ts.month ?? 1) - 1]
  return `${month} ${String(ts.year).slice(-2)}`
}

function unixSecondsToMs(s: number | undefined): number {
  if (!s || !Number.isFinite(s)) return 0
  return s * 1000
}

function unixSecondsToLabel(s: number | undefined): string {
  if (!s || !Number.isFinite(s)) return '—'
  const d = new Date(s * 1000)
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]
  return `${month} ${String(d.getUTCFullYear()).slice(-2)}`
}

function fmt(n: number | undefined): string {
  return typeof n === 'number' ? n.toLocaleString() : '—'
}

// ── Inflation series ────────────────────────────────────────────────────────

export function buildDaInflation(data: DeadlyAssaultData[]): InflationSeriesPoint[] {
  return data
    .map(d => {
      const score = d?.data?.total_score
      const max = d?.data?.total_max_score
      if (!score || !max) return null
      return {
        ts: tsToMs(d.data.end_time),
        label: tsToLabel(d.data.end_time),
        scorePct: (score / max) * 100,
      }
    })
    .filter((x): x is InflationSeriesPoint => x !== null)
}

export function buildHadalInflation(data: ShiyuDefenseData[]): InflationSeriesPoint[] {
  return data
    .filter(d => d.metadata?.sourceVersion === 'v2' && d.data.hadal_score !== undefined && d.data.hadal_max_score)
    .map(d => ({
      ts: tsToMs(d.data.hadal_end_time),
      label: tsToLabel(d.data.hadal_end_time),
      scorePct: (d.data.hadal_score! / d.data.hadal_max_score!) * 100,
    }))
}

export function buildVfInflation(data: VoidFrontData[]): InflationSeriesPoint[] {
  return data
    .map(d => {
      const brief = d?.data?.void_front_battle_abstract_info_brief
      if (!brief?.total_score || !brief?.max_score) return null
      return {
        ts: unixSecondsToMs(brief.end_ts),
        label: unixSecondsToLabel(brief.end_ts),
        scorePct: (brief.total_score / brief.max_score) * 100,
      }
    })
    .filter((x): x is InflationSeriesPoint => x !== null)
}

// ── Records ─────────────────────────────────────────────────────────────────

export function buildDaRecords(data: DeadlyAssaultData[]): RecordItem[] {
  if (data.length === 0) return []
  const seasonsWithMax = data.filter(d => d.data?.total_max_score)
  const bestSeason = [...seasonsWithMax].sort(
    (a, b) => (b.data.total_score / b.data.total_max_score) - (a.data.total_score / a.data.total_max_score)
  )[0]
  const allRuns = data.flatMap(d => d.data?.list ?? [])
  const bestRun = [...allRuns].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
  const mostStars = [...data].sort((a, b) => (b.data?.total_star ?? 0) - (a.data?.total_star ?? 0))[0]
  const bestRank = [...data]
    .filter(d => typeof d.data?.rank_percent === 'number')
    .sort((a, b) => a.data.rank_percent - b.data.rank_percent)[0]

  const records: RecordItem[] = [
    { label: 'Best Score%', value: bestSeason ? `${((bestSeason.data.total_score / bestSeason.data.total_max_score) * 100).toFixed(1)}%` : '—', sublabel: bestSeason ? tsToLabel(bestSeason.data.end_time) : undefined },
    { label: 'Top Single Run', value: fmt(bestRun?.score), sublabel: bestRun?.boss?.[0]?.name },
    { label: 'Most Stars', value: fmt(mostStars?.data?.total_star), sublabel: mostStars ? tsToLabel(mostStars.data.end_time) : undefined },
    { label: 'Best Rank', value: bestRank ? `top ${bestRank.data.rank_percent / 100}%` : '—', sublabel: bestRank ? tsToLabel(bestRank.data.end_time) : undefined },
    { label: 'Seasons Tracked', value: data.length },
  ]
  return records
}

export function buildHadalRecords(data: ShiyuDefenseData[]): RecordItem[] {
  const v2 = data.filter(d => d.metadata?.sourceVersion === 'v2' && d.data.hadal_score !== undefined)
  if (v2.length === 0) return []
  const bestSeason = [...v2].sort(
    (a, b) => (b.data.hadal_score! / (b.data.hadal_max_score ?? 1)) -
              (a.data.hadal_score! / (a.data.hadal_max_score ?? 1))
  )[0]
  const topScore = [...v2].sort((a, b) => (b.data.hadal_score ?? 0) - (a.data.hadal_score ?? 0))[0]
  const sRuns = v2.filter(d => {
    const r = d.data.rating_list?.[0]?.rating
    return r === 'S' || r === 'S+'
  }).length

  return [
    { label: 'Best Score%', value: bestSeason && bestSeason.data.hadal_max_score
      ? `${((bestSeason.data.hadal_score! / bestSeason.data.hadal_max_score) * 100).toFixed(1)}%`
      : '—',
      sublabel: bestSeason ? tsToLabel(bestSeason.data.hadal_begin_time) : undefined },
    { label: 'Top Score', value: fmt(topScore?.data?.hadal_score), sublabel: topScore ? tsToLabel(topScore.data.hadal_begin_time) : undefined },
    { label: 'S+ / S Seasons', value: sRuns },
    { label: 'Seasons Tracked', value: v2.length },
  ]
}

export function buildVfRecords(data: VoidFrontData[]): RecordItem[] {
  if (data.length === 0) return []
  const briefs = data.map(d => d?.data?.void_front_battle_abstract_info_brief).filter(Boolean) as NonNullable<VoidFrontData['data']['void_front_battle_abstract_info_brief']>[]
  if (briefs.length === 0) return []
  const topScore = [...briefs].sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))[0]
  const bestPct = [...briefs]
    .filter(b => b.max_score)
    .sort((a, b) => (b.total_score / b.max_score) - (a.total_score / a.max_score))[0]
  const bestRank = [...briefs]
    .filter(b => typeof b.rank_percent === 'number')
    .sort((a, b) => a.rank_percent - b.rank_percent)[0]

  return [
    { label: 'Top Score', value: fmt(topScore?.total_score), sublabel: unixSecondsToLabel(topScore?.end_ts) },
    { label: 'Best Score%', value: bestPct ? `${((bestPct.total_score / bestPct.max_score) * 100).toFixed(1)}%` : '—', sublabel: unixSecondsToLabel(bestPct?.end_ts) },
    { label: 'Best Rank', value: bestRank ? `top ${(bestRank.rank_percent / 100).toFixed(2)}%` : '—', sublabel: unixSecondsToLabel(bestRank?.end_ts) },
    { label: 'Seasons Tracked', value: briefs.length },
  ]
}

// ── Element usage ───────────────────────────────────────────────────────────

export function buildDaElementUsage(data: DeadlyAssaultData[]): ElementSeasonPoint[] {
  return data
    .map(d => {
      const counts: Record<number, number> = {}
      for (const run of d.data?.list ?? []) {
        for (const a of run.avatar_list ?? []) {
          counts[a.element_type] = (counts[a.element_type] ?? 0) + 1
        }
      }
      return {
        label: tsToLabel(d.data?.end_time),
        ts: tsToMs(d.data?.end_time),
        counts,
      }
    })
    .filter(p => Object.keys(p.counts).length > 0)
}

export function buildHadalElementUsage(data: ShiyuDefenseData[]): ElementSeasonPoint[] {
  return data
    .filter(d => d.metadata?.sourceVersion === 'v2')
    .map(d => {
      const counts: Record<number, number> = {}
      for (const floor of d.data?.all_floor_detail ?? []) {
        for (const a of floor.node_1?.avatars ?? []) {
          counts[a.element_type] = (counts[a.element_type] ?? 0) + 1
        }
        for (const a of floor.node_2?.avatars ?? []) {
          counts[a.element_type] = (counts[a.element_type] ?? 0) + 1
        }
      }
      return {
        label: tsToLabel(d.data?.hadal_begin_time),
        ts: tsToMs(d.data?.hadal_begin_time),
        counts,
      }
    })
    .filter(p => Object.keys(p.counts).length > 0)
}

export function buildVfElementUsage(data: VoidFrontData[]): ElementSeasonPoint[] {
  return data
    .map(d => {
      const counts: Record<number, number> = {}
      for (const ch of d?.data?.main_challenge_record_list ?? []) {
        for (const a of ch.avatar_list ?? []) {
          counts[a.element_type] = (counts[a.element_type] ?? 0) + 1
        }
      }
      const bossMain = d?.data?.boss_challenge_record?.main_challenge_record
      if (bossMain) {
        for (const a of bossMain.avatar_list ?? []) {
          counts[a.element_type] = (counts[a.element_type] ?? 0) + 1
        }
      }
      return {
        label: unixSecondsToLabel(d?.data?.void_front_battle_abstract_info_brief?.end_ts),
        ts: unixSecondsToMs(d?.data?.void_front_battle_abstract_info_brief?.end_ts),
        counts,
      }
    })
    .filter(p => Object.keys(p.counts).length > 0)
}

// ── Synergy teams ───────────────────────────────────────────────────────────

export function buildDaTeams(data: DeadlyAssaultData[]): SynergyTeam[] {
  const teams: SynergyTeam[] = []
  for (const d of data) {
    for (const run of d.data?.list ?? []) {
      const icons: Record<number, string> = {}
      const ids: number[] = []
      for (const a of run.avatar_list ?? []) {
        ids.push(a.id)
        if (a.role_square_url) icons[a.id] = a.role_square_url
      }
      if (ids.length >= 2) teams.push({ agentIds: ids, agentIcons: icons, score: run.score })
    }
  }
  return teams
}

export function buildHadalTeams(data: ShiyuDefenseData[]): SynergyTeam[] {
  const teams: SynergyTeam[] = []
  for (const d of data.filter(x => x.metadata?.sourceVersion === 'v2')) {
    for (const floor of d.data?.all_floor_detail ?? []) {
      for (const node of [floor.node_1, floor.node_2]) {
        if (!node) continue
        const icons: Record<number, string> = {}
        const ids: number[] = []
        for (const a of node.avatars ?? []) {
          ids.push(a.id)
          if (a.role_square_url) icons[a.id] = a.role_square_url
        }
        if (ids.length >= 2) teams.push({ agentIds: ids, agentIcons: icons })
      }
    }
  }
  return teams
}

export function buildVfTeams(data: VoidFrontData[]): SynergyTeam[] {
  const teams: SynergyTeam[] = []
  for (const d of data) {
    for (const ch of d?.data?.main_challenge_record_list ?? []) {
      const icons: Record<number, string> = {}
      const ids: number[] = []
      for (const a of ch.avatar_list ?? []) {
        ids.push(a.id)
        if (a.role_square_url) icons[a.id] = a.role_square_url
      }
      if (ids.length >= 2) teams.push({ agentIds: ids, agentIcons: icons, score: ch.score })
    }
  }
  return teams
}
