"use client";

import { VoidFrontChallenge } from "@/types/void-front";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTimeStamp } from "@/lib/date-utils";
import { Separator } from "@/components/ui/separator";
import { getAgentInfoClient } from "@/lib/grade-utils";
import { ResponsiveTeamDisplay } from "../shared/responsive-team-display";
import Image from "next/image";

interface VoidFrontChallengeDetailsProps {
  challenge: VoidFrontChallenge;
  isCompact?: boolean;
}

export function VoidFrontChallengeDetails({ challenge, isCompact = false }: VoidFrontChallengeDetailsProps) {
  if (!challenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Challenge Data</CardTitle>
          <CardDescription>Challenge information is not available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-medium">{challenge.name}</div>
          <div className="text-sm text-muted-foreground">{formatTimeStamp(challenge.challenge_time)}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            Score: <span className="font-medium">{challenge.score.toLocaleString()}</span>
          </div>
          <div className="text-lg font-bold">{challenge.star}</div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{challenge.name}</span>
          <span className="text-2xl">{challenge.star}</span>
        </CardTitle>
        <CardDescription>
          Battle ID: {challenge.battle_id}, Node ID: {challenge.node_id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Score</h3>
            <p className="text-2xl font-bold">{challenge.score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {challenge.score_ratio}x multiplier
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Maximum Score</h3>
            <p className="text-2xl font-bold">{challenge.max_score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {((challenge.score / challenge.max_score) * 100).toFixed(1)}% achieved
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Date Completed</h3>
            <p className="text-xl font-medium">{formatTimeStamp(challenge.challenge_time)}</p>
            <p className="text-xs text-muted-foreground">
              {challenge.challenge_time?.hour}:{challenge.challenge_time?.minute.toString().padStart(2, '0')}:{challenge.challenge_time?.second.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-3">Main Team</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <ResponsiveTeamDisplay
              agents={challenge.avatar_list.map(a => {
                return getAgentInfoClient(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
              })}
              variant="card"
              maxAgents={3}
            />
            
            {challenge.buddy && (
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
            )}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-3">Buffer</h3>
          {challenge.buffer && (
            <div className="border rounded-md p-3 bg-card/50 flex gap-3">
              {challenge.buffer.icon && (
                <Image
                  src={challenge.buffer.icon}
                  alt="Buffer"
                  width={48}
                  height={48}
                  className="rounded-md"
                  unoptimized
                />
              )}
              <div>
                <div className="font-medium">{challenge.buffer.name}</div>
                <div className="text-sm mt-1">
                  {challenge.buffer.desc.replace(/\\n/g, ' ').replace(/<[^>]*>/g, '')}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {challenge.sub_challenge_record && challenge.sub_challenge_record.length > 0 && (
          <>
            <Separator />
            
            <div>
              <h3 className="font-medium mb-3">Sub Challenges</h3>
              <Tabs defaultValue="challenge-1">
                <TabsList className="mb-4">
                  {challenge.sub_challenge_record.map((sub, i) => (
                    <TabsTrigger key={i} value={`challenge-${i+1}`}>
                      {sub.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {challenge.sub_challenge_record.map((sub, i) => (
                  <TabsContent key={i} value={`challenge-${i+1}`}>
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">{sub.name}</h4>
                        <div className="text-xl font-bold">{sub.star}</div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Team</h5>
                          <ResponsiveTeamDisplay
                            agents={sub.avatar_list.map(a => {
                              return getAgentInfoClient(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                            })}
                            variant="inline"
                            maxAgents={3}
                          />
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Buffer</h5>
                          {sub.buffer && (
                            <div className="flex gap-2 items-center">
                              {sub.buffer.icon && (
                                <Image
                                  src={sub.buffer.icon}
                                  alt="Buffer"
                                  width={32}
                                  height={32}
                                  className="rounded-md"
                                  unoptimized
                                />
                              )}
                              <div className="font-medium">{sub.buffer.name}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {sub.buffer && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-1">Buffer Effect</h5>
                          <p className="text-sm">
                            {sub.buffer.desc.replace(/\\n/g, ' ').replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}