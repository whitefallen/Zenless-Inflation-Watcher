
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { DaAnalytics } from "@/components/deadly-assault/da-analytics";
import { PageHeader } from "@/components/shared/page-header";


export default async function DeadlyAssaultPage() {
  const allData = await getAllDeadlyAssaultData();

  // Compute summary stats
  const totalSeasons = allData?.length ?? 0;
  const latestScore = allData?.[allData.length - 1]?.data?.total_score ?? 'N/A';
  const latestStars = allData?.[allData.length - 1]?.data?.total_star ?? 'N/A';

  // Accordion items for history
  const historyItems = (allData || []).map((d, idx) => {
    const firstRun = d?.data?.list?.[0];
    const bossIcon = firstRun?.boss?.[0]?.icon;
    const avatarIcon = firstRun?.avatar_list?.[0]?.role_square_url;
    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="flex items-center gap-2 font-semibold text-[#e8e0cc]">
            {bossIcon && <Image src={bossIcon} alt="Boss" width={24} height={24} className="w-6 h-6 inline-block" unoptimized />}
            {avatarIcon && <Image src={avatarIcon} alt="Avatar" width={24} height={24} className="w-6 h-6 inline-block border border-[#1e2438]" unoptimized />}
            {d?.data?.start_time && d?.data?.end_time
              ? formatDateRange(d.data.start_time as unknown as TimeStamp, d.data.end_time as unknown as TimeStamp)
              : `Entry ${idx + 1}`}
          </span>
          <span className="text-xs text-[#f5c842] font-bold">
            Score: {d?.data?.total_score ?? 'N/A'}
          </span>
        </div>
      ),
      content: (
        <div className="text-sm text-[#e8e0cc]">
          <div className="mb-2 flex items-center gap-2"><b className="text-[#6b7280]">UID:</b> {d?.metadata?.uid || 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2"><b className="text-[#6b7280]">Rank %:</b> {d?.data?.rank_percent !== undefined ? percentile(d.data.rank_percent) : 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2"><b className="text-[#6b7280]">Total Stars:</b> <span className="text-[#f5c842]">{d?.data?.total_star ?? 'N/A'}</span></div>
          <div className="mb-2 flex flex-wrap items-center gap-2"><b className="text-[#6b7280]">Teams Used:</b>
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
          <div className="mb-2 flex items-center gap-2"><b className="text-[#6b7280]">Bosses:</b> {d?.data?.list?.map(run => run.boss.map(b => b.name).join(", ")).join(" | ")}</div>
          <div className="mb-4"><b className="text-[#6b7280]">Run Details:</b></div>
          <div className="space-y-2">
            {d?.data?.list?.map((run, i) => (
              <div key={i} className="border border-[#1e2438] p-3 bg-[#0f1117]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                <RunDetails run={run} />
              </div>
            ))}
          </div>
        </div>
      )
    }
  });

  return (
    <div className="min-h-screen bg-background -mt-12 -mx-4">
      {/* Page Header */}
      <PageHeader
        code="01"
        title="Deadly Assault"
        subtitle="Boss Challenge"
        description="Track scores, star ratings, boss completions and team performance across every season."
        accent="gold"
        stats={totalSeasons > 0 ? [
          { label: "Seasons Tracked", value: totalSeasons, accent: "gold" },
          { label: "Latest Score", value: latestScore, accent: "gold" },
          { label: "Latest Stars", value: latestStars, accent: "cyan" },
        ] : undefined}
      />

      <div className="flex flex-col gap-8 container mx-auto py-8 px-4 max-w-5xl">
        <Tabs defaultValue="overview" className="w-full">
          <div>
            <TabsList>
              <TabsTrigger value="overview">Analytics</TabsTrigger>
              <TabsTrigger value="deep-dive">Deep Dive</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="bosses">Bosses</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6">
            {/* New analytics-first overview */}
            <DaAnalytics data={allData || []} />
          </TabsContent>
          <TabsContent value="deep-dive" className="mt-6">
            <div className="space-y-8">
              <DeadlyAssaultTrend data={allData || []} />
              <ScoreProgressionChart allData={allData || []} />
              <BestWorstRuns allData={allData || []} />
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
          <TabsContent value="bosses" className="mt-6">
            <BossesAggregationTable allData={allData || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
