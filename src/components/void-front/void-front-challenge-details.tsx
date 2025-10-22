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
          
          {/* Team Element Composition */}
          <div className="mt-4 border rounded-md p-3 bg-card/40">
            <h4 className="text-sm font-medium mb-2">Team Composition</h4>
            <div className="flex flex-wrap gap-3">
              {/* Count element types */}
              {(() => {
                const elementCounts: Record<string, number> = challenge.avatar_list.reduce((acc: Record<string, number>, agent) => {
                  const elementType = String(agent.element_type);
                  acc[elementType] = (acc[elementType] || 0) + 1;
                  return acc;
                }, {});
                
                return Object.entries(elementCounts).map(([elementType, count]) => {
                  const elementName = 
                    elementType === '200' ? 'Physical' :
                    elementType === '201' ? 'Fire' :
                    elementType === '202' ? 'Ice' :
                    elementType === '203' ? 'Electric' :
                    elementType === '205' ? 'Ether' : 'Unknown';
                    
                  const elementColor = 
                    elementType === '200' ? '#f5f5f5' : // Physical
                    elementType === '201' ? '#ff6b5a' : // Fire
                    elementType === '202' ? '#7acbff' : // Ice
                    elementType === '203' ? '#ffde73' : // Electric
                    elementType === '205' ? '#d985ff' : // Ether
                    '#cccccc';
                  
                  return (
                    <div key={elementType} className="flex items-center gap-1 border px-2 py-1 rounded-full">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: elementColor }}
                      ></div>
                      <span className="text-xs font-medium">{elementName}</span>
                      <span className="text-xs bg-background px-1.5 rounded-full ml-1">{count}x</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-3">Challenge Buffer</h3>
          {challenge.buffer && (
            <div className="border rounded-md p-4 bg-card/50">
              <div className="flex gap-3 items-start">
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
                  <div className="font-medium text-lg">{challenge.buffer.name}</div>
                  <div className="mt-3 space-y-1">
                    {challenge.buffer.desc
                      .replace(/\\n/g, '\n')
                      .split('\n')
                      .map((line, i) => (
                        <div key={i} className="flex gap-1 items-baseline">
                          {i === 0 ? <span className="text-primary">•</span> : <span className="ml-2">•</span>}
                          <p className="text-sm">
                            {/* Format the colored text */}
                            {line.split(/<color=#([A-Fa-f0-9]+)>|<\/color>/g).map((text, j, array) => {
                              // Every odd index is a color code
                              if (j % 3 === 1) {
                                // Get the next text segment
                                const nextText = array[j + 1] || '';
                                return (
                                  <span 
                                    key={j} 
                                    style={{ color: `#${text}` }}
                                    className="font-medium"
                                  >
                                    {nextText}
                                  </span>
                                );
                              } else if (j % 3 === 2) {
                                // Skip already processed text
                                return null;
                              }
                              
                              return text;
                            })}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Agent Roles Analysis */}
        <div>
          <h3 className="font-medium mb-3">Team Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Details */}
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Agent Details</h4>
              <div className="space-y-2">
                {challenge.avatar_list.map((agent, idx) => {
                  const agentInfo = getAgentInfoClient(agent.id, {
                    role_square_url: agent.role_square_url,
                    rarity: agent.rarity
                  });
                  
                  const elementColor = 
                    agent.element_type === 200 ? '#f5f5f5' : // Physical
                    agent.element_type === 201 ? '#ff6b5a' : // Fire
                    agent.element_type === 202 ? '#7acbff' : // Ice
                    agent.element_type === 203 ? '#ffde73' : // Electric
                    agent.element_type === 205 ? '#d985ff' : // Ether
                    '#cccccc';
                    
                  const roleLabel = 
                    agent.avatar_profession === 1 ? 'Attacker' :
                    agent.avatar_profession === 2 ? 'Balanced' :
                    agent.avatar_profession === 3 ? 'Support' :
                    agent.avatar_profession === 4 ? 'Tank' :
                    agent.avatar_profession === 5 ? 'Special' :
                    agent.avatar_profession === 6 ? 'Hybrid' : 'Unknown';
                  
                  return (
                    <div key={idx} className="flex items-center gap-3 border rounded-md p-2">
                      <Image
                        src={agent.role_square_url}
                        alt={agentInfo.name || `Agent ${agent.id}`}
                        width={40}
                        height={40}
                        className="rounded-md"
                        unoptimized
                      />
                      <div>
                        <div className="text-sm font-medium">{agentInfo.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: elementColor }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {agent.element_type === 200 ? 'Physical' :
                                agent.element_type === 201 ? 'Fire' :
                                agent.element_type === 202 ? 'Ice' :
                                agent.element_type === 203 ? 'Electric' :
                                agent.element_type === 205 ? 'Ether' : 'Unknown'
                              }
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{roleLabel}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">Lv. {agent.level}</span>
                        </div>
                      </div>
                      <div className="ml-auto text-xs font-medium">
                        <div className="bg-primary/10 text-primary rounded-full px-2 py-1">
                          {agent.rarity} Rank
                        </div>
                        {agent.rank > 0 && (
                          <div className="mt-1 text-center text-muted-foreground">
                            +{agent.rank}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Team Statistics</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Average Level</div>
                  <div className="font-medium">
                    {Math.round(challenge.avatar_list.reduce((sum, agent) => sum + agent.level, 0) / challenge.avatar_list.length)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Element Distribution</div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const elementCounts: Record<string, number> = challenge.avatar_list.reduce((acc: Record<string, number>, agent) => {
                        const elementType = String(agent.element_type);
                        acc[elementType] = (acc[elementType] || 0) + 1;
                        return acc;
                      }, {});
                      
                      return Object.entries(elementCounts).map(([elementType, count]) => {
                        const elementName = 
                          elementType === '200' ? 'Physical' :
                          elementType === '201' ? 'Fire' :
                          elementType === '202' ? 'Ice' :
                          elementType === '203' ? 'Electric' :
                          elementType === '205' ? 'Ether' : 'Unknown';
                          
                        const elementColor = 
                          elementType === '200' ? '#f5f5f5' : // Physical
                          elementType === '201' ? '#ff6b5a' : // Fire
                          elementType === '202' ? '#7acbff' : // Ice
                          elementType === '203' ? '#ffde73' : // Electric
                          elementType === '205' ? '#d985ff' : // Ether
                          '#cccccc';
                        
                        return (
                          <div key={elementType} className="flex items-center gap-1 border px-2 py-1 rounded-full">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: elementColor }}
                            ></div>
                            <span className="text-xs">{elementName}</span>
                            <span className="text-xs bg-background/70 px-1.5 rounded-full ml-1">{count}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rarity Distribution</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between border rounded-md p-2">
                      <span className="text-xs">S Rank</span>
                      <span className="font-medium">
                        {challenge.avatar_list.filter(a => a.rarity === "S").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border rounded-md p-2">
                      <span className="text-xs">A Rank</span>
                      <span className="font-medium">
                        {challenge.avatar_list.filter(a => a.rarity === "A").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />

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
                      
                      {/* Battle Metrics */}
                      <div className="mb-4 border rounded-lg p-3 bg-muted/20">
                        <h5 className="text-sm font-medium mb-2">Battle Metrics</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="border rounded p-2 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground">Rating</span>
                            <span className="text-lg font-bold">{sub.star}</span>
                          </div>
                          <div className="border rounded p-2 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground">Team Size</span>
                            <span className="text-lg font-bold">{sub.avatar_list.length}</span>
                          </div>
                          <div className="border rounded p-2 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground">Avg. Level</span>
                            <span className="text-lg font-bold">
                              {Math.round(sub.avatar_list.reduce((sum, agent) => sum + agent.level, 0) / sub.avatar_list.length)}
                            </span>
                          </div>
                          <div className="border rounded p-2 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground">S Rank</span>
                            <span className="text-lg font-bold">
                              {sub.avatar_list.filter(agent => agent.rarity === "S").length}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Team</h5>
                          <ResponsiveTeamDisplay
                            agents={sub.avatar_list.map(a => {
                              return getAgentInfoClient(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                            })}
                            variant="table"
                            maxAgents={3}
                          />
                          
                          {/* Sub-battle Agent Details */}
                          <div className="mt-4 space-y-2">
                            <h6 className="text-xs font-medium text-muted-foreground">Agent Details</h6>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {sub.avatar_list.map((agent, idx) => {
                                const agentInfo = getAgentInfoClient(agent.id, {
                                  role_square_url: agent.role_square_url,
                                  rarity: agent.rarity
                                });
                                
                                return (
                                  <div key={idx} className="flex flex-col p-2 border rounded-md bg-card/40">
                                    <div className="text-xs font-medium">{agentInfo.name}</div>
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
                                    <div className="text-xs mt-1">Lv. {agent.level} • {agent.rarity} Rank</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {agent.avatar_profession === 1 ? 'Attacker' :
                                        agent.avatar_profession === 2 ? 'Balanced' :
                                        agent.avatar_profession === 3 ? 'Support' :
                                        agent.avatar_profession === 4 ? 'Tank' :
                                        agent.avatar_profession === 5 ? 'Special' :
                                        agent.avatar_profession === 6 ? 'Hybrid' : 'Unknown'
                                      }
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Buffer</h5>
                          {sub.buffer && (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2 items-center">
                                {sub.buffer.icon && (
                                  <Image
                                    src={sub.buffer.icon}
                                    alt="Buffer"
                                    width={40}
                                    height={40}
                                    className="rounded-md"
                                    unoptimized
                                  />
                                )}
                                <div className="font-medium">{sub.buffer.name}</div>
                              </div>
                              
                              {/* Buddy Information */}
                              {sub.buddy && (
                                <div className="mt-3">
                                  <h6 className="text-xs font-medium text-muted-foreground mb-2">Buddy</h6>
                                  <div className="border rounded-md p-2 flex items-center gap-2">
                                    <Image
                                      src={sub.buddy.bangboo_rectangle_url}
                                      alt="Buddy"
                                      width={48}
                                      height={48}
                                      className="rounded-md"
                                      unoptimized
                                    />
                                    <div>
                                      <div className="text-sm font-medium">Buddy #{sub.buddy.id}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {sub.buddy.rarity} Rank • Level {sub.buddy.level}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {sub.buffer && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-1">Buffer Effect</h5>
                          <div className="text-sm bg-muted/30 rounded-md p-3 border">
                            {sub.buffer.desc
                              .replace(/\\n/g, '\n')
                              .split('\n')
                              .map((line, i) => (
                                <p key={i} className="mb-1">
                                  {/* Format the colored text */}
                                  {line.split(/<color=#([A-Fa-f0-9]+)>|<\/color>/g).map((text, j) => {
                                    // Every odd index is a color code
                                    if (j % 2 === 1) {
                                      return null; // Skip color codes
                                    }
                                    
                                    // Even indices contain text, check if the next item is a color code
                                    const colorCode = j < line.split(/<color=#([A-Fa-f0-9]+)>|<\/color>/g).length - 2 
                                      ? line.split(/<color=#([A-Fa-f0-9]+)>|<\/color>/g)[j + 1] 
                                      : null;
                                      
                                    if (colorCode) {
                                      return (
                                        <span 
                                          key={j} 
                                          style={{ color: `#${colorCode}` }}
                                        >
                                          {text}
                                        </span>
                                      );
                                    }
                                    
                                    return text;
                                  })}
                                </p>
                              ))}
                          </div>
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