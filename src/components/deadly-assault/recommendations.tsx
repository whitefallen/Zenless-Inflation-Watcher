import type { DeadlyAssaultData } from "@/types/deadly-assault";

// Simple recommendations based on analytics
function getRecommendations(allData: DeadlyAssaultData[]) {
  const recs: string[] = [];
  // Example: If user always uses same team, suggest trying new comps
  const teamCounts = new Map<string, number>();
  for (const d of allData) {
    for (const run of d.data.list) {
      const key = run.avatar_list.map(a => a.id).sort((a, b) => a - b).join('-');
      teamCounts.set(key, (teamCounts.get(key) || 0) + 1);
    }
  }
  if (teamCounts.size === 1) {
    recs.push("Try experimenting with different team compositions for more variety and learning.");
  }
  // Example: If average score is low, suggest reviewing best runs
  const runs = allData.flatMap(d => d.data.list);
  const avgScore = runs.length ? runs.reduce((a, b) => a + b.score, 0) / runs.length : 0;
  if (avgScore < 10000) {
    recs.push("Review your best runs to identify what worked well and aim to replicate those strategies.");
  }
  if (recs.length === 0) recs.push("Keep up the good work! No specific recommendations at this time.");
  return recs;
}

export function Recommendations({ allData }: { allData: DeadlyAssaultData[] }) {
  const recs = getRecommendations(allData);
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
      <ul className="list-disc pl-6 text-muted-foreground">
        {recs.map((rec, i) => <li key={i}>{rec}</li>)}
      </ul>
    </div>
  );
}
