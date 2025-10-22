"use client";

import { VoidFrontData, VoidFrontChallenge } from "@/types/void-front";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { formatTimeStamp } from "@/lib/date-utils";
import { percentile } from "@/lib/utils";
import { VoidFrontChallengeDetails } from "./void-front-challenge-details";
import { getAgentInfoClient } from "@/lib/grade-utils";

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
            
            {/* Enhanced Boss Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                {bossInfo.icon && (
                  <div className="relative">
                    <Image 
                      src={bossInfo.icon}
                      alt={bossInfo.name}
                      width={200}
                      height={200}
                      className="rounded-md border border-primary/20"
                      unoptimized
                    />
                    {bossInfo.bg_icon && (
                      <div className="absolute inset-0 -z-10 opacity-20">
                        <Image 
                          src={bossInfo.bg_icon}
                          alt="Background"
                          fill
                          className="object-cover rounded-md"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1 text-muted-foreground">Boss Type</h4>
                  <div className="flex items-center gap-2">
                    {bossInfo.race_icon && (
                      <Image 
                        src={bossInfo.race_icon}
                        alt="Race"
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized
                      />
                    )}
                    <p className="font-medium">{bossInfo.name.split(' - ')[0]}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1 text-muted-foreground">Challenge Efficiency</h4>
                  <p className="text-lg font-bold">
                    {mainChallenge?.score && mainChallenge?.max_score 
                      ? `${((mainChallenge.score / mainChallenge.max_score) * 100).toFixed(1)}%` 
                      : 'N/A'}
                  </p>
                  <Progress 
                    value={mainChallenge?.score && mainChallenge?.max_score 
                      ? (mainChallenge.score / mainChallenge.max_score) * 100 
                      : 0} 
                    className="h-2 mt-1" 
                  />
                </div>
                
                {mainChallenge?.buffer && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-muted-foreground">Challenge Buffer</h4>
                    <div className="flex items-center gap-2">
                      {mainChallenge.buffer.icon && (
                        <Image 
                          src={mainChallenge.buffer.icon}
                          alt="Buffer"
                          width={24}
                          height={24}
                          className="rounded-md"
                          unoptimized
                        />
                      )}
                      <p className="font-medium">{mainChallenge.buffer.name}</p>
                    </div>
                  </div>
                )}
                
                {mainChallenge?.sub_challenge_record && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-muted-foreground">Sub-challenges</h4>
                    <p className="font-medium">{mainChallenge.sub_challenge_record.length} battle{mainChallenge.sub_challenge_record.length !== 1 ? 's' : ''}</p>
                  </div>
                )}
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
      
      {/* Early Battles (1-3) Details */}
      <Card>
        <CardHeader>
          <CardTitle>Early Battles (1-3)</CardTitle>
          <CardDescription>Detailed information about the first battles</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="battle1">
            <TabsList className="mb-4">
              {latest.data.main_challenge_record_list
                ?.filter(challenge => 
                  challenge.name.includes("BATTLE 01") || 
                  challenge.name.includes("BATTLE 02") || 
                  challenge.name.includes("BATTLE 03"))
                .map((challenge, i) => (
                  <TabsTrigger key={i} value={`battle${i+1}`}>
                    {challenge.name}
                  </TabsTrigger>
                ))}
            </TabsList>
            
            {latest.data.main_challenge_record_list
              ?.filter(challenge => 
                challenge.name.includes("BATTLE 01") || 
                challenge.name.includes("BATTLE 02") || 
                challenge.name.includes("BATTLE 03"))
              .map((challenge, i) => (
                <TabsContent key={i} value={`battle${i+1}`}>
                  <div className="space-y-4">
                    {/* Battle Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{challenge.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeStamp(challenge.challenge_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{challenge.star}</div>
                        <p className="text-sm">
                          Score: <span className="font-medium">{challenge.score.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Battle Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score</span>
                        <span>{((challenge.score / challenge.max_score) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(challenge.score / challenge.max_score) * 100}
                        className="h-2"
                      />
                    </div>
                    
                    {/* Team Composition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Main Team</h4>
                        <div className="border rounded-md p-3">
                          <div className="grid grid-cols-3 gap-2">
                            {challenge.avatar_list.map((agent, idx) => {
                              const agentInfo = getAgentInfoClient(agent.id, {
                                role_square_url: agent.role_square_url,
                                rarity: agent.rarity
                              });
                              
                              return (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                  <div className="relative">
                                    <Image
                                      src={agent.role_square_url}
                                      alt={agentInfo.name || `Agent ${agent.id}`}
                                      width={64}
                                      height={64}
                                      className="rounded-md border"
                                      unoptimized
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-background border rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                      {agent.rarity}
                                    </div>
                                  </div>
                                  <div className="text-xs font-medium text-center mt-1">{agentInfo.name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" 
                                      style={{ 
                                        backgroundColor: 
                                          agent.element_type === 200 ? '#f5f5f5' : // Physical
                                          agent.element_type === 201 ? '#ff6b5a' : // Fire
                                          agent.element_type === 202 ? '#7acbff' : // Ice
                                          agent.element_type === 203 ? '#ffde73' : // Electric
                                          agent.element_type === 205 ? '#d985ff' : // Ether
                                          '#cccccc'
                                      }}
                                    />
                                    {agent.element_type === 200 ? 'Physical' :
                                      agent.element_type === 201 ? 'Fire' :
                                      agent.element_type === 202 ? 'Ice' :
                                      agent.element_type === 203 ? 'Electric' :
                                      agent.element_type === 205 ? 'Ether' : 'Unknown'
                                    }
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Buffer */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Challenge Buffer</h4>
                        {challenge.buffer && (
                          <div className="border rounded-md p-3 flex gap-3 items-start">
                            {challenge.buffer.icon && (
                              <Image
                                src={challenge.buffer.icon}
                                alt="Buffer"
                                width={40}
                                height={40}
                                className="rounded-md"
                                unoptimized
                              />
                            )}
                            <div>
                              <div className="font-medium">{challenge.buffer.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {challenge.buffer.desc.replace(/\\n/g, ' ').replace(/<[^>]*>/g, '')}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Buddy */}
                        {challenge.buddy && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-2">Buddy</h4>
                            <div className="border rounded-md p-2 flex items-center gap-2">
                              <Image
                                src={challenge.buddy.bangboo_rectangle_url}
                                alt="Buddy"
                                width={48}
                                height={48}
                                className="rounded-md"
                                unoptimized
                              />
                              <div>
                                <div className="text-sm font-medium">Buddy #{challenge.buddy.id}</div>
                                <div className="text-xs text-muted-foreground">
                                  {challenge.buddy.rarity} Rank • Level {challenge.buddy.level}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Sub-challenges */}
                    {challenge.sub_challenge_record && challenge.sub_challenge_record.length > 0 && (
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-3">Sub-challenges</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {challenge.sub_challenge_record.map((sub, idx) => (
                            <div key={idx} className="border rounded-md p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">{sub.name}</div>
                                <div className="text-lg font-bold">{sub.star}</div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {sub.avatar_list.map((agent, agentIdx) => {
                                  const elementColor = 
                                    agent.element_type === 200 ? '#f5f5f5' : // Physical
                                    agent.element_type === 201 ? '#ff6b5a' : // Fire
                                    agent.element_type === 202 ? '#7acbff' : // Ice
                                    agent.element_type === 203 ? '#ffde73' : // Electric
                                    agent.element_type === 205 ? '#d985ff' : // Ether
                                    '#cccccc';
                                    
                                  return (
                                    <div 
                                      key={agentIdx} 
                                      className="flex items-center gap-1 border rounded-md px-2 py-1"
                                      style={{ borderColor: elementColor + '40' }}
                                    >
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: elementColor }}
                                      />
                                      <span className="text-xs">
                                        {getAgentInfoClient(agent.id, { role_square_url: agent.role_square_url, rarity: agent.rarity }).name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
          </Tabs>
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