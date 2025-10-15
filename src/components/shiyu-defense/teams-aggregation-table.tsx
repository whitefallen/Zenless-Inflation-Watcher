import { SharedAggregationTable } from "@/components/shared/aggregation-table"
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display";
import { getAgentInfo } from "@/lib/agent-utils";
import type { ShiyuDefenseData } from "@/types/shiyu-defense"

type TeamAgg = {
  avatars: { role_square_url: string; id: number; rarity: string }[];
  count: number;
  layers: number[];
};

export function ShiyuTeamsAggregationTable({ allData }: { allData: ShiyuDefenseData[] }) {
  const teamMap = new Map<string, TeamAgg>();
  
  for (const d of allData) {
    for (const floor of d?.data?.all_floor_detail || []) {
      // Process both node_1 and node_2 teams
      for (const node of [floor.node_1, floor.node_2]) {
        const team = node.avatars || [];
        if (team.length > 0) {
          const teamKey = team.map((a) => a.id).sort((a, b) => a - b).join('-');
          if (!teamMap.has(teamKey)) {
            teamMap.set(teamKey, { avatars: team, count: 0, layers: [] });
          }
          const entry = teamMap.get(teamKey)!;
          entry.count += 1;
          entry.layers.push(floor.layer_index);
        }
      }
    }
  }
  
  const teams: TeamAgg[] = Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
  
  return (
    <SharedAggregationTable<TeamAgg>
      data={teams}
      fields={[
        {
          label: "Team",
          render: (team: TeamAgg) => (
            <div className="max-w-xs">
              <ResponsiveTeamDisplay
                agents={team.avatars.map(a => {
                  const info = getAgentInfo(a.id, { role_square_url: a.role_square_url });
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
          ),
        },
        { label: "Times Used", render: (team: TeamAgg) => team.count },
        { label: "Highest Layer", render: (team: TeamAgg) => <span className="font-semibold">{Math.max(...team.layers)}</span> },
        { label: "Average Layer", render: (team: TeamAgg) => (team.layers.reduce((a, b) => a + b, 0) / team.layers.length).toFixed(2) },
      ]}
      emptyMessage="No team data available"
    />
  );
}
