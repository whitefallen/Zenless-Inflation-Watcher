"use client";

import { VoidFrontData } from "@/types/void-front";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeStamp } from "@/lib/date-utils";
import { getAgentInfoClient, getElementName } from "@/lib/grade-utils";
import { ResponsiveTeamDisplay } from "../shared/responsive-team-display";

interface VoidFrontTeamsProps {
  data: VoidFrontData[];
}

export function VoidFrontTeams({ data }: VoidFrontTeamsProps) {
  // Use the latest data for the teams view
  const latest = data && data.length > 0 ? data[0] : null;
  
  if (!latest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Team Data Available</CardTitle>
          <CardDescription>No team data has been recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const challenges = latest.data.main_challenge_record_list || [];
  
  if (!challenges || challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Teams Available</CardTitle>
          <CardDescription>No challenge data has been recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {challenges.map((challenge, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{challenge.name}</span>
              <span className="text-2xl">{challenge.star}</span>
            </CardTitle>
            <CardDescription>
              Completed on {formatTimeStamp(challenge.challenge_time)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Main Team</h3>
                <ResponsiveTeamDisplay
                  agents={challenge.avatar_list.map(a => {
                    return getAgentInfoClient(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                  })}
                  variant="table"
                  maxAgents={3}
                />
                
                {/* Team Synergy Analysis */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Team Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Element Distribution */}
                    <div className="border rounded-md p-3 bg-card/40">
                      <h5 className="text-xs font-medium mb-2">Element Distribution</h5>
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
                    
                    {/* Role Distribution */}
                    <div className="border rounded-md p-3 bg-card/40">
                      <h5 className="text-xs font-medium mb-2">Role Distribution</h5>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const professionCounts: Record<string, number> = challenge.avatar_list.reduce((acc: Record<string, number>, agent) => {
                            const profession = String(agent.avatar_profession);
                            acc[profession] = (acc[profession] || 0) + 1;
                            return acc;
                          }, {});
                          
                          return Object.entries(professionCounts).map(([profession, count]) => {
                            const professionName = 
                              profession === '1' ? 'Attacker' :
                              profession === '2' ? 'Balanced' :
                              profession === '3' ? 'Support' :
                              profession === '4' ? 'Tank' :
                              profession === '5' ? 'Special' :
                              profession === '6' ? 'Hybrid' : 'Unknown';
                            
                            return (
                              <div key={profession} className="flex items-center gap-1 border px-2 py-1 rounded-full">
                                <span className="text-xs">{professionName}</span>
                                <span className="text-xs bg-background/70 px-1.5 rounded-full ml-1">{count}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {challenge.sub_challenge_record && challenge.sub_challenge_record.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Sub Challenge Teams</h3>
                  <div className="space-y-4">
                    {challenge.sub_challenge_record.map((sub, i) => (
                      <div key={i} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{sub.name}</h4>
                          <div className="text-lg font-bold">{sub.star}</div>
                        </div>
                        
                        <ResponsiveTeamDisplay
                          agents={sub.avatar_list.map(a => {
                            return getAgentInfoClient(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                          })}
                          variant="inline"
                          maxAgents={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}