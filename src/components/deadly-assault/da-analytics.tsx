'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts'
import type { DeadlyAssaultData } from "@/types/deadly-assault"
import { percentile } from '@/lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<number, string> = {
  200: '#a0aec0', 201: '#f97316', 202: '#f5c842',
  203: '#67e8f9', 204: '#f97316', 205: '#a78bfa',
}

function scoreColor(pct: number) {
  if (pct >= 80) return '#f5c842'
  if (pct >= 65) return '#00d4ff'
  if (pct >= 50) return '#a855f7'
  return '#6b7280'
}

function ZzzTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f1117] border border-[#2a3050] p-3 text-xs"
      style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
      <div className="text-[#6b7280] mb-1 font-bold tracking-wider">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
          {p.name && <span className="text-[#6b7280]">{p.name}</span>}
        </div>
      ))}
    </div>
  )
}

function KpiCard({ label, value, sub, accent = '#f5c842' }: {
  label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className="flex flex-col gap-1 p-4"
      style={{
        background: `${accent}08`,
        border: `1px solid ${accent}28`,
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}>
      <span className="text-[9px] font-black tracking-[0.2em] uppercase text-[#6b7280]">{label}</span>
      <span className="text-2xl font-black leading-none" style={{ color: accent }}>{value}</span>
      {sub && <span className="text-[10px] text-[#6b7280]">{sub}</span>}
    </div>
  )
}

function ScoreBar({ score, maxScore, accent }: { score: number; maxScore: number; accent: string }) {
  const pct = Math.min(100, (score / maxScore) * 100)
  return (
    <div className="relative h-2 bg-[#1e2438] w-full overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}>
      <div className="h-full transition-all duration-700"
        style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${accent}88` }} />
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export function DaAnalytics({ data }: { data: DeadlyAssaultData[] }) {
  const sorted = useMemo(() =>
    [...(data ?? [])].sort((a, b) => (a.data?.zone_id ?? 0) - (b.data?.zone_id ?? 0)),
    [data]
  )
  const latest = sorted[sorted.length - 1]

  // Score trend
  const trendData = useMemo(() =>
    sorted
      .filter(d => d.data?.total_score)
      .map(d => {
        const dd = d.data!
        const pct = dd.total_max_score ? (dd.total_score / dd.total_max_score) * 100 : 0
        return {
          zone: (() => { const st = dd.start_time as { month?: number; day?: number } | undefined; return st?.month && st?.day ? `${st.month}/${st.day}` : `Z${dd.zone_id}`; })(),
          score: dd.total_score,
          maxScore: dd.total_max_score ?? 0,
          pct: Math.round(pct * 10) / 10,
          stars: dd.total_star,
          rankPct: dd.rank_percent,
        }
      }),
    [sorted]
  )

  // Per-run scores for latest season
  const runData = useMemo(() =>
    latest?.data?.list?.map((run, i) => ({
      name: `Run ${i + 1}`,
      score: run.score ?? 0,
      stars: run.star ?? 0,
      boss: run.boss?.[0]?.name ?? `Boss ${i + 1}`,
    })) ?? [],
    [latest]
  )

  // Boss difficulty — avg score across all seasons per boss
  const bossStats = useMemo(() => {
    const map: Record<string, { total: number; count: number; scores: number[] }> = {}
    sorted.forEach(d => {
      d.data?.list?.forEach(run => {
        run.boss?.forEach(b => {
          const n = b.name
          if (!n) return
          if (!map[n]) map[n] = { total: 0, count: 0, scores: [] }
          map[n].total += run.score ?? 0
          map[n].count++
          map[n].scores.push(run.score ?? 0)
        })
      })
    })
    return Object.entries(map)
      .map(([name, v]) => ({
        name: name.length > 22 ? name.slice(0, 20) + '…' : name,
        fullName: name,
        avg: Math.round(v.total / v.count),
        count: v.count,
        max: Math.max(...v.scores),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10)
  }, [sorted])

  // Agent usage
  const agentUsage = useMemo(() => {
    const counts: Record<number, { id: number; url: string; count: number; el: number }> = {}
    sorted.forEach(d => {
      d.data?.list?.forEach(run => {
        run.avatar_list?.forEach(a => {
          if (!counts[a.id]) counts[a.id] = { id: a.id, url: a.role_square_url ?? '', count: 0, el: a.element_type ?? 0 }
          counts[a.id].count++
        })
      })
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 12)
  }, [sorted])

  if (!latest?.data) return null

  const ld = latest.data
  const latestPct = ld.total_max_score ? (ld.total_score / ld.total_max_score) * 100 : 0
  const accentCol = scoreColor(latestPct)
  const avgScore = trendData.length ? Math.round(trendData.reduce((s, d) => s + d.score, 0) / trendData.length) : 0
  const bestScore = trendData.reduce((best, d) => d.score > best ? d.score : best, 0)
  const avgRank = trendData.length ? Math.round(trendData.reduce((s, d) => s + (d.rankPct ?? 0), 0) / trendData.length) : 0

  return (
    <div className="flex flex-col gap-8">

      {/* KPI row */}
      <div>
        <div className="zzz-section-label mb-3">Latest Season — Zone {ld.zone_id}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Score" value={ld.total_score?.toLocaleString() ?? 'N/A'}
            sub={`of ${ld.total_max_score?.toLocaleString()} · ${latestPct.toFixed(1)}%`} accent={accentCol} />
          <KpiCard label="Total Stars" value={`${ld.total_star ?? 'N/A'} ★`}
            sub={`${ld.list?.length ?? 0} runs`} accent="#f5c842" />
          <KpiCard label="Rank" value={ld.rank_percent !== undefined ? percentile(ld.rank_percent) : 'N/A'}
            sub="Global percentile" accent="#00d4ff" />
          <KpiCard label="Avg Score (all)" value={avgScore.toLocaleString()}
            sub={`Best: ${bestScore.toLocaleString()}`} accent="#a855f7" />
        </div>
        {ld.total_max_score && (
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-[#6b7280] font-bold">
              <span>SCORE EFFICIENCY</span>
              <span style={{ color: accentCol }}>{latestPct.toFixed(1)}% of max</span>
            </div>
            <ScoreBar score={ld.total_score} maxScore={ld.total_max_score} accent={accentCol} />
          </div>
        )}
      </div>

      {/* Score Trend */}
      {trendData.length > 1 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="zzz-section-label">Score Trend — {trendData.length} Seasons</div>
            <span className="text-[10px] text-[#6b7280]">Avg rank: top {avgRank / 10}%</span>
          </div>
          <div className="p-4 border border-[#1e2438]"
            style={{ background: '#0f1117', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="daGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5c842" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f5c842" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
                <XAxis dataKey="zone" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ZzzTooltip />} />
                {trendData[0]?.maxScore > 0 && (
                  <ReferenceLine y={trendData[0].maxScore} stroke="#f5c84230" strokeDasharray="4 4"
                    label={{ value: 'MAX', fill: '#f5c84260', fontSize: 9 }} />
                )}
                <Area type="monotone" dataKey="score" stroke="#f5c842" strokeWidth={2}
                  fill="url(#daGrad)"
                  dot={{ fill: '#f5c842', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#f5c842', stroke: '#08090d', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Run breakdown latest */}
        {runData.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="zzz-section-label">Latest Runs</div>
            <div className="flex flex-col gap-2">
              {runData.map((run, i) => {
                const maxPerRun = ld.total_max_score ? Math.round(ld.total_max_score / (ld.list?.length ?? 3)) : 65000
                const pct = (run.score / maxPerRun) * 100
                const col = scoreColor(pct)
                return (
                  <div key={i} className="p-3 border border-[#1e2438] flex flex-col gap-2"
                    style={{ background: `${col}08`, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#e8e0cc] truncate max-w-[60%]" title={run.boss}>{run.boss}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black" style={{ color: '#f5c842' }}>{run.stars}★</span>
                        <span className="text-xs font-bold" style={{ color: col }}>{run.score.toLocaleString()}</span>
                      </div>
                    </div>
                    <ScoreBar score={run.score} maxScore={maxPerRun} accent={col} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Boss avg scores */}
        {bossStats.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="zzz-section-label">Boss Avg Score (all seasons)</div>
            <div className="p-4 border border-[#1e2438]"
              style={{ background: '#0f1117', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bossStats} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#e8e0cc', fontSize: 9 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<ZzzTooltip />} />
                  <Bar dataKey="avg" radius={0}>
                    {bossStats.map((entry, i) => (
                      <Cell key={i} fill={scoreColor((entry.avg / (ld.total_max_score ? ld.total_max_score / 3 : 65000)) * 100)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Agent usage */}
      {agentUsage.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="zzz-section-label">Most Used Agents — {sorted.length} Seasons</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {agentUsage.map(a => {
              const elColor = ELEMENT_COLORS[a.el] ?? '#6b7280'
              return (
                <div key={a.id}
                  className="flex flex-col items-center gap-1.5 p-2 border border-[#1e2438] hover:border-[#2a3050] transition-all"
                  style={{ background: `${elColor}0a`, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                  {a.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={`Agent ${a.id}`} className="w-12 h-12 object-cover"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="w-12 h-12 bg-[#1e2130] flex items-center justify-center text-[#6b7280] text-xs">{a.id}</div>
                  )}
                  <span className="text-[10px] font-black" style={{ color: elColor }}>{a.count}×</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
