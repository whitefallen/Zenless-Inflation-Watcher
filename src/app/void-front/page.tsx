import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image";
import { Accordion } from "@/components/ui/accordion";
import { getAllVoidFrontData } from "@/lib/void-front";
import { formatTimeStamp } from "@/lib/date-utils";
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { getAgentInfo } from "@/lib/agent-utils";
import { VoidFrontOverview } from "@/components/void-front/void-front-overview";
import { VoidFrontChallengeDetails } from "@/components/void-front/void-front-challenge-details";
import { VoidFrontTeams } from "@/components/void-front/void-front-teams";
import { VfAnalytics } from "@/components/void-front/vf-analytics";
import { percentile } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { VfInsights } from "@/components/analytics/vf-insights";

export default async function VoidFrontPage() {
  const allData = await getAllVoidFrontData();

  const totalSeasons = allData?.length ?? 0;
  const latestScore = allData?.[allData.length - 1]?.data?.void_front_battle_abstract_info_brief?.total_score ?? 'N/A';

  // Accordion items for history
  const historyItems = (allData || []).map((d, idx) => {
    const bossIcon = d?.data?.boss_challenge_record?.boss_info?.icon;
    const endingIcon = d?.data?.void_front_battle_abstract_info_brief?.ending_record_bg_pic;
    const avatarIcon = d?.data?.boss_challenge_record?.main_challenge_record?.avatar_list?.[0]?.role_square_url;
    const firstChallenge = d?.data?.main_challenge_record_list?.[0]?.challenge_time;
    const lastChallenge = d?.data?.boss_challenge_record?.main_challenge_record?.challenge_time;

    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="flex items-center gap-2 font-semibold text-[#f4f4f0]">
            {bossIcon && <Image src={bossIcon} alt="Boss" width={24} height={24} className="w-6 h-6 inline-block" unoptimized />}
            {avatarIcon && <Image src={avatarIcon} alt="Avatar" width={24} height={24} className="w-6 h-6 inline-block border border-[#3a3a42]" unoptimized />}
            {firstChallenge && lastChallenge
              ? `${formatTimeStamp(firstChallenge)} - ${formatTimeStamp(lastChallenge)}`
              : `Entry ${idx + 1}`}
          </span>
          <span className="text-xs text-[#2be0ff] font-bold">
            Score: {d?.data?.void_front_battle_abstract_info_brief?.total_score ?? 'N/A'}
          </span>
        </div>
      ),
      content: (
        <div className="text-sm text-[#f4f4f0]">
          <div className="mb-2 flex items-center gap-2"><b className="text-[#6b7280]">UID:</b> {d?.metadata?.uid || 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2"><b className="text-[#6b7280]">Player:</b> {d?.data?.role_basic_info?.nickname || 'N/A'}</div>
          <div className="mb-2 flex items-center gap-2">
            <b className="text-[#6b7280]">Rank %:</b>
            {d?.data?.void_front_battle_abstract_info_brief?.rank_percent !== undefined
              ? percentile(d.data.void_front_battle_abstract_info_brief.rank_percent)
              : 'N/A'}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <b className="text-[#6b7280]">Ending:</b>
            {d?.data?.void_front_battle_abstract_info_brief?.ending_record_name || 'None'}
            {d?.data?.void_front_battle_abstract_info_brief?.ending_record_id && (
              <Badge variant="outline">ID: {d.data.void_front_battle_abstract_info_brief.ending_record_id}</Badge>
            )}
          </div>
          {endingIcon && (
            <div className="mb-4">
              <Image
                src={endingIcon}
                alt="Ending Record"
                width={320}
                height={180}
                className="border border-[#3a3a42]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                unoptimized
              />
            </div>
          )}

          {d?.data?.boss_challenge_record?.boss_info && (
            <div className="mb-3 flex flex-col gap-2">
              <b className="text-[#6b7280]">Boss Challenge:</b>
              <div className="border border-[#3a3a42] p-3 bg-[#131316] flex items-center gap-3"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                {d.data.boss_challenge_record.boss_info.icon && (
                  <Image
                    src={d.data.boss_challenge_record.boss_info.icon}
                    alt="Boss"
                    width={48}
                    height={48}
                    unoptimized
                  />
                )}
                <div>
                  <div className="font-bold text-[#f4f4f0]">{d.data.boss_challenge_record.boss_info.name}</div>
                  <div className="text-xs text-[#6b7280]">
                    Score: {d.data.boss_challenge_record.main_challenge_record.score} / {d.data.boss_challenge_record.main_challenge_record.max_score}
                    <span className="ml-1 text-[#ffd400]">({d.data.boss_challenge_record.main_challenge_record.score_ratio}x)</span>
                  </div>
                </div>
                <div className="ml-auto font-black text-[#2be0ff] text-xl">
                  {d.data.boss_challenge_record.main_challenge_record.star} star
                </div>
              </div>
            </div>
          )}

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <b className="text-[#6b7280]">Main Team:</b>
            {d?.data?.boss_challenge_record?.main_challenge_record?.avatar_list && (
              <ResponsiveTeamDisplay
                agents={d.data.boss_challenge_record.main_challenge_record.avatar_list.map(a => {
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
                maxAgents={3}
              />
            )}
          </div>

          <div className="mt-3 space-y-2">
            {d?.data?.main_challenge_record_list?.map((challenge, i) => (
              <div key={i} className="border border-[#3a3a42] p-2 bg-[#131316]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                <VoidFrontChallengeDetails challenge={challenge} isCompact={true} />
              </div>
            ))}
          </div>
        </div>
      )
    }
  });

  return (
    <div className="relative min-h-screen zzz-hero-bg">
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] zzz-grid-bg" />
      <div className="relative flex flex-col gap-8">
      <PageHeader
        code="02"
        title="Void Front"
        subtitle="Combat Ops"
        description="Review challenge progress, team compositions, and boss battle outcomes."
        accent="cyan"
        stats={totalSeasons > 0 ? [
          { label: "Seasons Tracked", value: totalSeasons, accent: "cyan" },
          { label: "Latest Score", value: latestScore, accent: "gold" },
        ] : undefined}
      />

      <div className="flex flex-col gap-8">
        <Tabs defaultValue="analytics" className="w-full">
          <div>
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics" className="mt-6">
            <VfAnalytics data={allData || []} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <VfInsights data={allData || []} />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-8">
              <VoidFrontOverview data={allData || []} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Accordion items={historyItems} />
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <div className="space-y-8">
              <VoidFrontTeams data={allData || []} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
