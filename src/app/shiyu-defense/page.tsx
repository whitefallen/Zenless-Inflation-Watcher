// ...removed unused Card, CardContent, CardHeader, CardTitle imports...
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllShiyuDefenseData } from "@/lib/shiyu-defense"
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { getAgentInfo } from "@/lib/agent-utils";
import "../metal-mania.css";
import type { ShiyuDefenseData } from "@/types/shiyu-defense"

import { Accordion } from "@/components/ui/accordion"
import { SharedAggregationTable } from "@/components/shared/aggregation-table"
import { BestWorstRuns } from "@/components/shiyu-defense/best-worst-runs"
import { ScoreProgressionChart } from "@/components/shiyu-defense/score-progression-chart"
import { PeriodComparison } from "@/components/shiyu-defense/period-comparison"
import { Recommendations } from "@/components/shiyu-defense/recommendations"
import { CharacterPerformanceTable } from "@/components/shiyu-defense/character-performance-table"


export default async function ShiyuDefensePage() {
  const allData = await getAllShiyuDefenseData();
  // Aggregation helpers
  // ...aggregateStats removed (unused)...

  // ...stats is unused...

  // History accordion
  function formatTimestamp(ts: string | number | undefined) {
    if (!ts) return 'N/A';
    // If string, try to parse as int
    const num = typeof ts === 'string' ? parseInt(ts, 10) : ts;
    // If it's a 10-digit timestamp, treat as seconds
    if (typeof num === 'number' && num > 1000000000 && num < 2000000000) {
      return new Date(num * 1000).toLocaleDateString();
    }
    // If it's a 13-digit timestamp, treat as ms
    if (typeof num === 'number' && num > 1000000000000) {
      return new Date(num).toLocaleDateString();
    }
    return 'N/A';
  }

  const historyItems = allData.map((d) => {
    const begin = formatTimestamp(d?.data?.begin_time);
    const end = formatTimestamp(d?.data?.end_time);
    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="font-semibold">{begin} - {end}</span>
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
                        <span className="font-semibold">{buff.title}:</span> <span dangerouslySetInnerHTML={{ __html: buff.text.replace(/\\n/g, '<br/>') }} />
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

  // Teams aggregation
  type TeamAgg = {
    avatars: { role_square_url: string; id: number; rarity: string }[];
    count: number;
    layers: number[];
  };
  function TeamsAggregationTable({ allData }: { allData: ShiyuDefenseData[] }) {
    const teamMap = new Map<string, TeamAgg>();
    for (const d of allData) {
      for (const floor of d?.data?.all_floor_detail || []) {
        // Process both node_1 and node_2 teams
        for (const node of [floor.node_1, floor.node_2]) {
          const team = node.avatars || [];
          if (team.length > 0) {
            const teamKey = team.map((a) => a.id).sort((a, b) => a - b).join('-');
            if (!teamMap.has(teamKey)) {
              teamMap.set(teamKey, { avatars: team, count: 0, layers: [] });
            }
            const entry = teamMap.get(teamKey)!;
            entry.count += 1;
            entry.layers.push(floor.layer_index);
          }
        }
      }
    }
    const teams: TeamAgg[] = Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
    return (
      <SharedAggregationTable<TeamAgg>
        data={teams}
        fields={[
          {
            label: "Team",
            render: (team: TeamAgg) => (
              <div className="max-w-xs">
                <ResponsiveTeamDisplay
                  agents={team.avatars.map(a => {
                    const info = getAgentInfo(a.id, { role_square_url: a.role_square_url });
                    return info || {
                      id: a.id,
                      name: `Agent ${a.id}`,
                      weaponType: '-',
                      elementType: '-',
                      rarity: 0,
                      iconUrl: a.role_square_url || '/placeholder.png'
                    };
                  })}
                  variant="table"
                />
              </div>
            ),
          },
          { label: "Times Used", render: (team: TeamAgg) => team.count },
          { label: "Highest Layer", render: (team: TeamAgg) => <span className="font-semibold">{Math.max(...team.layers)}</span> },
          { label: "Average Layer", render: (team: TeamAgg) => (team.layers.reduce((a, b) => a + b, 0) / team.layers.length).toFixed(2) },
        ]}
        emptyMessage="No team data available"
      />
    );
  }

  // Floors aggregation
  function FloorsAggregationTable({ allData }: { allData: ShiyuDefenseData[] }) {
    const floorMap = new Map();
    for (const d of allData) {
      for (const floor of d?.data?.all_floor_detail || []) {
        const key = floor.layer_index;
        if (!floorMap.has(key)) {
          floorMap.set(key, { layer: key, count: 0, ratings: [] as string[], times: [] as number[] });
        }
        const entry = floorMap.get(key);
        entry.count += 1;
        entry.ratings.push(floor.rating);
        entry.times.push(floor.node_1.battle_time);
      }
    }
    const floors = Array.from(floorMap.values()).sort((a, b) => b.count - a.count);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-card">
              <th className="px-4 py-2 text-left">Layer</th>
              <th className="px-4 py-2 text-left">Times Cleared</th>
              <th className="px-4 py-2 text-left">Best Rating</th>
              <th className="px-4 py-2 text-left">Fastest Time</th>
              <th className="px-4 py-2 text-left">Average Time</th>
            </tr>
          </thead>
          <tbody>
            {floors.map((floor, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2">{floor.layer}</td>
                <td className="px-4 py-2">{floor.count}</td>
                <td className="px-4 py-2 font-semibold">{floor.ratings.sort().reverse()[0]}</td>
                <td className="px-4 py-2">{Math.min(...floor.times)}s</td>
                <td className="px-4 py-2">{(floor.times.reduce((a: number, b: number) => a + b, 0) / floor.times.length).toFixed(2)}s</td>
              </tr>
            ))}
            {floors.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No floor data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

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
            <ScoreProgressionChart allData={allData} />
            <BestWorstRuns allData={allData} />
            <PeriodComparison allData={allData} />
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Most Used Teams</h3>
              <TeamsAggregationTable allData={allData} />
            </div>
            <CharacterPerformanceTable allData={allData} />
            <FloorsAggregationTable allData={allData} />
            <Recommendations allData={allData} />
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Accordion items={historyItems} />
        </TabsContent>
        <TabsContent value="teams" className="mt-6">
          <TeamsAggregationTable allData={allData} />
        </TabsContent>
        <TabsContent value="floors" className="mt-6">
          <FloorsAggregationTable allData={allData} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
