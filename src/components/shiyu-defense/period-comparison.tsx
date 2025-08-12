import type { ShiyuDefenseData } from "@/types/shiyu-defense";
import { SharedPeriodComparison } from "@/components/shared/period-comparison";

function getPeriodStats(data: ShiyuDefenseData) {
  // Only consider Layer 7
  const layer7 = data.data.all_floor_detail.filter(f => f.layer_index === 7);
  const node1Times = layer7.map(f => f.node_1?.battle_time).filter(t => typeof t === 'number') as number[];
  const node2Times = layer7.map(f => f.node_2?.battle_time).filter(t => typeof t === 'number') as number[];
  const allTimes = [...node1Times, ...node2Times];
  const fastest = allTimes.length ? Math.min(...allTimes) : null;
  const totalLayer7 = node1Times.reduce((a, b) => a + b, 0) + node2Times.reduce((a, b) => a + b, 0);
  return {
    begin: data.data.begin_time,
    end: data.data.end_time,
    maxLayer: data.data.max_layer,
    fastTime: fastest,
    totalLayer7Time: allTimes.length ? totalLayer7 : null,
    floors: data.data.all_floor_detail.length,
    rating: data.data.rating_list?.[0]?.rating || 'N/A',
  };
}

export function PeriodComparison({ allData }: { allData: ShiyuDefenseData[] }) {
  return (
    <SharedPeriodComparison
      allData={allData}
      getPeriodStats={getPeriodStats}
      fields={[
        { label: 'Max Layer', key: 'maxLayer' },
        { label: 'Fastest Layer 7 Time', key: 'fastTime', render: (v) => v !== null ? `${v}s` : 'N/A' },
        { label: 'Total Layer 7 Time', key: 'totalLayer7Time', render: (v) => v !== null ? `${v}s` : 'N/A' },
        { label: 'Floors Cleared', key: 'floors' },
        { label: 'Rating', key: 'rating' },
      ]}
    />
  );
}
