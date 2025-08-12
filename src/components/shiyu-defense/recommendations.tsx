import type { ShiyuDefenseData } from "@/types/shiyu-defense";

function getRecommendations(allData: ShiyuDefenseData[]) {
  const recs: string[] = [];
  // Suggest if always same team
  const teamCounts = new Map<string, number>();
  for (const d of allData) {
    for (const floor of d.data.all_floor_detail) {
      const key = floor.node_1.avatars.map(a => a.id).sort((a, b) => a - b).join('-');
      teamCounts.set(key, (teamCounts.get(key) || 0) + 1);
    }
  }
  if (teamCounts.size === 1) {
    recs.push("Try experimenting with different team compositions for more variety and learning.");
  }
  // Suggest if average max layer is low
  const maxLayers = allData.map(d => d.data.max_layer || 0);
  const avgLayer = maxLayers.length ? maxLayers.reduce((a, b) => a + b, 0) / maxLayers.length : 0;
  if (avgLayer < 5) {
    recs.push("Aim to clear higher layers by reviewing your best runs and optimizing your team.");
  }
  if (recs.length === 0) recs.push("Keep up the good work! No specific recommendations at this time.");
  return recs;
}

export function Recommendations({ allData }: { allData: ShiyuDefenseData[] }) {
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
