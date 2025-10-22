import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "../metal-mania.css";
import Image from "next/image";
import { Accordion } from "@/components/ui/accordion";
import { getAllVoidFrontData } from "@/lib/void-front";
import { formatTimeStamp } from "@/lib/date-utils";
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { getAgentInfo } from "@/lib/agent-utils";
import { VoidFrontOverview } from "@/components/void-front/void-front-overview";
import { VoidFrontChallengeDetails } from "@/components/void-front/void-front-challenge-details";
import { VoidFrontTeams } from "@/components/void-front/void-front-teams";
import { percentile } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function VoidFrontPage() {
  const allData = await getAllVoidFrontData();

  // Accordion items for history
  const historyItems = (allData || []).map((d, idx) => {
    // Use boss icon or ending record image as icon
    const bossIcon = d?.data?.boss_challenge_record?.boss_info?.icon;
    const endingIcon = d?.data?.void_front_battle_abstract_info_brief?.ending_record_bg_pic;
    const avatarIcon = d?.data?.boss_challenge_record?.main_challenge_record?.avatar_list?.[0]?.role_square_url;
    
    // Calculate dates based on challenge time
    const firstChallenge = d?.data?.main_challenge_record_list?.[0]?.challenge_time;
    const lastChallenge = d?.data?.boss_challenge_record?.main_challenge_record?.challenge_time;
    
    return {
      title: (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="flex items-center gap-2 font-semibold">
            {bossIcon && <Image src={bossIcon} alt="Boss" width={24} height={24} className="w-6 h-6 rounded inline-block" unoptimized />}
            {avatarIcon && <Image src={avatarIcon} alt="Avatar" width={24} height={24} className="w-6 h-6 rounded-full inline-block border" unoptimized />}
            {firstChallenge && lastChallenge
              ? `${formatTimeStamp(firstChallenge)} - ${formatTimeStamp(lastChallenge)}`
              : `Entry ${idx + 1}`}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span role="img" aria-label="score">🏆</span> {d?.data?.void_front_battle_abstract_info_brief?.total_score ?? 'N/A'}
          </span>
        </div>
      ),
      content: (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <b>UID:</b> {d?.metadata?.uid || 'N/A'}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <b>Player:</b> {d?.data?.role_basic_info?.nickname || 'N/A'}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <b>Rank Percent:</b> <span role="img" aria-label="rank">📊</span> 
            {d?.data?.void_front_battle_abstract_info_brief?.rank_percent !== undefined 
              ? percentile(d.data.void_front_battle_abstract_info_brief.rank_percent) 
              : 'N/A'}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <b>Ending:</b> <span role="img" aria-label="ending">🏁</span> 
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
                className="rounded-md border" 
                unoptimized 
              />
            </div>
          )}
          
          {d?.data?.boss_challenge_record?.boss_info && (
            <div className="mb-2 flex flex-col gap-2">
              <b>Boss Challenge:</b>
              <div className="border rounded p-2 bg-card flex items-center gap-2">
                {d.data.boss_challenge_record.boss_info.icon && (
                  <Image 
                    src={d.data.boss_challenge_record.boss_info.icon} 
                    alt="Boss" 
                    width={48} 
                    height={48} 
                    className="rounded-md" 
                    unoptimized 
                  />
                )}
                <div>
                  <div className="font-bold">{d.data.boss_challenge_record.boss_info.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Score: {d.data.boss_challenge_record.main_challenge_record.score} / 
                    {d.data.boss_challenge_record.main_challenge_record.max_score} 
                    ({d.data.boss_challenge_record.main_challenge_record.score_ratio}x)
                  </div>
                </div>
                <div className="ml-auto text-2xl">
                  {d.data.boss_challenge_record.main_challenge_record.star}
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-2 flex items-center gap-2">
            <b>Main Team:</b>
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
          
          <div className="mb-2">
            <b>All Challenges:</b>
          </div>
          <div className="space-y-2">
            {d?.data?.main_challenge_record_list?.map((challenge, i) => (
              <div key={i} className="border rounded p-2 bg-card">
                <VoidFrontChallengeDetails challenge={challenge} isCompact={true} />
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
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-300 to-zinc-700 bg-clip-text text-transparent metal-mania-regular">
            Void Front
          </h1>
          <p className="text-muted-foreground text-lg">
            View and analyze your Void Front battle performance data.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="mx-auto">
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-card p-1">
              <TabsTrigger value="overview" className="min-w-[120px]">Overview</TabsTrigger>
              <TabsTrigger value="history" className="min-w-[120px]">History</TabsTrigger>
              <TabsTrigger value="challenges" className="min-w-[120px]">Challenges</TabsTrigger>
              <TabsTrigger value="teams" className="min-w-[120px]">Teams</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-8 px-6">
              <VoidFrontOverview data={allData || []} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Accordion items={historyItems} />
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            {allData && allData.length > 0 && (
              <VoidFrontChallengeDetails challenge={allData[0].data.boss_challenge_record.main_challenge_record} />
            )}
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <div className="space-y-8 px-6">
              <VoidFrontTeams data={allData || []} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}