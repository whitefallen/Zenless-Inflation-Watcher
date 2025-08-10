import type { DeadlyAssaultData } from "@/types/deadly-assault";

function getPeriodStats(data: DeadlyAssaultData) {
  return {
    start: data.data.start_time,
    end: data.data.end_time,
    totalScore: data.data.total_score,
    totalStar: data.data.total_star,
    runs: data.data.list.length,
    avgScore: data.data.list.length ? (data.data.total_score / data.data.list.length) : 0,
    avgStar: data.data.list.length ? (data.data.total_star / data.data.list.length) : 0,
  };
}

export function PeriodComparison({ allData }: { allData: DeadlyAssaultData[] }) {
  if (allData.length < 2) return <div className="mb-8"><h3 className="text-lg font-semibold mb-2">Period Comparison</h3><div className="text-muted-foreground">Not enough data for comparison.</div></div>;
  const latest = getPeriodStats(allData[allData.length - 1]);
  const previous = getPeriodStats(allData[allData.length - 2]);
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Period Comparison</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-1">Latest Period</h4>
          <div>Total Score: {latest.totalScore}</div>
          <div>Total Stars: {latest.totalStar}</div>
          <div>Runs: {latest.runs}</div>
          <div>Avg. Score: {latest.avgScore.toFixed(2)}</div>
          <div>Avg. Stars: {latest.avgStar.toFixed(2)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-1">Previous Period</h4>
          <div>Total Score: {previous.totalScore}</div>
          <div>Total Stars: {previous.totalStar}</div>
          <div>Runs: {previous.runs}</div>
          <div>Avg. Score: {previous.avgScore.toFixed(2)}</div>
          <div>Avg. Stars: {previous.avgStar.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
