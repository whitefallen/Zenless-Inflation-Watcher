
import type { DeadlyAssaultData } from "@/types/deadly-assault";
import type { DeadlyAssaultRun } from "@/types/deadly-assault";
import { useMemo } from "react";
import { aggregateTeamUsage } from "@/lib/aggregation-utils";
import { getAgentInfo } from "@/lib/agent-utils";
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";


export function TeamsAggregationTable({ allData }: { allData: DeadlyAssaultData[] }) {
  const teams = useMemo(() => 
    aggregateTeamUsage<DeadlyAssaultData, DeadlyAssaultRun>(
      allData,
      (run) => run.avatar_list,
      (run) => run.score
    ), 
    [allData]
  );
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Team</th>
            <th className="px-4 py-2 text-left">Times Used</th>
            <th className="px-4 py-2 text-left">Highest Score</th>
            <th className="px-4 py-2 text-left">Average Score</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.teamKey} className="border-b">
              <td className="px-4 py-2">
                <div className="max-w-xs">
                  <ResponsiveTeamDisplay
                    agents={team.avatars.map(a => {
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
                    variant="table"
                  />
                </div>
              </td>
              <td className="px-4 py-2">{team.count}</td>
              <td className="px-4 py-2 font-semibold">{team.maxScore || 'N/A'}</td>
              <td className="px-4 py-2">{team.averageScore?.toFixed(2) || 'N/A'}</td>
            </tr>
          ))}
          {teams.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No team data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
