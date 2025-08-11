import type { DeadlyAssaultData, Avatar } from "@/types/deadly-assault";

function aggregateCharacterPerformance(allData: DeadlyAssaultData[]) {
  const charMap = new Map<number, { avatar: Avatar; count: number; totalScore: number; topRunCount: number }>();
  let bestScore = 0;
  for (const d of allData) {
    for (const run of d.data.list) {
      if (run.score > bestScore) bestScore = run.score;
    }
  }
  for (const d of allData) {
    for (const run of d.data.list) {
      for (const avatar of run.avatar_list) {
        if (!charMap.has(avatar.id)) {
          charMap.set(avatar.id, { avatar, count: 0, totalScore: 0, topRunCount: 0 });
        }
        const entry = charMap.get(avatar.id)!;
        entry.count += 1;
        entry.totalScore += run.score;
        if (run.score === bestScore) entry.topRunCount += 1;
      }
    }
  }
  return Array.from(charMap.values()).sort((a, b) => b.count - a.count);
}

export function CharacterPerformanceTable({ allData }: { allData: DeadlyAssaultData[] }) {
  const perf = aggregateCharacterPerformance(allData);
  return (
    <div className="overflow-x-auto mb-8">
      <h3 className="text-lg font-semibold mb-2">Character Performance</h3>
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Avatar</th>
            <th className="px-4 py-2 text-left">Times Used</th>
            <th className="px-4 py-2 text-left">Average Score</th>
            <th className="px-4 py-2 text-left">Top Run Appearances</th>
          </tr>
        </thead>
        <tbody>
          {perf.map((entry) => (
            <tr key={entry.avatar.id} className="border-b">
              <td className="px-4 py-2 flex items-center gap-2">
                <img src={entry.avatar.role_square_url} alt={`Avatar #${entry.avatar.id}`} className="w-7 h-7 rounded-full border inline-block" />
                <span>ID: {entry.avatar.id}</span>
              </td>
              <td className="px-4 py-2">{entry.count}</td>
              <td className="px-4 py-2">{(entry.totalScore / entry.count).toFixed(2)}</td>
              <td className="px-4 py-2">{entry.topRunCount}</td>
            </tr>
          ))}
          {perf.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No character data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
