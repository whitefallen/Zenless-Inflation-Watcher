import { PerformanceTrend } from "@/components/shared/performance-trend";
import { DeadlyAssaultData, TimeStamp } from "@/types/deadly-assault";

interface DeadlyAssaultTrendProps {
  data: DeadlyAssaultData[];
}

function formatDateRangeFromTimeObjects(start?: TimeStamp, end?: TimeStamp) {
  if (!start || !end) return "Unknown period";
  const startDate = new Date(Date.UTC(start.year, (start.month || 1) - 1, start.day || 1));
  const endDate = new Date(Date.UTC(end.year, (end.month || 1) - 1, end.day || 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

export function DeadlyAssaultTrend({ data }: DeadlyAssaultTrendProps) {
  // Extract trend data from the 4 most recent periods (data is sorted most-recent first)
  const trendData = data.slice(0, 4).map((item) => {
    const totalScore = item.data?.total_score || 0;
    const dateRange = formatDateRangeFromTimeObjects(item.data?.start_time, item.data?.end_time);

    return {
      value: totalScore,
      label: dateRange,
      date: item.data?.end_time ? `${item.data.end_time.year}-${String(item.data.end_time.month).padStart(2, '0')}-${String(item.data.end_time.day).padStart(2, '0')}` : 'Unknown'
    };
  });

  return (
    <PerformanceTrend
      data={trendData}
      title="Score Progression Trend"
      metricName="Total Score"
    />
  );
}