// Shared prop types for the analytics components. Kept in a non-'use client'
// module so server components and extractors can import them without pulling
// the client-only component code into the server bundle.

export interface RecordItem {
  label: string
  value: string | number
  sublabel?: string
}

export interface InflationSeriesPoint {
  ts: number
  label: string
  scorePct: number
}

export interface InflationSeries {
  name: string
  color: string
  points: InflationSeriesPoint[]
}

export interface ElementSeasonPoint {
  label: string
  ts: number
  counts: Record<number, number>
}

export interface SynergyTeam {
  agentIds: number[]
  agentIcons: Record<number, string>
  score?: number
}

export interface CompareSeason {
  id: string
  label: string
  ts: number
}

export interface CompareMetric {
  label: string
  value: number
  display?: string
  lowerIsBetter?: boolean
  unit?: string
}

export interface AgentEntry {
  id: number
  iconUrl: string
  seasonCount: number
}
