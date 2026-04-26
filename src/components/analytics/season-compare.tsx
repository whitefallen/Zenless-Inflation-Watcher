'use client'

import { useState, useMemo } from 'react'

import type { CompareSeason, CompareMetric } from './types'
export type { CompareSeason, CompareMetric }

interface SeasonCompareProps {
  seasons: CompareSeason[]
  /** Computes the metrics for a given season id. */
  getMetrics: (seasonId: string) => CompareMetric[]
  accent?: string
}

function fmtNumber(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return Math.abs(n) >= 1000 ? n.toLocaleString() : Number(n.toFixed(2)).toString()
}

function fmtDelta(left: number, right: number, unit = '', lowerIsBetter = false) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    return { text: '—', color: '#6b7280' }
  }
  const diff = right - left
  if (diff === 0) return { text: '±0', color: '#6b7280' }
  const better = lowerIsBetter ? diff < 0 : diff > 0
  const sign = diff > 0 ? '+' : '−'
  return {
    text: `${sign}${fmtNumber(Math.abs(diff))}${unit}`,
    color: better ? '#22c55e' : '#ef4444',
  }
}

export function SeasonCompare({ seasons, getMetrics, accent = '#00d4ff' }: SeasonCompareProps) {
  // Default to comparing the latest two seasons (sorted desc by ts on render below)
  const sortedSeasons = useMemo(() => [...seasons].sort((a, b) => b.ts - a.ts), [seasons])
  const [leftId, setLeftId] = useState(sortedSeasons[1]?.id ?? sortedSeasons[0]?.id ?? '')
  const [rightId, setRightId] = useState(sortedSeasons[0]?.id ?? '')

  const leftMetrics = useMemo(() => (leftId ? getMetrics(leftId) : []), [leftId, getMetrics])
  const rightMetrics = useMemo(() => (rightId ? getMetrics(rightId) : []), [rightId, getMetrics])

  if (sortedSeasons.length < 2) {
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
        Need at least two seasons to compare.
      </section>
    )
  }

  const rows = leftMetrics.map((lm, i) => {
    const rm = rightMetrics[i] ?? { label: lm.label, value: NaN }
    return {
      label: lm.label,
      left: lm,
      right: rm,
      delta: fmtDelta(lm.value, rm.value, rm.unit ?? lm.unit ?? '', rm.lowerIsBetter ?? lm.lowerIsBetter),
    }
  })

  const selectStyle: React.CSSProperties = {
    background: '#0d0f17',
    border: `1px solid ${accent}55`,
    color: '#e8e0cc',
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 600,
    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
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
        Compare Seasons
      </div>
      <h3 className="text-lg font-black text-[#e8e0cc] mb-3">Side-by-side delta</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.15em] text-[#6b7280]">
          Left
          <select value={leftId} onChange={e => setLeftId(e.target.value)} style={selectStyle}>
            {sortedSeasons.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.15em] text-[#6b7280]">
          Right
          <select value={rightId} onChange={e => setRightId(e.target.value)} style={selectStyle}>
            {sortedSeasons.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="grid gap-px bg-[#1e2438] border border-[#1e2438]"
        style={{ gridTemplateColumns: 'minmax(120px, 1.4fr) repeat(3, minmax(0, 1fr))' }}
      >
        <div className="bg-[#0d0f17] px-3 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">Metric</div>
        <div className="bg-[#0d0f17] px-3 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280] text-right">Left</div>
        <div className="bg-[#0d0f17] px-3 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280] text-right">Right</div>
        <div className="bg-[#0d0f17] px-3 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280] text-right">Δ</div>
        {rows.map((r, i) => (
          <FragmentRow key={`${r.label}-${i}`} row={r} />
        ))}
      </div>
    </section>
  )
}

function FragmentRow({ row }: { row: { label: string; left: CompareMetric; right: CompareMetric; delta: { text: string; color: string } } }) {
  return (
    <>
      <div className="bg-[#0d0f17] px-3 py-2 text-xs text-[#e8e0cc]">{row.label}</div>
      <div className="bg-[#0d0f17] px-3 py-2 text-xs text-[#e8e0cc] text-right tabular-nums">{row.left.display ?? fmtNumber(row.left.value)}</div>
      <div className="bg-[#0d0f17] px-3 py-2 text-xs text-[#e8e0cc] text-right tabular-nums">{row.right.display ?? fmtNumber(row.right.value)}</div>
      <div className="bg-[#0d0f17] px-3 py-2 text-xs font-bold text-right tabular-nums" style={{ color: row.delta.color }}>{row.delta.text}</div>
    </>
  )
}
