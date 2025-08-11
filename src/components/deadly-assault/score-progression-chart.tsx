"use client";
import { Chart } from "@/components/ui/chart";
import type { DeadlyAssaultData } from "@/types/deadly-assault";

export function ScoreProgressionChart({ allData }: { allData: DeadlyAssaultData[] }) {
  // Use only total_score and total_star from each entry, with the period as the x-axis
  const data = (allData || [])
    .filter(d => d.data && d.data.total_score !== undefined && d.data.total_star !== undefined && d.data.start_time)
    .map(d => ({
      date: d.data.start_time && d.data.end_time
        ? `${d.data.start_time.year}-${String(d.data.start_time.month).padStart(2, '0')}-${String(d.data.start_time.day).padStart(2, '0')}`
          + " to " +
          `${d.data.end_time.year}-${String(d.data.end_time.month).padStart(2, '0')}-${String(d.data.end_time.day).padStart(2, '0')}`
        : "Unknown",
      score: d.data.total_score,
      star: d.data.total_star
    }));
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Score & Star Progression</h3>
      <Chart
        type="line"
        data={data}
        options={{
          xKey: "date",
          yKey: "score",
          lines: [
            { dataKey: "score", stroke: "#8b5cf6", name: "Score" },
            { dataKey: "star", stroke: "#fbbf24", name: "Stars" }
          ]
        }}
      />
    </div>
  );
}
