'use client'

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid, ReferenceLine,
} from 'recharts'

export interface InflationSeriesPoint {
  /** Sortable timestamp (ms since epoch). Used to align series across modes. */
  ts: number
  /** Display label for this season (e.g. "Mar 2026"). */
  label: string
  /** Score expressed as a 0–100 percentage of that season's max. */
  scorePct: number
}

export interface InflationSeries {
  /** Mode display name. */
  name: string
  /** Hex accent color. */
  color: string
  points: InflationSeriesPoint[]
}

interface InflationTrackerProps {
  series: InflationSeries[]
}

interface MergedRow {
  ts: number
  label: string
  [seriesName: string]: number | string
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
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)}%
        </div>
      ))}
    </div>
  )
}

export function InflationTracker({ series }: InflationTrackerProps) {
  const merged = useMemo<MergedRow[]>(() => {
    const byTs = new Map<number, MergedRow>()
    for (const s of series) {
      for (const p of s.points) {
        const row = byTs.get(p.ts) ?? { ts: p.ts, label: p.label }
        row[s.name] = Number(p.scorePct.toFixed(2))
        byTs.set(p.ts, row)
      }
    }
    return Array.from(byTs.values()).sort((a, b) => a.ts - b.ts)
  }, [series])

  // Trend indicator: average of last 3 vs first 3 points across all series
  const trend = useMemo(() => {
    const allPcts = merged.flatMap(row =>
      series.map(s => row[s.name]).filter((v): v is number => typeof v === 'number')
    )
    if (allPcts.length < 4) return null
    const head = allPcts.slice(0, Math.max(3, Math.floor(allPcts.length / 4)))
    const tail = allPcts.slice(-Math.max(3, Math.floor(allPcts.length / 4)))
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
    const delta = avg(tail) - avg(head)
    return { delta, headAvg: avg(head), tailAvg: avg(tail) }
  }, [merged, series])

  if (merged.length === 0) {
    return (
      <section
        className="p-6 text-center text-[#6b7280] text-sm"
        style={{
          background: 'rgba(168,85,247,0.06)',
          border: '1px solid rgba(168,85,247,0.2)',
          clipPath:
            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        }}
      >
        Not enough data for inflation trend yet.
      </section>
    )
  }

  return (
    <section
      className="p-5"
      style={{
        background: 'rgba(168,85,247,0.05)',
        border: '1px solid rgba(168,85,247,0.2)',
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#a855f7] opacity-80">
            Inflation Tracker
          </div>
          <h3 className="text-lg font-black text-[#e8e0cc]">Score % across seasons</h3>
        </div>
        {trend && (
          <div className="text-xs text-[#6b7280]">
            <span className="font-bold" style={{ color: trend.delta >= 0 ? '#22c55e' : '#ef4444' }}>
              {trend.delta >= 0 ? '▲' : '▼'} {Math.abs(trend.delta).toFixed(1)} pts
            </span>{' '}
            (avg {trend.headAvg.toFixed(1)}% → {trend.tailAvg.toFixed(1)}%)
          </div>
        )}
      </div>
      <p className="text-xs text-[#6b7280] mb-4 max-w-2xl">
        Each line is your score as a percentage of that season&apos;s max — a flat line means content scales
        with you; a downward trend means it&apos;s outpacing you.
      </p>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={merged} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
            <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
            />
            <ReferenceLine y={75} stroke="#1e2438" strokeDasharray="2 4" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#e8e0cc' }} />
            {series.map(s => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
