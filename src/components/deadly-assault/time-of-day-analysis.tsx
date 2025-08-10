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
  const data = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Runs per Hour",
        data: hourCounts,
        backgroundColor: "#60a5fa",
      },
    ],
  };
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Time of Day Analysis</h3>
      <Chart type="bar" data={data} options={{}} height={250} />
    </div>
  );
}
