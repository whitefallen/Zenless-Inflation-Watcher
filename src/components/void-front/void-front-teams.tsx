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