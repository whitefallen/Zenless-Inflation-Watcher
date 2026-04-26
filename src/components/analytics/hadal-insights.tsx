'use client'

import { useMemo, useState } from 'react'
import type { ShiyuDefenseData } from '@/types/shiyu-defense'
import {
  buildHadalRecords, buildHadalElementUsage, buildHadalTeams,
  buildHadalCompareSeasons, buildHadalCompareMetrics, buildHadalAgentUniverse,
  filterHadalByAgents,
} from '@/lib/analytics-extractors'
import { RecordsPanel } from './records-panel'
import { ElementUsageTrend } from './element-usage-trend'
import { AgentSynergyHeatmap } from './agent-synergy-heatmap'
import { SeasonCompare } from './season-compare'
import { AgentFilterBar } from './agent-filter-bar'
import { ShareCard } from './share-card'

const ACCENT = '#00d4ff'

export function HadalInsights({ data }: { data: ShiyuDefenseData[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const filtered = useMemo(() => filterHadalByAgents(data, selected), [data, selected])
  const agentUniverse = useMemo(() => buildHadalAgentUniverse(data), [data])
  const compareSeasons = useMemo(() => buildHadalCompareSeasons(filtered), [filtered])
  const getCompareMetrics = useMemo(
    () => (id: string) => buildHadalCompareMetrics(filtered, id),
    [filtered]
  )
  const latest = filtered[0]
  const rating = latest?.data?.rating_list?.[0]?.rating

  return (
    <div className="space-y-6">
      <AgentFilterBar agents={agentUniverse} selected={selected} onChange={setSelected} accent={ACCENT} />
      <RecordsPanel title="Personal Bests" accent={ACCENT} records={buildHadalRecords(filtered)} />
      <SeasonCompare seasons={compareSeasons} getMetrics={getCompareMetrics} accent={ACCENT} />
      <ElementUsageTrend accent={ACCENT} data={buildHadalElementUsage(filtered)} />
      <AgentSynergyHeatmap accent={ACCENT} teams={buildHadalTeams(filtered)} />
      {latest && (
        <ShareCard
          accent={ACCENT}
          mode="Hadal Blacksite"
          title={`Season ${latest.data?.hadal_begin_time?.year}-${latest.data?.hadal_begin_time?.month}`}
          stats={[
            { label: 'Score', value: latest.data?.hadal_score?.toLocaleString() ?? '—' },
            { label: 'Rating', value: rating ?? '—' },
            { label: 'Rank', value: latest.data?.hadal_rank_percent !== undefined ? `top ${latest.data.hadal_rank_percent / 100}%` : '—' },
            { label: 'Floors', value: latest.data?.all_floor_detail?.length ?? 0 },
          ]}
        />
      )}
    </div>
  )
}
