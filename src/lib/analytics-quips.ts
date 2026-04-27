import type { InflationSeries } from '@/components/analytics/types'

export interface TrendQuip {
  id: string
  mode: string
  label: string
  sentence: string
  severity: 'praise' | 'neutral' | 'roast'
  delta: number
}

interface TrendProfile {
  mode: string
  delta: number
  seasons: number
  latest: number
  peak: number
  recovery: number
  volatility: number
}

function round(value: number) {
  return Number(value.toFixed(1))
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function pick<T>(items: T[], seed: string) {
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return items[hash % items.length]
}

function describeSeverity(delta: number): TrendQuip['severity'] {
  if (delta >= 5) return 'praise'
  if (delta <= -5) return 'roast'
  return 'neutral'
}

function buildProfile(series: InflationSeries): TrendProfile | null {
  const points = [...series.points].sort((a, b) => a.ts - b.ts)
  if (points.length < 2) return null

  const windowSize = Math.max(1, Math.min(2, points.length - 1))
  const head = points.slice(0, windowSize).map((point) => point.scorePct)
  const tail = points.slice(-windowSize).map((point) => point.scorePct)
  const latest = points[points.length - 1].scorePct
  const previous = points[points.length - 2].scorePct
  const peak = Math.max(...points.map((point) => point.scorePct))
  const deltas = points.slice(1).map((point, index) => Math.abs(point.scorePct - points[index].scorePct))

  return {
    mode: series.name,
    delta: round(average(tail) - average(head)),
    seasons: points.length,
    latest: round(latest),
    peak: round(peak),
    recovery: round(latest - previous),
    volatility: round(average(deltas)),
  }
}

function modeNick(mode: string) {
  if (/deadly/i.test(mode)) return 'DA'
  if (/hadal|shiyu/i.test(mode)) return 'Hadal'
  if (/void/i.test(mode)) return 'Void Front'
  return mode
}

function sentenceFor(profile: TrendProfile): TrendQuip {
  const nick = modeNick(profile.mode)
  const severity = describeSeverity(profile.delta)
  const absDelta = Math.abs(profile.delta).toFixed(1)
  const latest = profile.latest.toFixed(1)
  const peakDrop = Math.max(0, profile.peak - profile.latest).toFixed(1)
  const seed = `${profile.mode}:${profile.delta}:${profile.latest}:${profile.seasons}:${profile.recovery}`

  if (severity === 'praise') {
    const templates = [
      `${nick} is up ${absDelta} points across ${profile.seasons} seasons. The watcher checked twice; apparently that glow-up is legal.`,
      `${nick} climbed ${absDelta} points and now sits at ${latest}%. Suspiciously competent behavior.`,
      `${nick} gained ${absDelta} points. Please keep this pace, it makes the chart look employed.`,
    ]
    return { id: profile.mode, mode: profile.mode, label: 'Praise', sentence: pick(templates, seed), severity, delta: profile.delta }
  }

  if (severity === 'roast') {
    const templates = [
      `${nick} dropped ${absDelta} points in ${profile.seasons} seasons. The watcher is not angry, just disappointed and making notes.`,
      `${nick} is down ${absDelta} points from its early pace. You used to scare the content; now the content has questions.`,
      `${nick} slid ${absDelta} points and is ${peakDrop} off its peak. Are we calling this strategy, or should I dim the lights?`,
    ]
    return { id: profile.mode, mode: profile.mode, label: 'Roast', sentence: pick(templates, seed), severity, delta: profile.delta }
  }

  const templates = [
    `${nick} moved ${absDelta} points across ${profile.seasons} seasons. Technically a trend, emotionally a shrug.`,
    `${nick} is holding near ${latest}%. Stable, tidy, and just dramatic enough to get a tab.`,
    `${nick} barely shifted. The watcher tried to roast it, but the data refused to provide material.`,
  ]
  return { id: profile.mode, mode: profile.mode, label: 'Stable', sentence: pick(templates, seed), severity, delta: profile.delta }
}

export function buildTrendQuips(series: InflationSeries[]) {
  return series
    .map(buildProfile)
    .filter((profile): profile is TrendProfile => profile !== null)
    .map(sentenceFor)
}

export function buildWatcherVerdict(quips: TrendQuip[]) {
  if (quips.length === 0) return null

  const averageDelta = round(average(quips.map((quip) => quip.delta)))
  const worst = [...quips].sort((a, b) => a.delta - b.delta)[0]
  const best = [...quips].sort((a, b) => b.delta - a.delta)[0]

  if (averageDelta <= -5) {
    return `Overall pressure is down ${Math.abs(averageDelta).toFixed(1)} points. ${modeNick(worst.mode)} is currently doing the most damage to the family name.`
  }

  if (averageDelta >= 5) {
    return `Overall pressure is up ${averageDelta.toFixed(1)} points. ${modeNick(best.mode)} is carrying the clipboard and the attitude.`
  }

  return `Overall pressure moved ${Math.abs(averageDelta).toFixed(1)} points. The watcher has seen spicier graphs, but this one is at least awake.`
}
