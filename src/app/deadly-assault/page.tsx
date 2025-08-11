
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLatestDeadlyAssaultData, getAllDeadlyAssaultData } from "@/lib/deadly-assault";
import { Accordion } from "@/components/ui/accordion";
import { percentile } from "@/lib/utils";
import type { TimeStamp, DeadlyAssaultData } from "@/types/deadly-assault";
import { RunDetails } from "@/components/deadly-assault/run-details";
import { TeamsAggregationTable } from "@/components/deadly-assault/teams-aggregation-table";
import { BossDifficultyTable } from "@/components/deadly-assault/boss-difficulty-table";
// import { ClearTimeTable } from "@/components/deadly-assault/clear-time-table";
import { PeriodComparison } from "@/components/deadly-assault/period-comparison";
// import { PersonalBests } from "@/components/deadly-assault/personal-bests";
// import { TimeOfDayAnalysis } from "@/components/deadly-assault/time-of-day-analysis";
// import { CorrelationAnalysis } from "@/components/deadly-assault/correlation-analysis";
import { Recommendations } from "@/components/deadly-assault/recommendations";
import { FilteringControls } from "@/components/deadly-assault/filtering-controls";
import { BossesAggregationTable } from "@/components/deadly-assault/bosses-aggregation-table";
import { ScoreProgressionChart } from "@/components/deadly-assault/score-progression-chart";
import { BestWorstRuns } from "@/components/deadly-assault/best-worst-runs";
import { CharacterPerformanceTable } from "@/components/deadly-assault/character-performance-table";


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




export default async function DeadlyAssaultPage() {
  const [latestData, allData] = await Promise.all([
    getLatestDeadlyAssaultData(),
    getAllDeadlyAssaultData(),
  ]);
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
              <div key={i} className="border rounded p-2 bg-card">
                <RunDetails run={run} />
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
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-card p-1">
              <TabsTrigger value="overview" className="min-w-[120px]">Overview</TabsTrigger>
              <TabsTrigger value="history" className="min-w-[120px]">History</TabsTrigger>
              <TabsTrigger value="teams" className="min-w-[120px]">Teams</TabsTrigger>
              <TabsTrigger value="floors" className="min-w-[120px]">Bosses</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-8 px-6">
            {/* Export/Share controls removed as requested */}
            <FilteringControls allData={allData || []} onFilter={() => {}} />
            <ScoreProgressionChart allData={allData || []} />
            <BestWorstRuns allData={allData || []} />
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Most Used Teams</h3>
              <TeamsAggregationTable allData={allData || []} />
            </div>
            <CharacterPerformanceTable allData={allData || []} />
            <BossDifficultyTable allData={allData || []} />
            {/* <ClearTimeTable allData={allData || []} /> */}
            <PeriodComparison allData={allData || []} />
            {/* <PersonalBests allData={allData || []} /> */}
            {/* <TimeOfDayAnalysis allData={allData || []} /> */}
            {/* <Heatmap allData={allData || []} /> */}
            {/* <CorrelationAnalysis allData={allData || []} /> */}
            {/* <PersonalBests allData={allData || []} /> */}
            {/* <TimeOfDayAnalysis allData={allData || []} /> */}
            {/* <Heatmap allData={allData || []} /> */}
            {/* <CorrelationAnalysis allData={allData || []} /> */}
            <Recommendations allData={allData || []} />
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
  );
}




 
