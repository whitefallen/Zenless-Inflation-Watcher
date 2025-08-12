import type { DeadlyAssaultData, Avatar } from "@/types/deadly-assault";


type TeamAggregation = {
  avatars: Avatar[];
  count: number;
  scores: number[];
};

function getTeamsAggregation(allData: DeadlyAssaultData[]): TeamAggregation[] {
  const teamMap = new Map<string, TeamAggregation>();
  for (const d of allData) {
    for (const run of d?.data?.list || []) {
      const team = run.avatar_list || [];
      const teamKey = team.map(a => a.id).sort((a, b) => a - b).join('-');
      if (!teamMap.has(teamKey)) {
        teamMap.set(teamKey, { avatars: team, count: 0, scores: [] });
      }
      const entry = teamMap.get(teamKey)!;
      entry.count += 1;
      entry.scores.push(run.score);
    }
  }
  return Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
}

export function TeamsAggregationTable({ allData }: { allData: DeadlyAssaultData[] }) {
  const teams = getTeamsAggregation(allData);
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
          {teams.map((team, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  {team.avatars.map((a) => (
                    <img key={a.id} src={a.role_square_url} alt={`Avatar #${a.id}`} className="w-7 h-7 rounded-full border inline-block" />
                  ))}
                </div>
              </td>
              <td className="px-4 py-2">{team.count}</td>
              <td className="px-4 py-2 font-semibold">{Math.max(...team.scores)}</td>
              <td className="px-4 py-2">{(team.scores.reduce((a, b) => a + b, 0) / team.scores.length).toFixed(2)}</td>
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
