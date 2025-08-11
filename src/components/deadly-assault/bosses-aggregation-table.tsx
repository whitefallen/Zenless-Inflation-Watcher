import type { DeadlyAssaultData } from "@/types/deadly-assault";

export function BossesAggregationTable({ allData }: { allData: DeadlyAssaultData[] }) {
  // Map: bossName => { icon, name, count, scores[] }
  const bossMap = new Map<string, { icon: string; name: string; count: number; scores: number[] }>();
  for (const d of allData) {
    for (const run of d?.data?.list || []) {
      for (const boss of run.boss || []) {
        if (!bossMap.has(boss.name)) {
          bossMap.set(boss.name, { icon: boss.icon, name: boss.name, count: 0, scores: [] });
        }
        const entry = bossMap.get(boss.name)!;
        entry.count += 1;
        entry.scores.push(run.score);
      }
    }
  }
  const bosses = Array.from(bossMap.values()).sort((a, b) => b.count - a.count);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Boss</th>
            <th className="px-4 py-2 text-left">Times Fought</th>
            <th className="px-4 py-2 text-left">Highest Score</th>
            <th className="px-4 py-2 text-left">Average Score</th>
          </tr>
        </thead>
        <tbody>
          {bosses.map((boss, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {boss.icon && <img src={boss.icon} alt={boss.name} className="w-7 h-7 rounded inline-block" />}
                  <span>{boss.name}</span>
                </div>
              </td>
              <td className="px-4 py-2">{boss.count}</td>
              <td className="px-4 py-2 font-semibold">{Math.max(...boss.scores)}</td>
              <td className="px-4 py-2">{(boss.scores.reduce((a, b) => a + b, 0) / boss.scores.length).toFixed(2)}</td>
            </tr>
          ))}
          {bosses.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No boss data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
