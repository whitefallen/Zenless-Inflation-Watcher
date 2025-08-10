import { Chart } from "@/components/ui/chart";
import type { DeadlyAssaultData } from "@/types/deadly-assault";

export function ScoreProgressionChart({ allData }: { allData: DeadlyAssaultData[] }) {
  // Flatten all runs with their challenge_time and score
  const runs = allData.flatMap(d => d.data.list.map(run => ({
    score: run.score,
    star: run.star,
    date: `${run.challenge_time.year}-${String(run.challenge_time.month).padStart(2, '0')}-${String(run.challenge_time.day).padStart(2, '0')}`
  })));
  // Sort by date
  runs.sort((a, b) => a.date.localeCompare(b.date));
  // Prepare chart data
  const data = {
    labels: runs.map(r => r.date),
    datasets: [
      { label: "Score", data: runs.map(r => r.score), borderColor: "#8b5cf6", backgroundColor: "#ddd6fe" },
      { label: "Stars", data: runs.map(r => r.star), borderColor: "#fbbf24", backgroundColor: "#fef3c7" }
    ]
  };
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Score & Star Progression</h3>
      <Chart type="line" data={data} />
    </div>
  );
}
