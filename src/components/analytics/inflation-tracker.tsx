'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { buildTrendQuips, buildWatcherVerdict } from '@/lib/analytics-quips'
import type { InflationSeries, InflationSeriesPoint } from './types'
export type { InflationSeries, InflationSeriesPoint }

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
      className="border border-[#3a3a42] bg-[#101014] px-3 py-2 text-xs text-[#f4f4f0]"
      style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
    >
      <div className="mb-1 font-display text-sm tracking-normal text-[#2be0ff]">{label}</div>
      {payload.map((point: { name: string; value: number; color: string }, index: number) => (
        <div key={index} style={{ color: point.color }}>
          {point.name}: {point.value.toFixed(1)}%
        </div>
      ))}
    </div>
  )
}

export function InflationTracker({ series }: InflationTrackerProps) {
  const merged = useMemo<MergedRow[]>(() => {
    const byTs = new Map<number, MergedRow>()
    for (const entry of series) {
      for (const point of entry.points) {
        const row = byTs.get(point.ts) ?? { ts: point.ts, label: point.label }
        row[entry.name] = Number(point.scorePct.toFixed(2))
        byTs.set(point.ts, row)
      }
    }
    return Array.from(byTs.values()).sort((a, b) => a.ts - b.ts)
  }, [series])

  const trend = useMemo(() => {
    const allPcts = merged.flatMap((row) =>
      series.map((entry) => row[entry.name]).filter((value): value is number => typeof value === 'number')
    )

    if (allPcts.length < 4) return null

    const head = allPcts.slice(0, Math.max(3, Math.floor(allPcts.length / 4)))
    const tail = allPcts.slice(-Math.max(3, Math.floor(allPcts.length / 4)))
    const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
    const delta = avg(tail) - avg(head)

    return { delta, headAvg: avg(head), tailAvg: avg(tail) }
  }, [merged, series])

  const quips = useMemo(() => buildTrendQuips(series), [series])
  const verdict = useMemo(() => buildWatcherVerdict(quips), [quips])

  if (merged.length === 0) {
    return (
      <section
        className="border border-[#3a3a42] bg-[#131316] p-6 text-center text-sm text-[#8f919c]"
        style={{ boxShadow: '0 20px 70px rgba(0,0,0,0.35)' }}
      >
        Not enough data for inflation trend yet.
      </section>
    )
  }

  return (
    <section
      className="relative border border-[#3a3a42] bg-[#131316] p-6 sm:p-7"
      style={{ boxShadow: '0 20px 70px rgba(0,0,0,0.35)' }}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div className="pr-10">
          <div className="mb-3 h-2 w-16 bg-[#ff3d2e]" />
          <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#ff3d2e]">
            Inflation Tracker
          </div>
          <h3 className="font-display text-2xl tracking-normal text-[#f4f4f0]">
            Score pressure across seasons
          </h3>
        </div>
        {trend && (
          <div className="text-xs text-[#8f919c]">
            <span className="font-bold" style={{ color: trend.delta >= 0 ? '#22c55e' : '#ef4444' }}>
              {trend.delta >= 0 ? 'UP' : 'DOWN'} {Math.abs(trend.delta).toFixed(1)} pts
            </span>{' '}
            (avg {trend.headAvg.toFixed(1)}% to {trend.tailAvg.toFixed(1)}%)
          </div>
        )}
      </div>
      <p className="mb-4 max-w-2xl text-sm text-[#8f919c]">
        Each line is your score as a percentage of that season&apos;s max - a flat line means content
        scales with you; a downward trend means it&apos;s outpacing you.
      </p>
      {verdict && (
        <div className="mb-5 border border-[#3a3a42] bg-[#101014] p-4">
          <div className="mb-2 text-[0.72rem] font-semibold uppercase tracking-normal text-[#ffd400]">
            Watcher verdict
          </div>
          <p className="text-sm font-semibold text-[#f4f4f0]">{verdict}</p>
          {quips.length > 0 && (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {quips.map((quip) => (
                <div key={quip.id} className="border border-[#2b2b33] bg-[#131316] p-3">
                  <div
                    className="mb-1 text-[0.68rem] font-semibold uppercase tracking-normal"
                    style={{ color: quip.severity === 'praise' ? '#22c55e' : quip.severity === 'roast' ? '#ff3d2e' : '#2be0ff' }}
                  >
                    {quip.label} / {quip.mode}
                  </div>
                  <p className="text-sm leading-relaxed text-[#d8d9dd]">{quip.sentence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={merged} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b2b33" />
            <XAxis dataKey="label" stroke="#8f919c" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#8f919c"
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <ReferenceLine y={75} stroke="#3a3a42" strokeDasharray="2 4" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#f4f4f0' }} />
            {series.map((entry) => (
              <Line
                key={entry.name}
                type="monotone"
                dataKey={entry.name}
                stroke={entry.color}
                strokeWidth={2}
                dot={{ r: 3, fill: entry.color }}
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
