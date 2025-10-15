// ...removed unused Card, CardContent, CardHeader, CardTitle imports...
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllShiyuDefenseData } from "@/lib/shiyu-defense"
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { getAgentInfo } from "@/lib/agent-utils";
import "../metal-mania.css";
import { formatDateRange } from "@/lib/date-utils"
import { SafeBuffText } from "@/components/shared/safe-text-display"

import { Accordion } from "@/components/ui/accordion"
import { BestWorstRuns } from "@/components/shiyu-defense/best-worst-runs"
import { ScoreProgressionChart } from "@/components/shiyu-defense/score-progression-chart"
import { PeriodComparison } from "@/components/shiyu-defense/period-comparison"
import { Recommendations } from "@/components/shiyu-defense/recommendations"
import { CharacterPerformanceTable } from "@/components/shiyu-defense/character-performance-table"
import { ShiyuDefenseTrend } from "@/components/shiyu-defense/shiyu-defense-trend"
import { ShiyuTeamsAggregationTable } from "@/components/shiyu-defense/teams-aggregation-table"
import { ShiyuFloorsAggregationTable } from "@/components/shiyu-defense/floors-aggregation-table"


export default async function ShiyuDefensePage() {
  const allData = await getAllShiyuDefenseData();
  // Aggregation helpers
  // ...aggregateStats removed (unused)...

  // ...stats is unused...

  // History accordion
  const historyItems = allData.map((d) => {
    const dateRange = formatDateRange(d?.data?.hadal_begin_time, d?.data?.hadal_end_time);
    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="font-semibold">{dateRange}</span>
          <span className="text-xs text-muted-foreground">UID: {d?.metadata?.uid || 'N/A'}</span>
        </div>
      ),
      content: (
        <div className="space-y-6">
          {(d?.data?.all_floor_detail || []).map((floor, i) => (
            <div key={i} className="border rounded p-3 mb-2 bg-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <div className="font-semibold">Layer {floor.layer_index}</div>
                <div className="text-xs text-muted-foreground">Rating: {floor.rating || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Node 1 */}
                <div>
                  <div className="font-medium mb-1">Node 1 (First Half)</div>
                  <div className="mb-1"><b>Battle Time:</b> {floor.node_1?.battle_time ? `${floor.node_1.battle_time}s` : 'N/A'}</div>
                  <div className="mb-1"><b>Team:</b></div>
                  <div className="flex gap-2 mb-1">
                    <ResponsiveTeamDisplay
                      agents={floor.node_1?.avatars?.map(a => {
                        const info = getAgentInfo(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                        return info || {
                          id: a.id,
                          name: `Agent ${a.id}`,
                          weaponType: '-',
                          elementType: '-',
                          rarity: 0,
                          iconUrl: a.role_square_url || '/placeholder.png'
                        };
                      }) || []}
                      variant="inline"
                    />
                  </div>
                </div>
                {/* Node 2 */}
                <div>
                  <div className="font-medium mb-1">Node 2 (Second Half)</div>
                  <div className="mb-1"><b>Battle Time:</b> {floor.node_2?.battle_time ? `${floor.node_2.battle_time}s` : 'N/A'}</div>
                  <div className="mb-1"><b>Team:</b></div>
                  <div className="flex gap-2 mb-1">
                    <ResponsiveTeamDisplay
                      agents={floor.node_2?.avatars?.map(a => {
                        const info = getAgentInfo(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                        return info || {
                          id: a.id,
                          name: `Agent ${a.id}`,
                          weaponType: '-',
                          elementType: '-',
                          rarity: 0,
                          iconUrl: a.role_square_url || '/placeholder.png'
                        };
                      }) || []}
                      variant="inline"
                    />
                  </div>
                </div>
              </div>
              {floor.buffs && floor.buffs.length > 0 && (
                <div className="mt-2 flex flex-col items-start text-left">
                  <b>Buffs:</b>
                  <ul className="list-disc ml-6 w-full">
                    {floor.buffs.map((buff, k) => (
                      <li key={k} className="text-left w-full">
                        <span className="font-semibold">{buff.title}:</span> <SafeBuffText text={buff.text} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col gap-8 container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex flex-col gap-2 text-center pb-8">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-zinc-700 bg-clip-text text-transparent metal-mania-regular">
            Shiyu Defense
          </h1>
          <p className="text-muted-foreground text-lg">
            View and analyze your Shiyu Defense performance data.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="mx-auto">
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-card p-1">
              <TabsTrigger value="overview" className="min-w-[120px]">Overview</TabsTrigger>
              <TabsTrigger value="history" className="min-w-[120px]">History</TabsTrigger>
              <TabsTrigger value="teams" className="min-w-[120px]">Teams</TabsTrigger>
              <TabsTrigger value="floors" className="min-w-[120px]">Floors</TabsTrigger>
            </TabsList>
          </div>
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-8 px-6">
            <ShiyuDefenseTrend data={allData} />
            <ScoreProgressionChart allData={allData} />
            <BestWorstRuns allData={allData} />
            <PeriodComparison allData={allData} />
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Most Used Teams</h3>
              <ShiyuTeamsAggregationTable allData={allData} />
            </div>
            <CharacterPerformanceTable allData={allData} />
            <ShiyuFloorsAggregationTable allData={allData} />
            <Recommendations allData={allData} />
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Accordion items={historyItems} />
        </TabsContent>
        <TabsContent value="teams" className="mt-6">
          <ShiyuTeamsAggregationTable allData={allData} />
        </TabsContent>
        <TabsContent value="floors" className="mt-6">
          <ShiyuFloorsAggregationTable allData={allData} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
