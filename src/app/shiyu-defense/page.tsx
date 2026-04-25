import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllShiyuDefenseData } from "@/lib/shiyu-defense"
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { getAgentInfo } from "@/lib/agent-utils";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateRange } from "@/lib/date-utils"
import { SafeBuffText } from "@/components/shared/safe-text-display"

import { Accordion } from "@/components/ui/accordion"
// Legacy v1 components (time-based)
import { BestWorstRuns } from "@/components/shiyu-defense/best-worst-runs"
import { ScoreProgressionChart } from "@/components/shiyu-defense/score-progression-chart"
import { PeriodComparison } from "@/components/shiyu-defense/period-comparison"
import { Recommendations } from "@/components/shiyu-defense/recommendations"
import { CharacterPerformanceTable } from "@/components/shiyu-defense/character-performance-table"
import { ShiyuDefenseTrend } from "@/components/shiyu-defense/shiyu-defense-trend"
import { ShiyuTeamsAggregationTable } from "@/components/shiyu-defense/teams-aggregation-table"
import { ShiyuFloorsAggregationTable } from "@/components/shiyu-defense/floors-aggregation-table"
// New v2 components (score-based)
import { HadalTrend } from "@/components/shiyu-defense-v2/hadal-trend"
import { ScoreProgressionChartV2 } from "@/components/shiyu-defense-v2/score-progression-chart"
import { HadalSummaryCards } from "@/components/shiyu-defense-v2/hadal-summary-cards"
import { HadalBreakdownCharts } from "@/components/shiyu-defense-v2/hadal-breakdown-charts"


export default async function ShiyuDefensePage() {
  const allData = await getAllShiyuDefenseData();
  
  // Separate v2 (Hadal Blacksite, score-based) from v1 (legacy, time-based)
  const v2Data = allData.filter(d => d.metadata?.sourceVersion === "v2");
  const v1Data = allData.filter(d => d.metadata?.sourceVersion !== "v2");
  const hasV2Data = v2Data.length > 0;
  const hasV1Data = v1Data.length > 0;

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
    <div className="min-h-screen bg-background -mt-12 -mx-4">
      <PageHeader
        code="02"
        title="Shiyu Defense"
        subtitle={hasV2Data ? "Hadal Blacksite" : "Floor Gauntlet"}
        description={hasV2Data
          ? "Score-based performance tracking across Hadal Blacksite seasons."
          : "Analyze floor completions, team compositions, and battle times."}
        accent="cyan"
        stats={allData.length > 0 ? [
          { label: "Seasons Tracked", value: allData.length, accent: "cyan" },
          { label: "V2 Score-based", value: v2Data.length, accent: "gold" },
          { label: "V1 Legacy", value: v1Data.length, accent: "orange" },
        ] : undefined}
      />

      <div className="flex flex-col gap-8 container mx-auto py-8 px-4 max-w-5xl">
        {allData.length === 0 && (
          <div
            className="border p-6 text-center text-[#6b7280] text-sm"
            style={{
              background: 'rgba(0,212,255,0.04)',
              borderColor: 'rgba(0,212,255,0.15)',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}
          >
            No Shiyu Defense data available yet. Run the fetch scripts to populate your local data folders.
          </div>
        )}

        <Tabs defaultValue={hasV2Data ? "hadal-v2" : "overview"} className="w-full">
          <div>
            <TabsList>
              {hasV2Data && <TabsTrigger value="hadal-v2">Hadal Blacksite</TabsTrigger>}
              {hasV1Data && <TabsTrigger value="overview">Legacy (V1)</TabsTrigger>}
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="floors">Floors</TabsTrigger>
            </TabsList>
          </div>

          {hasV2Data && (
            <TabsContent value="hadal-v2" className="mt-6">
              <div className="space-y-8">
                <HadalSummaryCards data={v2Data} />
                <HadalTrend data={v2Data} />
                <ScoreProgressionChartV2 allData={v2Data} />
                <HadalBreakdownCharts data={v2Data} />
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-[#6b7280] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#00d4ff] inline-block" />
                    Team Compositions
                  </h3>
                  <ShiyuTeamsAggregationTable allData={v2Data} />
                </div>
                <CharacterPerformanceTable allData={v2Data} />
                <ShiyuFloorsAggregationTable allData={v2Data} />
              </div>
            </TabsContent>
          )}

          {hasV1Data && (
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-8">
                <ShiyuDefenseTrend data={v1Data} />
                <ScoreProgressionChart allData={v1Data} />
                <BestWorstRuns allData={v1Data} />
                <PeriodComparison allData={v1Data} />
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-[#6b7280] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#00d4ff] inline-block" />
                    Most Used Teams
                  </h3>
                  <ShiyuTeamsAggregationTable allData={v1Data} />
                </div>
                <CharacterPerformanceTable allData={v1Data} />
                <ShiyuFloorsAggregationTable allData={v1Data} />
                <Recommendations allData={v1Data} />
              </div>
            </TabsContent>
          )}

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
