"use client";
import type { DeadlyAssaultData } from "@/types/deadly-assault";
import { Chart } from "@/components/ui/chart";

// Placeholder: Correlation between score and star
function getCorrelation(allData: DeadlyAssaultData[]) {
  const points: [number, number][] = [];
  for (const d of allData) {
    for (const run of d.data.list) {
      points.push([run.score, run.star]);
    }
  }
  return points;
}

export function CorrelationAnalysis({ allData }: { allData: DeadlyAssaultData[] }) {
  const points = getCorrelation(allData);
  // Recharts expects an array of objects, e.g. [{ x: ..., y: ... }, ...]
  const data = points.map(([x, y]) => ({ x, y }));
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Score/Star Correlation</h3>
      <Chart type="scatter" data={data} options={{ xKey: "x", yKey: "y", xLabel: "Score", yLabel: "Stars" }} height={250} />
    </div>
  );
}
