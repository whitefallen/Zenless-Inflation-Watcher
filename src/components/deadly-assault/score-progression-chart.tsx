"use client";
import { Chart } from "@/components/ui/chart";
import type { DeadlyAssaultData } from "@/types/deadly-assault";

export function ScoreProgressionChart({ allData }: { allData: DeadlyAssaultData[] }) {
  // Sort by end_time (oldest to newest)
  const sorted = [...(allData || [])].sort((a, b) => {
    const aEnd = a.data.end_time;
    const bEnd = b.data.end_time;
    const aDate = new Date(aEnd.year, (aEnd.month || 1) - 1, aEnd.day || 1, aEnd.hour || 0, aEnd.minute || 0, aEnd.second || 0);
    const bDate = new Date(bEnd.year, (bEnd.month || 1) - 1, bEnd.day || 1, bEnd.hour || 0, bEnd.minute || 0, bEnd.second || 0);
    return aDate.getTime() - bDate.getTime();
  });
  const filtered = sorted.filter(d => d.data && d.data.total_score !== undefined && d.data.total_star !== undefined && d.data.start_time);

  const data = filtered.map(d => {
    let percentile = d.data.rank_percent !== undefined ? d.data.rank_percent / 100 : null;
    if (percentile !== null) {
      percentile = Math.max(0, Math.min(100, percentile));
    }
    return {
      date: d.data.start_time && d.data.end_time
        ? `${d.data.start_time.year}-${String(d.data.start_time.month).padStart(2, '0')}-${String(d.data.start_time.day).padStart(2, '0')}`
          + " to " +
          `${d.data.end_time.year}-${String(d.data.end_time.month).padStart(2, '0')}-${String(d.data.end_time.day).padStart(2, '0')}`
        : "Unknown",
      score: d.data.total_score,
      star: d.data.total_star,
      percentile
    };
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Progression</h3>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold mb-1">Score Progression</h4>
          <Chart
            type="line"
            data={data}
            options={{
              xKey: "date",
              lines: [
                { dataKey: "score", stroke: "#8b5cf6", name: "Score" }
              ]
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold mb-1">Star Progression</h4>
          <Chart
            type="line"
            data={data}
            options={{
              xKey: "date",
              lines: [
                { dataKey: "star", stroke: "#fbbf24", name: "Stars" }
              ]
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold mb-1">Percentile Progression</h4>
          <Chart
            type="line"
            data={data}
            options={{
              xKey: "date",
              lines: [
                { dataKey: "percentile", stroke: "#facc15", name: "Percentile (%)" }
              ],
              yLabel: "Percentile (lower is better)"
            }}
          />
        </div>
      </div>
    </div>
  );
}
