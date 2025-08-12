import type { DeadlyAssaultData } from "@/types/deadly-assault";
import { percentile } from "@/lib/utils";
import { SharedPeriodComparison } from "@/components/shared/period-comparison";

function getPeriodStats(data: DeadlyAssaultData) {
  return {
    start: data.data.start_time,
    end: data.data.end_time,
    totalScore: data.data.total_score,
    totalStar: data.data.total_star,
    runs: data.data.list.length,
    avgScore: data.data.list.length ? (data.data.total_score / data.data.list.length) : 0,
    avgStar: data.data.list.length ? (data.data.total_star / data.data.list.length) : 0,
    rankPercent: data.data.rank_percent,
  };
}

export function PeriodComparison({ allData }: { allData: DeadlyAssaultData[] }) {
  // Sort by end_time (closest to today last)
  const sorted = [...allData].sort((a, b) => {
    const aEnd = a.data.end_time;
    const bEnd = b.data.end_time;
    const aDate = new Date(aEnd.year, (aEnd.month || 1) - 1, aEnd.day || 1, aEnd.hour || 0, aEnd.minute || 0, aEnd.second || 0);
    const bDate = new Date(bEnd.year, (bEnd.month || 1) - 1, bEnd.day || 1, bEnd.hour || 0, bEnd.minute || 0, bEnd.second || 0);
    return aDate.getTime() - bDate.getTime();
  });
  return (
    <SharedPeriodComparison
      allData={sorted}
      getPeriodStats={getPeriodStats}
      fields={[
        { label: 'Total Score', key: 'totalScore' },
        { label: 'Total Stars', key: 'totalStar' },
        { label: 'Runs', key: 'runs' },
        { label: 'Avg. Score', key: 'avgScore', render: (v) => typeof v === 'number' ? v.toFixed(2) : 'N/A' },
        { label: 'Avg. Stars', key: 'avgStar', render: (v) => typeof v === 'number' ? v.toFixed(2) : 'N/A' },
        { label: 'Percentile', key: 'rankPercent', render: (v) => typeof v === 'number' ? percentile(v) : 'N/A' },
      ]}
    />
  );
}
