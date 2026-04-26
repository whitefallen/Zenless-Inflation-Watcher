'use client'

import { useMemo, useState } from 'react'
import type { DeadlyAssaultData } from '@/types/deadly-assault'
import {
  buildDaRecords, buildDaElementUsage, buildDaTeams,
  buildDaCompareSeasons, buildDaCompareMetrics, buildDaAgentUniverse,
  filterDaByAgents,
} from '@/lib/analytics-extractors'
import { RecordsPanel } from './records-panel'
import { ElementUsageTrend } from './element-usage-trend'
import { AgentSynergyHeatmap } from './agent-synergy-heatmap'
import { SeasonCompare } from './season-compare'
import { AgentFilterBar } from './agent-filter-bar'
import { ShareCard } from './share-card'

const ACCENT = '#f5c842'

export function DaInsights({ data }: { data: DeadlyAssaultData[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const filtered = useMemo(() => filterDaByAgents(data, selected), [data, selected])
  const agentUniverse = useMemo(() => buildDaAgentUniverse(data), [data])
  const compareSeasons = useMemo(() => buildDaCompareSeasons(filtered), [filtered])
  const getCompareMetrics = useMemo(
    () => (id: string) => buildDaCompareMetrics(filtered, id),
    [filtered]
  )
  const latest = filtered[0]

  return (
    <div className="space-y-6">
      <AgentFilterBar agents={agentUniverse} selected={selected} onChange={setSelected} accent={ACCENT} />
      <RecordsPanel title="Personal Bests" accent={ACCENT} records={buildDaRecords(filtered)} />
      <SeasonCompare seasons={compareSeasons} getMetrics={getCompareMetrics} accent={ACCENT} />
      <ElementUsageTrend accent={ACCENT} data={buildDaElementUsage(filtered)} />
      <AgentSynergyHeatmap accent={ACCENT} teams={buildDaTeams(filtered)} />
      {latest && (
        <ShareCard
          accent={ACCENT}
          mode="Deadly Assault"
          title={`Season ${latest.data?.end_time?.year}-${latest.data?.end_time?.month}`}
          stats={[
            { label: 'Score', value: latest.data?.total_score?.toLocaleString() ?? '—' },
            { label: 'Stars', value: latest.data?.total_star ?? '—' },
            { label: 'Rank', value: latest.data?.rank_percent !== undefined ? `top ${latest.data.rank_percent / 100}%` : '—' },
            { label: 'Runs', value: latest.data?.list?.length ?? 0 },
          ]}
        />
      )}
    </div>
  )
}
