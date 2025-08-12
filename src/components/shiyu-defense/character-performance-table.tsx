import type { ShiyuDefenseData, Avatar } from "@/types/shiyu-defense";

import Image from "next/image";

function aggregateCharacterPerformance(allData: ShiyuDefenseData[]) {
  const charMap = new Map<number, { avatar: Avatar; count: number; totalLayer: number; topLayerCount: number }>();
  let bestLayer = 0;
  for (const d of allData) {
    for (const floor of d.data.all_floor_detail) {
      for (const {} of floor.node_1.avatars) {
        if (floor.layer_index > bestLayer) bestLayer = floor.layer_index;
      }
    }
  }
  for (const d of allData) {
    for (const floor of d.data.all_floor_detail) {
      for (const avatar of floor.node_1.avatars) {
        if (!charMap.has(avatar.id)) {
          charMap.set(avatar.id, { avatar, count: 0, totalLayer: 0, topLayerCount: 0 });
        }
        const entry = charMap.get(avatar.id)!;
        entry.count += 1;
        entry.totalLayer += floor.layer_index;
        if (floor.layer_index === bestLayer) entry.topLayerCount += 1;
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
          {perf.map((entry) => (
            <tr key={entry.avatar.id} className="border-b">
              <td className="px-4 py-2 flex items-center gap-2">
                <Image
                  src={entry.avatar.role_square_url}
                  alt={`Avatar #${entry.avatar.id}`}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full border inline-block"
                  unoptimized
                />
                <span>ID: {entry.avatar.id}</span>
              </td>
              <td className="px-4 py-2">{entry.count}</td>
              <td className="px-4 py-2">{(entry.totalLayer / entry.count).toFixed(2)}</td>
              <td className="px-4 py-2">{entry.topLayerCount}</td>
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
