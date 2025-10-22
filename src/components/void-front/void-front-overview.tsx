"use client";

import { VoidFrontData, VoidFrontChallenge } from "@/types/void-front";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { formatTimeStamp } from "@/lib/date-utils";
import { percentile } from "@/lib/utils";
import { VoidFrontChallengeDetails } from "./void-front-challenge-details";

interface VoidFrontOverviewProps {
  data: VoidFrontData[];
}

export function VoidFrontOverview({ data }: VoidFrontOverviewProps) {
  // Use the latest data for overview
  const latest = data && data.length > 0 ? data[0] : null;
  
  if (!latest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Void Front Data Available</CardTitle>
          <CardDescription>No data has been recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const voidFrontInfo = latest.data.void_front_battle_abstract_info_brief;
  const bossInfo = latest.data.boss_challenge_record?.boss_info;
  const mainChallenge = latest.data.boss_challenge_record?.main_challenge_record;
  const scorePercent = voidFrontInfo.total_score / voidFrontInfo.max_score * 100;
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between">
          <div>
            <CardTitle>Void Front Summary</CardTitle>
            <CardDescription>
              {latest.data.role_basic_info?.nickname || "Unknown Player"}&apos;s Void Front performance
            </CardDescription>
          </div>
          {voidFrontInfo.rank_percent !== undefined && (
            <div className="text-right">
              <span className="text-3xl font-semibold">
                {percentile(voidFrontInfo.rank_percent)}
              </span>
              <p className="text-sm text-muted-foreground">Player Rank</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="text-lg font-medium">Total Score</h3>
                <p className="text-3xl font-bold">
                  {voidFrontInfo.total_score.toLocaleString()} / {voidFrontInfo.max_score.toLocaleString()}
                </p>
              </div>
              
              {voidFrontInfo.ending_record_name && (
                <div className="mt-4 md:mt-0 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">Ending Record</span>
                  <span className="font-semibold text-lg">{voidFrontInfo.ending_record_name}</span>
                  {voidFrontInfo.ending_record_bg_pic && (
                    <div className="mt-2 rounded-md overflow-hidden">
                      <Image 
                        src={voidFrontInfo.ending_record_bg_pic}
                        alt="Ending Record"
                        width={200}
                        height={120}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Progress value={scorePercent} className="h-2" />
            <p className="text-sm text-muted-foreground text-right">
              {scorePercent.toFixed(1)}% of maximum score achieved
            </p>
          </div>
        </CardContent>
      </Card>

      {bossInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {bossInfo.icon && (
                <Image 
                  src={bossInfo.icon}
                  alt="Boss Icon"
                  width={32}
                  height={32}
                  className="rounded-md"
                  unoptimized
                />
              )}
              Boss Challenge - {bossInfo.name}
            </CardTitle>
            <CardDescription>Final challenge stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Score</h4>
                <p className="text-2xl font-bold">{mainChallenge?.score.toLocaleString() || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {mainChallenge?.score_ratio}x score ratio
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Rating</h4>
                <p className="text-2xl font-bold">{mainChallenge?.star || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeStamp(mainChallenge?.challenge_time)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Challenge History</CardTitle>
          <CardDescription>All completed challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latest.data.main_challenge_record_list?.map((challenge, index) => (
              <ChallengeItem key={index} challenge={challenge} index={index + 1} />
            ))}
            
            {(!latest.data.main_challenge_record_list || latest.data.main_challenge_record_list.length === 0) && (
              <p className="text-muted-foreground">No challenge records found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ChallengeItem({ challenge }: { challenge: VoidFrontChallenge; index: number }) {
  const scorePercent = challenge.score / challenge.max_score * 100;
  
  return (
    <div className="border rounded-md p-3 bg-card/50">
      <VoidFrontChallengeDetails challenge={challenge} isCompact={true} />
      <Progress value={scorePercent} className="h-1.5 mt-2" />
      <p className="text-xs text-right mt-1 text-muted-foreground">{scorePercent.toFixed(1)}%</p>
    </div>
  );
}