import type { DeadlyAssaultData, Boss, Avatar } from "@/types/deadly-assault";

function aggregateBossDifficulty(allData: DeadlyAssaultData[]) {
  const bossMap = new Map<string, { boss: Boss; count: number; totalScore: number; teams: Avatar[][] }>();
  for (const d of allData) {
    for (const run of d.data.list) {
      for (const boss of run.boss) {
        if (!bossMap.has(boss.name)) {
          bossMap.set(boss.name, { boss, count: 0, totalScore: 0, teams: [] });
        }
        const entry = bossMap.get(boss.name)!;
        entry.count += 1;
        entry.totalScore += run.score;
        entry.teams.push(run.avatar_list);
      }
    }
  }
  return Array.from(bossMap.values()).sort((a, b) => b.count - a.count);
}

export function BossDifficultyTable({ allData }: { allData: DeadlyAssaultData[] }) {
  const bosses = aggregateBossDifficulty(allData);
  return (
    <div className="overflow-x-auto mb-8">
      <h3 className="text-lg font-semibold mb-2">Boss Difficulty & Team Effectiveness</h3>
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Boss</th>
            <th className="px-4 py-2 text-left">Times Fought</th>
            <th className="px-4 py-2 text-left">Avg. Score</th>
            <th className="px-4 py-2 text-left">Most Used Team</th>
          </tr>
        </thead>
        <tbody>
          {bosses.map((entry) => {
            // Find most used team for this boss
            const teamCounts = new Map<string, { avatars: Avatar[]; count: number }>();
            for (const team of entry.teams) {
              const key = team.map(a => a.id).sort((a, b) => a - b).join('-');
              if (!teamCounts.has(key)) teamCounts.set(key, { avatars: team, count: 0 });
              teamCounts.get(key)!.count += 1;
            }
            const mostUsedTeam = Array.from(teamCounts.values()).sort((a, b) => b.count - a.count)[0];
            return (
              <tr key={entry.boss.name} className="border-b">
                <td className="px-4 py-2 flex items-center gap-2">
                  <img src={entry.boss.icon} alt={entry.boss.name} className="w-7 h-7 rounded inline-block" />
                  <span>{entry.boss.name}</span>
                </td>
                <td className="px-4 py-2">{entry.count}</td>
                <td className="px-4 py-2">{(entry.totalScore / entry.count).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    {mostUsedTeam && mostUsedTeam.avatars.map(a => (
                      <img key={a.id} src={a.role_square_url} alt={`Avatar #${a.id}`} className="w-6 h-6 rounded-full border inline-block" />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
          {bosses.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No boss data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
