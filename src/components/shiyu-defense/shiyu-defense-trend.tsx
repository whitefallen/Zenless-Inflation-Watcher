import { PerformanceTrend } from "@/components/shared/performance-trend";
import { ShiyuDefenseData } from "@/types/shiyu-defense";
import { formatDateRange } from "@/lib/date-utils";

interface ShiyuDefenseTrendProps {
  data: ShiyuDefenseData[];
}

export function ShiyuDefenseTrend({ data }: ShiyuDefenseTrendProps) {
  // Extract trend data from the 4 most recent periods (data is sorted most-recent first)
  const trendData = data.slice(0, 4).map((item) => {
    const maxFloor = item.data?.max_layer || 0;
    const dateRange = formatDateRange(item.data?.hadal_begin_time, item.data?.hadal_end_time);

    return {
      value: maxFloor,
      label: dateRange,
      date: item.data?.hadal_end_time ? `${item.data.hadal_end_time.year}-${String(item.data.hadal_end_time.month).padStart(2, '0')}-${String(item.data.hadal_end_time.day).padStart(2, '0')}` : 'Unknown'
    };
  });

  return (
    <PerformanceTrend
      data={trendData}
      title="Floor Progression Trend"
      metricName="Max Floor"
    />
  );
}