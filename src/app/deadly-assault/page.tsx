
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "../metal-mania.css";
import Image from "next/image";
import { getAllDeadlyAssaultData } from "@/lib/deadly-assault";
import { Accordion } from "@/components/ui/accordion";
import { percentile } from "@/lib/utils";
import type { TimeStamp } from "@/types/deadly-assault";
import { formatDateRange } from "@/lib/date-utils";
import { RunDetails } from "@/components/deadly-assault/run-details";
import { TeamsAggregationTable } from "@/components/deadly-assault/teams-aggregation-table";
import { BossDifficultyTable } from "@/components/deadly-assault/boss-difficulty-table";
import { PeriodComparison } from "@/components/deadly-assault/period-comparison";
import { Recommendations } from "@/components/deadly-assault/recommendations";
import { BossesAggregationTable } from "@/components/deadly-assault/bosses-aggregation-table";
import { ScoreProgressionChart } from "@/components/deadly-assault/score-progression-chart";
import { BestWorstRuns } from "@/components/deadly-assault/best-worst-runs";
import { getAgentInfo } from "@/lib/agent-utils";
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { CharacterPerformanceTable } from "@/components/deadly-assault/character-performance-table";
import { DeadlyAssaultTrend } from "@/components/deadly-assault/deadly-assault-trend";


export default async function DeadlyAssaultPage() {
  const allData = await getAllDeadlyAssaultData();

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
            {bossIcon && <Image src={bossIcon} alt="Boss" width={24} height={24} className="w-6 h-6 rounded inline-block" unoptimized />}
            {avatarIcon && <Image src={avatarIcon} alt="Avatar" width={24} height={24} className="w-6 h-6 rounded-full inline-block border" unoptimized />}
            {starIcon}
            {d?.data?.start_time && d?.data?.end_time
              ? formatDateRange(d.data.start_time as unknown as TimeStamp, d.data.end_time as unknown as TimeStamp)
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
                <ResponsiveTeamDisplay
                  agents={run.avatar_list.map(a => {
                    const info = getAgentInfo(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                    return info || {
                      id: a.id,
                      name: `Agent ${a.id}`,
                      weaponType: '-',
                      elementType: '-',
                      rarity: 0,
                      iconUrl: a.role_square_url || '/placeholder.png'
                    };
                  })}
                  variant="inline"
                  maxAgents={4}
                />
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
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-zinc-700 bg-clip-text text-transparent metal-mania-regular">
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
            <DeadlyAssaultTrend data={allData || []} />
            <ScoreProgressionChart allData={allData || []} />
            <BestWorstRuns allData={allData || []} />
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Most Used Teams</h3>
              <TeamsAggregationTable allData={allData || []} />
            </div>
            <CharacterPerformanceTable allData={allData || []} />
            <BossDifficultyTable allData={allData || []} />
            <PeriodComparison allData={allData || []} />
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




 
