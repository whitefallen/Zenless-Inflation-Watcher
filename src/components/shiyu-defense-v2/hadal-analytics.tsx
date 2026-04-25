'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import type { ShiyuDefenseData } from '@/types/shiyu-defense'
import { percentile } from '@/lib/utils'
import { getAgentInfoClient as getAgentInfo } from '@/lib/grade-utils'
import Image from 'next/image'

// ── types ───────────────────────────────────────────────────────────────────

interface HadalAnalyticsProps {
  data: ShiyuDefenseData[]
}

// ── helpers ─────────────────────────────────────────────────────────────────

function scoreColor(pct: number) {
  if (pct >= 92) return '#f5c842'
  if (pct >= 85) return '#00d4ff'
  if (pct >= 75) return '#a855f7'
  return '#6b7280'
}

function formatTimestamp(ts: { year: number; month: number; day: number } | undefined) {
  if (!ts) return '?'
  return `${ts.month}/${ts.day}`
}

const ELEMENT_COLORS: Record<number, string> = {
  200: '#f5c842',
  201: '#60a5fa',
  202: '#f97316',
  203: '#a855f7',
  204: '#22c55e',
  205: '#ef4444',
}

const RATING_COLORS: Record<string, string> = {
  'S+': '#f5c842',
  'S': '#f5c842',
  'A': '#00d4ff',
  'B': '#a855f7',
  'C': '#f97316',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="text-xs text-[#e8e0cc] px-3 py-2"
      style={{
        background: '#0d0f17',
        border: '1px solid rgba(0,212,255,0.3)',
        clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
      }}
    >
      <div className="font-bold text-[#00d4ff] mb-1">{label}</div>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  )
}

// ── component ────────────────────────────────────────────────────────────────

