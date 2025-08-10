import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLatestDeadlyAssaultData, getAllDeadlyAssaultData } from "@/lib/deadly-assault"
// import { FloorDetailCard } from "@/components/deadly-assault/floor-detail-card"
// import { TeamsOverview } from "@/components/deadly-assault/teams-overview"
import { Accordion } from "@/components/ui/accordion"
import { percentile } from "@/lib/utils"
import type { TimeStamp, DeadlyAssaultData, DeadlyAssaultRun } from "@/types/deadly-assault"


function formatDateRangeFromTimeObjects(start?: TimeStamp, end?: TimeStamp) {
  if (!start || !end) return "Unknown period";
  const startDate = new Date(Date.UTC(start.year, (start.month || 1) - 1, start.day || 1));
  const endDate = new Date(Date.UTC(end.year, (end.month || 1) - 1, end.day || 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

function aggregateStats(allData: DeadlyAssaultData[]) {
  const scores: number[] = [];
  const stars: number[] = [];
  const rankPercents: number[] = [];
  for (const d of allData) {
    if (d?.data?.total_score) scores.push(d.data.total_score);
    if (d?.data?.total_star) stars.push(d.data.total_star);
    if (d?.data?.rank_percent !== undefined) rankPercents.push(d.data.rank_percent);
  }
  const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  return {
    highestScore: Math.max(...scores, 0),
    avgScore: avg(scores),
    highestStar: Math.max(...stars, 0),
    avgStar: avg(stars),
    highestRankPercent: Math.max(...rankPercents, 0),
    avgRankPercent: avg(rankPercents),
  };
}

function runDetails(run: DeadlyAssaultRun) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2"><b>Total Score:</b> <span role="img" aria-label="score">🏆</span> {run.score}</div>
      <div className="flex items-center gap-2"><b>Stars:</b> <span role="img" aria-label="stars">⭐</span> {run.star} / {run.total_star}</div>
      <div className="flex items-center gap-2">
        <b>Bosses:</b> <span role="img" aria-label="boss">👹</span>
        {run.boss.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-1 mr-2">
            {b.icon && <img src={b.icon} alt={b.name} className="w-5 h-5 inline-block rounded" />}
            {b.name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <b>Teams:</b> <span role="img" aria-label="team">👥</span>
        {run.avatar_list.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-1 mr-1">
            {a.role_square_url && <img src={a.role_square_url} alt={`Avatar #${a.id}`} className="w-5 h-5 rounded-full border inline-block" />}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <b>Buffs:</b> <span role="img" aria-label="buff">🧃</span>
        </div>
        {run.buffer.map((b, i) => (
          <div key={i} className="flex items-center gap-2 pr-2">
            {b.icon && <img src={b.icon} alt={b.name} className="w-5 h-5 rounded inline-block" />}
            <span className="font-semibold">{b.name}</span>
          </div>
        ))}
        {run.buffer.map((b, i) => (
          <div key={i + '-desc'} className="pr-8 text-xs text-muted-foreground">
            <span dangerouslySetInnerHTML={{ __html: b.desc }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DeadlyAssaultPage() {
  const [latestData, allData] = await Promise.all([
    getLatestDeadlyAssaultData(),
    getAllDeadlyAssaultData(),
  ]);
  const data = latestData;
  const stats = aggregateStats(allData || []);

  // Accordion items for history
  const historyItems = (allData || []).map((d, idx) => {
    // Use first boss icon, first avatar, and a star for playful icons
    const firstRun = d?.data?.list?.[0];
    const bossIcon = firstRun?.boss?.[0]?.icon;
    const avatarIcon = firstRun?.avatar_list?.[0]?.role_square_url;
    const starIcon = "⭐";
    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="flex items-center gap-2 font-semibold">
            {bossIcon && <img src={bossIcon} alt="Boss" className="w-6 h-6 rounded inline-block" />}
            {avatarIcon && <img src={avatarIcon} alt="Avatar" className="w-6 h-6 rounded-full inline-block border" />}
            {starIcon}
            {d?.data?.start_time && d?.data?.end_time
              ? formatDateRangeFromTimeObjects(d.data.start_time as unknown as TimeStamp, d.data.end_time as unknown as TimeStamp)
              : `Entry ${idx + 1}`}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span role="img" aria-label="score">🏆</span> {d?.data?.total_score ?? 'N/A'}
          </span>
        </div>
      ),
      content: (
        <div>
          <div className="mb-2 flex items-center gap-2"><b>UID:</b> {d?.metadata?.uid || 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2"><b>Rank Percent:</b> <span role="img" aria-label="rank">📊</span> {d?.data?.rank_percent !== undefined ? percentile(d.data.rank_percent) : 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2"><b>Total Stars:</b> <span role="img" aria-label="stars">⭐</span> {d?.data?.total_star ?? 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2"><b>Teams Used:</b> <span role="img" aria-label="team">👥</span>
            {d?.data?.list?.map((run, i) => (
              <span key={i} className="inline-flex items-center gap-1 mr-2">
                {run.avatar_list.map((a, j) => (
                  <span key={j} className="inline-flex items-center gap-1">
                    {a.role_square_url && <img src={a.role_square_url} alt={`Avatar #${a.id}`} className="w-5 h-5 rounded-full border inline-block" />}
                  </span>
                ))}
              </span>
            ))}
          </div>
          <div className="mb-2 flex items-center gap-2"><b>Buffs Used:</b> <span role="img" aria-label="buff">🧃</span> {d?.data?.list?.map(run => run.buffer.map(b => b.name).join(", ")).join(" | ")}</div>
          <div className="mb-2 flex items-center gap-2"><b>Bosses:</b> <span role="img" aria-label="boss">👹</span> {d?.data?.list?.map(run => run.boss.map(b => b.name).join(", ")).join(" | ")}</div>
          <div className="mb-2 flex items-center gap-2"><b>Runs:</b> <span role="img" aria-label="run">🏃‍♂️</span> {d?.data?.list?.length ?? 0}</div>
          <div className="mb-2"><b>Run Details:</b></div>
          <div className="space-y-2">
            {d?.data?.list?.map((run, i) => (
              <div key={i} className="border rounded p-2 bg-muted/30">
                {runDetails(run)}
              </div>
            ))}
          </div>
        </div>
      )
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col gap-8 container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex flex-col gap-2 text-center pb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Deadly Assault
          </h1>
          <p className="text-muted-foreground text-lg">
            View and analyze your Deadly Assault performance data.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="mx-auto">
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted/50 p-1">
              <TabsTrigger value="overview" className="min-w-[120px]">Overview</TabsTrigger>
              <TabsTrigger value="history" className="min-w-[120px]">History</TabsTrigger>
              <TabsTrigger value="teams" className="min-w-[120px]">Teams</TabsTrigger>
              <TabsTrigger value="floors" className="min-w-[120px]">Bosses</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <CardTitle className="text-base font-semibold text-purple-600">Highest Total Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highestScore || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Total Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgScore ? stats.avgScore.toFixed(2) : 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Star Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highestStar || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Star Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgStar ? stats.avgStar.toFixed(2) : 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Rank Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highestRankPercent ? percentile(stats.highestRankPercent) : 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rank Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRankPercent ? percentile(stats.avgRankPercent) : 'N/A'}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Accordion items={historyItems} />
        </TabsContent>
        <TabsContent value="teams" className="mt-6">
          <TeamsAggregationTable allData={allData || []} />
        </TabsContent>
        <TabsContent value="floors" className="mt-6">
          <BossesAggregationTable allData={allData || []} />
        </TabsContent>
     </Tabs>
      </div>
    </div>
  )
}

function TeamsAggregationTable({ allData }: { allData: DeadlyAssaultData[] }) {
  // Map: teamKey (sorted avatar ids) => { avatars, count, scores[] }
  const teamMap = new Map<string, { avatars: any[]; count: number; scores: number[] }>();
  for (const d of allData) {
    for (const run of d?.data?.list || []) {
      const team = run.avatar_list || [];
      const teamKey = team.map(a => a.id).sort((a, b) => a - b).join('-');
      if (!teamMap.has(teamKey)) {
        teamMap.set(teamKey, { avatars: team, count: 0, scores: [] });
      }
      const entry = teamMap.get(teamKey)!;
      entry.count += 1;
      entry.scores.push(run.score);
    }
  }
  const teams = Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-2 text-left">Team</th>
            <th className="px-4 py-2 text-left">Times Used</th>
            <th className="px-4 py-2 text-left">Highest Score</th>
            <th className="px-4 py-2 text-left">Average Score</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  {team.avatars.map((a, i) => (
                    <img key={i} src={a.role_square_url} alt={`Avatar #${a.id}`} className="w-7 h-7 rounded-full border inline-block" />
                  ))}
                </div>
              </td>
              <td className="px-4 py-2">{team.count}</td>
              <td className="px-4 py-2 font-semibold">{Math.max(...team.scores)}</td>
              <td className="px-4 py-2">{(team.scores.reduce((a, b) => a + b, 0) / team.scores.length).toFixed(2)}</td>
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

// --- Bosses Aggregation Table ---
function BossesAggregationTable({ allData }: { allData: DeadlyAssaultData[] }) {
  // Map: bossName => { icon, name, count, scores[] }
  const bossMap = new Map<string, { icon: string; name: string; count: number; scores: number[] }>();
  for (const d of allData) {
    for (const run of d?.data?.list || []) {
      for (const boss of run.boss || []) {
        if (!bossMap.has(boss.name)) {
          bossMap.set(boss.name, { icon: boss.icon, name: boss.name, count: 0, scores: [] });
        }
        const entry = bossMap.get(boss.name)!;
        entry.count += 1;
        entry.scores.push(run.score);
      }
    }
  }
  const bosses = Array.from(bossMap.values()).sort((a, b) => b.count - a.count);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-2 text-left">Boss</th>
            <th className="px-4 py-2 text-left">Times Fought</th>
            <th className="px-4 py-2 text-left">Highest Score</th>
            <th className="px-4 py-2 text-left">Average Score</th>
          </tr>
        </thead>
        <tbody>
          {bosses.map((boss, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {boss.icon && <img src={boss.icon} alt={boss.name} className="w-7 h-7 rounded inline-block" />}
                  <span>{boss.name}</span>
                </div>
              </td>
              <td className="px-4 py-2">{boss.count}</td>
              <td className="px-4 py-2 font-semibold">{Math.max(...boss.scores)}</td>
              <td className="px-4 py-2">{(boss.scores.reduce((a, b) => a + b, 0) / boss.scores.length).toFixed(2)}</td>
            </tr>
          ))}
          {bosses.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No boss data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
 
