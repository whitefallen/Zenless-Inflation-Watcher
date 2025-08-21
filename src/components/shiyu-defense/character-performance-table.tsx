import type { ShiyuDefenseData, Avatar } from "@/types/shiyu-defense";
import { AgentInfoMini } from "@/components/shared/agent-info-mini";
import { getAgentInfo } from "@/lib/agent-utils";

// Ensure proper typing for allData and related variables
function aggregateCharacterPerformance(allData: ShiyuDefenseData[]): { avatar: Avatar; count: number; totalLayer: number; topLayerCount: number }[] {
  const charMap = new Map<number, { avatar: Avatar; count: number; totalLayer: number; topLayerCount: number }>();

  for (const d of allData) {
    for (const floor of d.data.all_floor_detail) {
      for (const node of [floor.node_1, floor.node_2]) {
        if (!node.avatars || !Array.isArray(node.avatars)) continue; // Ensure avatars is defined and iterable
        for (const avatar of node.avatars) {
          if (!charMap.has(avatar.id)) {
            charMap.set(avatar.id, { avatar, count: 0, totalLayer: 0, topLayerCount: 0 });
          }
          const entry = charMap.get(avatar.id)!;
          entry.count++;
          entry.totalLayer += floor.layer_index;
          if (floor.layer_index === d.data.max_layer) {
            entry.topLayerCount++;
          }
        }
      }
    }
  }

  return Array.from(charMap.values()).sort((a, b) => b.count - a.count);
}

export function CharacterPerformanceTable({ allData }: { allData: ShiyuDefenseData[] }) {
  const perf = aggregateCharacterPerformance(allData);

  return (
    <div className="overflow-x-auto mb-8">
      <h3 className="text-lg font-semibold mb-2">Character Performance</h3>
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Avatar</th>
            <th className="px-4 py-2 text-left">Times Used</th>
            <th className="px-4 py-2 text-left">Average Layer</th>
            <th className="px-4 py-2 text-left">Top Layer Appearances</th>
          </tr>
        </thead>
        <tbody>
          {perf.map((entry) => {
            const info = getAgentInfo(entry.avatar.id, { role_square_url: entry.avatar.role_square_url, rarity: entry.avatar.rarity });
            return (
              <tr key={entry.avatar.id} className="border-b">
                <td className="px-4 py-2 flex items-center gap-2">
                  {info ? (
                    <AgentInfoMini {...info} />
                  ) : (
                    <span className="text-xs text-muted-foreground">ID: {entry.avatar.id}</span>
                  )}
                </td>
                <td className="px-4 py-2">{entry.count}</td>
                <td className="px-4 py-2">{(entry.totalLayer / entry.count).toFixed(2)}</td>
                <td className="px-4 py-2">{entry.topLayerCount}</td>
              </tr>
            );
          })}
          {perf.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No character data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