export function HadalAnalytics({ data }: HadalAnalyticsProps) {
  // Filter only v2 entries that have hadal_score populated
  const v2 = useMemo(
    () => data.filter(d => d.metadata?.sourceVersion === 'v2' && d.data.hadal_score !== undefined),
    [data]
  )

  if (v2.length === 0) {
    return (
      <div
        className="p-6 text-center text-[#6b7280] text-sm"
        style={{
          background: 'rgba(0,212,255,0.04)',
          border: '1px solid rgba(0,212,255,0.15)',
          clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
        }}
      >
        No Hadal Blacksite (v2) data available.
      </div>
    )
  }

  // Latest season first
  const latest = v2[0]
  const { hadal_score, hadal_max_score, hadal_rank_percent, all_floor_detail, hadal_begin_time, hadal_end_time } = latest.data
  const rating = latest.data.rating_list?.[0]?.rating ?? '?'
  const scorePercent = hadal_max_score && hadal_score ? (hadal_score / hadal_max_score) * 100 : 0

  // Score trend (oldest → newest)
  const trendData = useMemo(() => [...v2].reverse().map((d, i) => {
    const label = d.data.hadal_begin_time
      ? formatTimestamp(d.data.hadal_begin_time)
      : `#${i + 1}`
    const score = d.data.hadal_score ?? 0
    const max = d.data.hadal_max_score ?? 1
    return { label, score, pct: Math.round((score / max) * 100) }
  }), [v2])

  // Floor breakdown for latest season (5th floor nodes only, layer_index === 7)
  const fifthFloorNodes = useMemo(
    () => all_floor_detail.filter(f => f.layer_index === 7),
    [all_floor_detail]
  )

  // Agent usage across all v2 seasons
  const agentMap = useMemo(() => {
    const map = new Map<number, { url: string; count: number; element: number; rarity: string }>()
    for (const d of v2) {
      for (const floor of d.data.all_floor_detail) {
        for (const a of floor.node_1?.avatars ?? []) {
          const existing = map.get(a.id)
          if (existing) { existing.count++ }
          else { map.set(a.id, { url: a.role_square_url, count: 1, element: a.element_type, rarity: a.rarity }) }
        }
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 12)
  }, [v2])

  const accentColor = '#00d4ff'
  const accentDim = 'rgba(0,212,255,0.06)'
  const accentBorder = 'rgba(0,212,255,0.2)'

  return (
    <div className="space-y-6">
      {/* Season pills */}
      <div className="flex gap-2 flex-wrap">
        {v2.map((d, i) => {
          const label = d.data.hadal_begin_time ? formatTimestamp(d.data.hadal_begin_time) : `#${i + 1}`
          const score = d.data.hadal_score ?? 0
          const max = d.data.hadal_max_score ?? 1
          const pct = Math.round((score / max) * 100)
          const col = scoreColor(pct)
          const isLatest = i === 0
          return (
            <div
              key={i}
              className="px-2 py-1 text-[10px] font-bold"
              style={{
                background: isLatest ? `${col}22` : 'transparent',
                border: `1px solid ${isLatest ? col : '#1e2438'}`,
                color: isLatest ? col : '#6b7280',
                clipPath: 'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))',
              }}
            >
              {label} · {d.data.rating_list?.[0]?.rating ?? '?'} · {score.toLocaleString()}
            </div>
          )
        })}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Score',
            value: hadal_score?.toLocaleString() ?? 'N/A',
            sub: `/ ${hadal_max_score?.toLocaleString() ?? '?'}`,
            accent: scoreColor(scorePercent),
          },
          {
            label: 'Score %',
            value: `${scorePercent.toFixed(1)}%`,
            sub: 'of max',
            accent: scoreColor(scorePercent),
          },
          {
            label: 'Rating',
            value: rating,
            sub: 'latest season',
            accent: RATING_COLORS[rating] ?? '#6b7280',
          },
          {
            label: 'Rank Percentile',
            value: hadal_rank_percent !== undefined ? percentile(hadal_rank_percent) : 'N/A',
            sub: 'global',
            accent: accentColor,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 flex flex-col gap-1"
            style={{
              background: accentDim,
              border: `1px solid ${accentBorder}`,
              clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
            }}
          >
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">{kpi.label}</span>
            <span className="text-xl font-black" style={{ color: kpi.accent }}>{kpi.value}</span>
            <span className="text-[11px] text-[#6b7280]">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Score progress bar */}
      <div
        className="p-4"
        style={{
          background: accentDim,
          border: `1px solid ${accentBorder}`,
          clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">Score Progress</span>
          <span className="text-xs font-bold" style={{ color: scoreColor(scorePercent) }}>{scorePercent.toFixed(1)}%</span>
        </div>
        <div
          className="h-2 bg-[#1e2438]"
          style={{ clipPath: 'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))' }}
        >
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${scorePercent}%`,
              background: `linear-gradient(90deg, ${scoreColor(scorePercent)}66, ${scoreColor(scorePercent)})`,
              boxShadow: `0 0 8px ${scoreColor(scorePercent)}`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#6b7280] mt-1">
          <span>0</span>
          <span>{hadal_max_score?.toLocaleString() ?? '?'}</span>
        </div>
        {hadal_begin_time && hadal_end_time && (
          <div className="text-[10px] text-[#6b7280] mt-2">
            Season: {formatTimestamp(hadal_begin_time)} — {formatTimestamp(hadal_end_time)}
          </div>
        )}
      </div>

      {/* Score trend */}
      {trendData.length > 1 && (
        <div
          className="p-4"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">Score Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="hadalScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke={accentColor}
                strokeWidth={2}
                fill="url(#hadalScoreGrad)"
                dot={{ fill: accentColor, r: 3, strokeWidth: 0 }}
                name="Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 5th floor node breakdown */}
      {fifthFloorNodes.length > 0 && (
        <div
          className="p-4"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">5th Floor Nodes (Latest)</span>
          </div>
          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={fifthFloorNodes.map((f, i) => ({
                name: f.zone_name?.replace('Fifth Floor - ', '') ?? `Node ${i + 1}`,
                time: f.node_1?.battle_time ?? 0,
                rating: f.rating,
              }))}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="time" name="Battle Time (s)" radius={[2, 2, 0, 0]}>
                {fifthFloorNodes.map((f, i) => (
                  <Cell key={i} fill={RATING_COLORS[f.rating ?? ''] ?? accentColor} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Detail cards */}
          <div className="space-y-2 mt-4">
            {fifthFloorNodes.map((f, i) => {
              const ratingColor = RATING_COLORS[f.rating ?? ''] ?? '#6b7280'
              return (
                <div
                  key={i}
                  className="p-3"
                  style={{
                    background: '#0d0f17',
                    border: '1px solid #1e2438',
                    clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5"
                        style={{
                          color: ratingColor,
                          border: `1px solid ${ratingColor}44`,
                          clipPath: 'polygon(0 0,calc(100% - 3px) 0,100% 3px,100% 100%,3px 100%,0 calc(100% - 3px))',
                        }}
                      >
                        {f.rating ?? '?'}
                      </span>
                      <span className="text-xs font-bold text-[#e8e0cc]">
                        {f.zone_name?.replace('Fifth Floor - ', '') ?? `Node ${i + 1}`}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7280]">
                      {f.node_1?.battle_time ? `${f.node_1.battle_time}s` : '—'}
                    </span>
                  </div>
                  {/* buff */}
                  {f.buffs?.[0]?.title && (
                    <div className="text-[11px] text-[#6b7280] mb-2">
                      <span className="text-[#00d4ff] font-bold">⚡ {f.buffs[0].title}</span>
                    </div>
                  )}
                  {/* agents */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(f.node_1?.avatars ?? []).map((a) => {
                      const info = getAgentInfo(a.id, { role_square_url: a.role_square_url, rarity: a.rarity })
                      const url = info?.iconUrl ?? a.role_square_url
                      const elemColor = ELEMENT_COLORS[a.element_type] ?? '#6b7280'
                      return (
                        <div key={a.id} className="relative" title={info?.name ?? `Agent ${a.id}`}>
                          <div
                            className="w-8 h-8 overflow-hidden"
                            style={{
                              border: `1px solid ${elemColor}55`,
                              clipPath: 'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))',
                            }}
                          >
                            <Image src={url ?? '/placeholder.png'} alt="" width={32} height={32} unoptimized />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agent usage grid */}
      {agentMap.length > 0 && (
        <div
          className="p-4"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
              Agent Usage ({v2.length} season{v2.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {agentMap.map(([id, agent]) => {
              const info = getAgentInfo(Number(id), { role_square_url: agent.url, rarity: agent.rarity as 'S' | 'A' })
              const url = info?.iconUrl ?? agent.url
              const elemColor = ELEMENT_COLORS[agent.element] ?? '#6b7280'
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <div
                      className="w-12 h-12 overflow-hidden"
                      style={{
                        border: `1px solid ${elemColor}55`,
                        background: `${elemColor}11`,
                        clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                      }}
                    >
                      <Image src={url ?? '/placeholder.png'} alt={info?.name ?? `${id}`} width={48} height={48} unoptimized />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 text-[8px] font-black px-0.5"
                      style={{ background: agent.rarity === 'S' ? '#f5c842' : '#00d4ff', color: '#08090d' }}
                    >
                      {agent.rarity}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6b7280] text-center leading-tight">
                    {info?.name?.split(' ')[0] ?? `#${id}`}
                  </span>
                  <span
                    className="text-[9px] font-bold px-1"
                    style={{ color: elemColor, border: `1px solid ${elemColor}44` }}
                  >
                    x{agent.count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
