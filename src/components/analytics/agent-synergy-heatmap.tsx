'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import type { SynergyTeam } from './types'
export type { SynergyTeam }

interface AgentSynergyHeatmapProps {
  teams: SynergyTeam[]
  accent?: string
  /** Top N pairs to display. */
  limit?: number
}

interface PairStat {
  a: number
  b: number
  count: number
  scoreSum: number
  scoreSamples: number
}

function pairKey(x: number, y: number): string {
  return x < y ? `${x}-${y}` : `${y}-${x}`
}

export function AgentSynergyHeatmap({
  teams,
  accent = '#00d4ff',
  limit = 12,
}: AgentSynergyHeatmapProps) {
  const { pairs, maxCount, iconLookup } = useMemo(() => {
    const stats = new Map<string, PairStat>()
    const icons: Record<number, string> = {}
    for (const t of teams) {
      Object.assign(icons, t.agentIcons)
      const ids = Array.from(new Set(t.agentIds))
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = ids[i], b = ids[j]
          const key = pairKey(a, b)
          const existing = stats.get(key) ?? {
            a: Math.min(a, b),
            b: Math.max(a, b),
            count: 0,
            scoreSum: 0,
            scoreSamples: 0,
          }
          existing.count++
          if (typeof t.score === 'number') {
            existing.scoreSum += t.score
            existing.scoreSamples++
          }
          stats.set(key, existing)
        }
      }
    }
    const sorted = Array.from(stats.values()).sort((x, y) => y.count - x.count).slice(0, limit)
    const max = sorted[0]?.count ?? 1
    return { pairs: sorted, maxCount: max, iconLookup: icons }
  }, [teams, limit])

  if (pairs.length === 0) {
    return (
      <section
        className="p-6 text-center text-[#6b7280] text-sm"
        style={{
          background: `${accent}0d`,
          border: `1px solid ${accent}33`,
          clipPath:
            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        }}
      >
        No team data available for synergy analysis.
      </section>
    )
  }

  const hasScores = pairs.some(p => p.scoreSamples > 0)

  return (
    <section
      className="p-5"
      style={{
        background: `${accent}0d`,
        border: `1px solid ${accent}33`,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: accent, opacity: 0.8 }}>
        Agent Synergy
      </div>
      <h3 className="text-lg font-black text-[#e8e0cc] mb-1">Most-paired agents</h3>
      <p className="text-xs text-[#6b7280] mb-4">
        How often each pair of agents shows up on the same team.
      </p>
      <ul className="flex flex-col gap-1.5">
        {pairs.map(p => {
          const intensity = p.count / maxCount
          const avgScore = p.scoreSamples > 0 ? Math.round(p.scoreSum / p.scoreSamples) : null
          return (
            <li
              key={`${p.a}-${p.b}`}
              className="flex items-center gap-3 px-3 py-2 bg-[#0d0f17] border border-[#1e2438]"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}
            >
              <div className="flex items-center gap-1 shrink-0">
                {[p.a, p.b].map(id => {
                  const url = iconLookup[id]
                  return url ? (
                    <Image
                      key={id}
                      src={url}
                      alt={`Agent ${id}`}
                      width={32}
                      height={32}
                      className="w-8 h-8 border border-[#1e2438]"
                      unoptimized
                    />
                  ) : (
                    <span
                      key={id}
                      className="w-8 h-8 inline-flex items-center justify-center text-[10px] text-[#6b7280] border border-[#1e2438]"
                    >
                      {id}
                    </span>
                  )
                })}
              </div>
              <div className="flex-1 h-2 bg-[#1e2438] relative overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${intensity * 100}%`,
                    background: accent,
                    opacity: 0.3 + intensity * 0.6,
                  }}
                />
              </div>
              <div className="text-xs font-bold tabular-nums shrink-0 w-10 text-right" style={{ color: accent }}>
                {p.count}×
              </div>
              {hasScores && (
                <div className="text-xs text-[#6b7280] tabular-nums shrink-0 w-20 text-right">
                  {avgScore !== null ? `~${avgScore.toLocaleString()}` : '—'}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
