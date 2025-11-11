import { PerformanceTrend } from "@/components/shared/performance-trend";
import { ShiyuDefenseData } from "@/types/shiyu-defense";
import { formatDateRange } from "@/lib/date-utils";

interface ShiyuDefenseTrendProps {
  data: ShiyuDefenseData[];
}

export function ShiyuDefenseTrend({ data }: ShiyuDefenseTrendProps) {
  // Extract trend data from the 4 most recent periods (data is sorted most-recent first)
  const trendData = data.slice(0, 4).map((item) => {
    // Compute total Layer 7 clear time (sum of node_1 and node_2 battle_time for layer_index === 7)
    const layer7 = (item.data?.all_floor_detail || []).filter(f => f.layer_index === 7);
    const node1Times = layer7.map(f => f.node_1?.battle_time).filter(t => typeof t === 'number') as number[];
    const node2Times = layer7.map(f => f.node_2?.battle_time).filter(t => typeof t === 'number') as number[];
    const totalLayer7 = node1Times.reduce((a, b) => a + b, 0) + node2Times.reduce((a, b) => a + b, 0);

    const dateRange = formatDateRange(item.data?.hadal_begin_time, item.data?.hadal_end_time);

    return {
      value: totalLayer7,
      label: dateRange,
      date: item.data?.hadal_end_time ? `${item.data.hadal_end_time.year}-${String(item.data.hadal_end_time.month).padStart(2, '0')}-${String(item.data.hadal_end_time.day).padStart(2, '0')}` : 'Unknown'
    };
  });

  return (
    <PerformanceTrend
      data={trendData}
      title="Layer 7 Clear Time Trend"
      metricName="Layer 7 Total Time (s)"
    />
  );
}