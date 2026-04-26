'use client'

import { useMemo } from 'react'

const ELEMENT_NAMES: Record<number, string> = {
  200: 'Physical',
  201: 'Ice',
  202: 'Fire',
  203: 'Ether',
  204: 'Electric',
  205: 'Anomaly',
}

const ELEMENT_COLORS: Record<number, string> = {
  200: '#f5c842',
  201: '#60a5fa',
  202: '#f97316',
  203: '#a855f7',
  204: '#22c55e',
  205: '#ef4444',
}

import type { ElementSeasonPoint } from './types'
export type { ElementSeasonPoint }

interface ElementUsageTrendProps {
  data: ElementSeasonPoint[]
  accent?: string
}

interface Row {
  ts: number
  label: string
  total: number
  /** id -> { count, pct } */
  byId: Record<number, { count: number; pct: number }>
}

export function ElementUsageTrend({ data, accent = '#00d4ff' }: ElementUsageTrendProps) {
  const { rows, presentIds } = useMemo(() => {
    const present = new Set<number>()
    for (const p of data) {
      for (const k of Object.keys(p.counts)) {
        const id = Number(k)
        if (Number.isFinite(id) && id in ELEMENT_NAMES) present.add(id)
      }
    }
    const ids = Array.from(present).sort((a, b) => a - b)

    const sorted = [...data].sort((a, b) => a.ts - b.ts)
    const built: Row[] = sorted.map(p => {
      const byId: Record<number, { count: number; pct: number }> = {}
      let total = 0
      for (const id of ids) total += p.counts[id] ?? 0
      for (const id of ids) {
        const count = p.counts[id] ?? 0
        byId[id] = { count, pct: total > 0 ? (count / total) * 100 : 0 }
      }
      return { ts: p.ts, label: p.label, total, byId }
    })

    return { rows: built, presentIds: ids }
  }, [data])

  if (rows.length === 0 || presentIds.length === 0) {
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
        No element usage data available.
      </section>
    )
  }

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
      <div
        className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1"
        style={{ color: accent, opacity: 0.8 }}
      >
        Element Trend
      </div>
      <h3 className="text-lg font-black text-[#e8e0cc] mb-1">Element usage over time</h3>
      <p className="text-xs text-[#6b7280] mb-4">
        Share of agent picks per element each season.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px]">
        {presentIds.map(id => (
          <div key={id} className="flex items-center gap-1.5 text-[#e8e0cc]">
            <span
              className="inline-block w-2.5 h-2.5"
              style={{ background: ELEMENT_COLORS[id] }}
            />
            {ELEMENT_NAMES[id]}
          </div>
        ))}
      </div>

      {/* Stacked bars (one per season) */}
      <div className="flex flex-col gap-2">
        {rows.map(row => (
          <div key={row.ts} className="flex items-center gap-3">
            <div className="text-[10px] tabular-nums text-[#6b7280] w-16 shrink-0 truncate">
              {row.label}
            </div>
            <div className="flex-1 h-5 bg-[#1e2438] flex overflow-hidden">
              {presentIds.map(id => {
                const seg = row.byId[id]
                if (!seg || seg.pct <= 0) return null
                return (
                  <div
                    key={id}
                    title={`${ELEMENT_NAMES[id]}: ${seg.count} (${seg.pct.toFixed(1)}%)`}
                    style={{ width: `${seg.pct}%`, background: ELEMENT_COLORS[id] }}
                  />
                )
              })}
            </div>
            <div className="text-[10px] tabular-nums text-[#6b7280] w-10 text-right shrink-0">
              {row.total}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
