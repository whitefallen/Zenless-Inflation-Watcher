'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'

// Element id -> display name. Aligned with the analytics components in the repo.
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

export interface ElementSeasonPoint {
  /** Display label, e.g. "Mar 2026". */
  label: string
  /** Sortable timestamp (ms since epoch). */
  ts: number
  /** Map of element_type -> usage count for the season. */
  counts: Record<number, number>
}

interface ElementUsageTrendProps {
  data: ElementSeasonPoint[]
  accent?: string
  /** Render counts as % of season total instead of raw counts. */
  normalize?: boolean
}

interface ChartRow {
  ts: number
  label: string
  [elementName: string]: number | string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
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
      {payload
        .slice()
        .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
        .map((p: { name: string; value: number; color: string }, i: number) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </div>
        ))}
    </div>
  )
}

export function ElementUsageTrend({ data, accent = '#00d4ff', normalize = true }: ElementUsageTrendProps) {
  const { rows, elementsPresent } = useMemo(() => {
    const present = new Set<number>()
    for (const p of data) {
      for (const k of Object.keys(p.counts)) present.add(Number(k))
    }
    const presentIds = Array.from(present).sort()
    const sorted = [...data].sort((a, b) => a.ts - b.ts)
    const built: ChartRow[] = sorted.map(p => {
      const total = Object.values(p.counts).reduce((s, v) => s + v, 0) || 1
      const row: ChartRow = { ts: p.ts, label: p.label }
      // Fill every element key (default 0) so recharts stack math doesn't see undefined → NaN
      for (const id of presentIds) {
        const name = ELEMENT_NAMES[id] ?? `Element ${id}`
        const v = p.counts[id] ?? 0
        row[name] = normalize ? Number(((v / total) * 100).toFixed(1)) : v
      }
      return row
    })
    return { rows: built, elementsPresent: presentIds }
  }, [data, normalize])

  if (rows.length === 0) {
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
      <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: accent, opacity: 0.8 }}>
        Element Trend
      </div>
      <h3 className="text-lg font-black text-[#e8e0cc] mb-1">
        Element usage over time
      </h3>
      <p className="text-xs text-[#6b7280] mb-4">
        {normalize ? 'Share of agent picks per element each season.' : 'Raw count of agent picks per element each season.'}
      </p>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
            <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              domain={normalize ? [0, 100] : undefined}
              tickFormatter={normalize ? (v: number) => `${Math.round(v)}%` : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#e8e0cc' }} />
            {elementsPresent.map(id => {
              const name = ELEMENT_NAMES[id] ?? `Element ${id}`
              const color = ELEMENT_COLORS[id] ?? '#6b7280'
              return (
                <Area
                  key={id}
                  type="monotone"
                  dataKey={name}
                  stackId="1"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.55}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
