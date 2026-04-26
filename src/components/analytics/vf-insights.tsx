'use client'

import { useMemo, useState } from 'react'
import type { VoidFrontData } from '@/types/void-front'
import {
  buildVfRecords, buildVfElementUsage, buildVfTeams,
  buildVfCompareSeasons, buildVfCompareMetrics, buildVfAgentUniverse,
  filterVfByAgents,
} from '@/lib/analytics-extractors'
import { RecordsPanel } from './records-panel'
import { ElementUsageTrend } from './element-usage-trend'
import { AgentSynergyHeatmap } from './agent-synergy-heatmap'
import { SeasonCompare } from './season-compare'
import { AgentFilterBar } from './agent-filter-bar'
import { ShareCard } from './share-card'

const ACCENT = '#a855f7'

export function VfInsights({ data }: { data: VoidFrontData[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const filtered = useMemo(() => filterVfByAgents(data, selected), [data, selected])
  const agentUniverse = useMemo(() => buildVfAgentUniverse(data), [data])
  const compareSeasons = useMemo(() => buildVfCompareSeasons(filtered), [filtered])
  const getCompareMetrics = useMemo(
    () => (id: string) => buildVfCompareMetrics(filtered, id),
    [filtered]
  )
  const latest = filtered[0]
  const brief = latest?.data?.void_front_battle_abstract_info_brief

  return (
    <div className="space-y-6">
      <AgentFilterBar agents={agentUniverse} selected={selected} onChange={setSelected} accent={ACCENT} />
      <RecordsPanel title="Personal Bests" accent={ACCENT} records={buildVfRecords(filtered)} />
      <SeasonCompare seasons={compareSeasons} getMetrics={getCompareMetrics} accent={ACCENT} />
      <ElementUsageTrend accent={ACCENT} data={buildVfElementUsage(filtered)} />
      <AgentSynergyHeatmap accent={ACCENT} teams={buildVfTeams(filtered)} />
      {brief && (
        <ShareCard
          accent={ACCENT}
          mode="Void Front"
          title={brief.ending_record_name || 'Latest Run'}
          stats={[
            { label: 'Score', value: brief.total_score?.toLocaleString() ?? '—' },
            { label: 'Rank', value: brief.rank_percent !== undefined ? `top ${(brief.rank_percent / 100).toFixed(2)}%` : '—' },
            { label: 'Challenges', value: latest?.data?.main_challenge_record_list?.length ?? 0 },
          ]}
        />
      )}
    </div>
  )
}
