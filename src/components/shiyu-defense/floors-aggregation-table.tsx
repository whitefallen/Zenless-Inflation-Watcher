import type { ShiyuDefenseData } from "@/types/shiyu-defense"

export function ShiyuFloorsAggregationTable({ allData }: { allData: ShiyuDefenseData[] }) {
  const floorMap = new Map();
  
  for (const d of allData) {
    for (const floor of d?.data?.all_floor_detail || []) {
      const key = floor.layer_index;
      if (!floorMap.has(key)) {
        floorMap.set(key, { layer: key, count: 0, ratings: [] as string[], times: [] as number[] });
      }
      const entry = floorMap.get(key);
      entry.count += 1;
      entry.ratings.push(floor.rating);
      entry.times.push(floor.node_1.battle_time);
    }
  }
  
  const floors = Array.from(floorMap.values()).sort((a, b) => b.count - a.count);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Layer</th>
            <th className="px-4 py-2 text-left">Times Cleared</th>
            <th className="px-4 py-2 text-left">Best Rating</th>
            <th className="px-4 py-2 text-left">Fastest Time</th>
            <th className="px-4 py-2 text-left">Average Time</th>
          </tr>
        </thead>
        <tbody>
          {floors.map((floor, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">{floor.layer}</td>
              <td className="px-4 py-2">{floor.count}</td>
              <td className="px-4 py-2 font-semibold">{floor.ratings.sort().reverse()[0]}</td>
              <td className="px-4 py-2">{Math.min(...floor.times)}s</td>
              <td className="px-4 py-2">{(floor.times.reduce((a: number, b: number) => a + b, 0) / floor.times.length).toFixed(2)}s</td>
            </tr>
          ))}
          {floors.length === 0 && (
            <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No floor data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
