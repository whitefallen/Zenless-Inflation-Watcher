import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllShiyuDefenseData } from "@/lib/shiyu-defense"
// import Image from "next/image"
import type { ShiyuDefenseData } from "@/types/shiyu-defense"
import { Accordion } from "@/components/ui/accordion"


export default async function ShiyuDefensePage() {
  const allData = await getAllShiyuDefenseData();
  // Aggregation helpers
  function aggregateStats(allData: ShiyuDefenseData[]) {
    const maxLayers = allData.map((d) => d?.data?.max_layer || 0);
    const fastTimes = allData.map((d) => d?.data?.fast_layer_time || 0).filter(Boolean);
    const ratings = allData.flatMap((d) => d?.data?.rating_list?.map((r) => r.rating) || []);
    // Average layer time: average of all node_1.battle_time for all floors in all runs
    const allLayerTimes: number[] = allData.flatMap((d) =>
      (d?.data?.all_floor_detail || []).map((floor) => floor.node_1.battle_time)
    );
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return {
      highestLayer: Math.max(...maxLayers, 0),
      avgLayer: avg(maxLayers),
      highestFastTime: fastTimes.length ? Math.min(...fastTimes) : 0,
      avgFastTime: avg(fastTimes),
      highestRating: ratings.sort().reverse()[0] || 'N/A',
      avgLayerTime: avg(allLayerTimes),
    };
  }

  const stats = aggregateStats(allData);

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

  const historyItems = allData.map((d, idx) => {
    const begin = formatTimestamp(d?.data?.begin_time);
    const end = formatTimestamp(d?.data?.end_time);
    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="font-semibold">{begin} - {end}</span>
          <span className="text-xs text-muted-foreground">Max Layer: {d?.data?.max_layer ?? 'N/A'}</span>
        </div>
      ),
      content: (
        <div>
          <div className="mb-2"><b>UID:</b> {d?.metadata?.uid || 'N/A'}</div>
          <div className="mb-2"><b>Rating:</b> {d?.data?.rating_list?.[0]?.rating || 'N/A'}</div>
          <div className="mb-2"><b>Max Layer:</b> {d?.data?.max_layer ?? 'N/A'}</div>
          <div className="mb-2"><b>Fast Layer Time:</b> {d?.data?.fast_layer_time ? `${d.data.fast_layer_time}s` : 'N/A'}</div>
          <div className="mb-2"><b>Floors Cleared:</b> {d?.data?.all_floor_detail?.length ?? 0}</div>
          <div className="mb-2"><b>Run Details:</b></div>
          <div className="space-y-2">
            {d?.data?.all_floor_detail?.map((floor, i) => (
              <div key={i} className="border rounded p-2 bg-card">
                <b>Layer {floor.layer_index}:</b> Rating: {floor.rating}, Battle Time: {floor.node_1.battle_time}s
                <div className="flex gap-2 mt-1">
                  {floor.node_1.avatars.map((a, j) => (
                    <img key={j} src={a.role_square_url} alt={`Avatar #${a.id}`} width={24} height={24} className="w-6 h-6 rounded-full border inline-block" loading="lazy" />
                  ))}
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
        </div>
      )
    }
  });

  // Teams aggregation
  function TeamsAggregationTable({ allData }: { allData: ShiyuDefenseData[] }) {
    const teamMap = new Map();
    for (const d of allData) {
      for (const floor of d?.data?.all_floor_detail || []) {
        const team = floor.node_1.avatars || [];
        const teamKey = team.map((a) => a.id).sort((a, b) => a - b).join('-');
        if (!teamMap.has(teamKey)) {
          teamMap.set(teamKey, { avatars: team, count: 0, layers: [] as number[] });
        }
        const entry = teamMap.get(teamKey);
        entry.count += 1;
        entry.layers.push(floor.layer_index);
      }
    }
    const teams = Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-card">
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-left">Times Used</th>
              <th className="px-4 py-2 text-left">Highest Layer</th>
              <th className="px-4 py-2 text-left">Average Layer</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2">
                  <div className="flex gap-1">
            {team.avatars.map((a: { role_square_url: string; id: number }, i: number) => (
              <img key={i} src={a.role_square_url} alt={`Avatar #${a.id}`} width={28} height={28} className="w-7 h-7 rounded-full border inline-block" loading="lazy" />
            ))}
                  </div>
                </td>
                <td className="px-4 py-2">{team.count}</td>
                <td className="px-4 py-2 font-semibold">{Math.max(...team.layers)}</td>
                <td className="px-4 py-2">{(team.layers.reduce((a: number, b: number) => a + b, 0) / team.layers.length).toFixed(2)}</td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No team data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card">
                <CardTitle className="text-base font-semibold text-blue-600">Highest Max Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highestLayer || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Max Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgLayer ? stats.avgLayer.toFixed(2) : 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highestRating}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fastest Layer Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highestFastTime ? `${stats.highestFastTime}s` : 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Fast Layer Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgFastTime ? `${stats.avgFastTime.toFixed(2)}s` : 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Layer Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgLayerTime ? `${stats.avgLayerTime.toFixed(2)}s` : 'N/A'}</div>
              </CardContent>
            </Card>
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
