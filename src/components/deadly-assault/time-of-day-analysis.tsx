"use client";
import type { DeadlyAssaultData } from "@/types/deadly-assault";
import { Chart } from "@/components/ui/chart";

// Placeholder: assumes run.challenge_time is a timestamp (seconds)
function aggregateTimeOfDay(allData: DeadlyAssaultData[]) {
  const hourCounts = Array(24).fill(0);
  for (const d of allData) {
    for (const run of d.data.list) {
      if (run.challenge_time) {
        const date = new Date(Number(run.challenge_time) * 1000);
        const hour = date.getHours();
        hourCounts[hour]++;
      }
    }
  }
  return hourCounts;
}

export function TimeOfDayAnalysis({ allData }: { allData: DeadlyAssaultData[] }) {
  const hourCounts = aggregateTimeOfDay(allData);
  // Recharts expects an array of objects, e.g. [{ hour: '0:00', count: 5 }, ...]
  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: hourCounts[i]
  }));
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Time of Day Analysis</h3>
      <Chart type="bar" data={data} options={{ xKey: "hour", yKey: "count" }} height={250} />
    </div>
  );
}
