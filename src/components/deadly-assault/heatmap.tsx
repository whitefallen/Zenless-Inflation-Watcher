import type { DeadlyAssaultData } from "@/types/deadly-assault";
import { Chart } from "@/components/ui/chart";

// Placeholder: Heatmap of runs per day/hour
function aggregateHeatmap(allData: DeadlyAssaultData[]) {
  // 7 days x 24 hours
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const d of allData) {
    for (const run of d.data.list) {
      const t = run.challenge_time;
      if (t && typeof t === "object" && t.day !== undefined && t.hour !== undefined) {
        // Map 0=Sunday, 1=Monday, ...
        // JS Date: getDay() 0=Sunday, 1=Monday, ...
        // We'll use the weekday from the date, but since we only have year/month/day, create a Date
        const jsDate = new Date(t.year, (t.month || 1) - 1, t.day || 1);
        const weekday = jsDate.getDay();
        const hour = t.hour;
        if (!isNaN(weekday) && hour >= 0 && hour < 24) {
          heatmap[weekday][hour]++;
        }
      }
    }
  }
  return heatmap;
}

export function Heatmap({ allData }: { allData: DeadlyAssaultData[] }) {
  const heatmap = aggregateHeatmap(allData);
  // Flatten for chart placeholder
  const data = {
    labels: Array.from({ length: 7 * 24 }, (_, i) => {
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][Math.floor(i / 24)];
      const hour = i % 24;
      return `${day} ${hour}:00`;
    }),
    datasets: [
      {
        label: "Runs",
        data: heatmap.flat(),
        backgroundColor: "#fbbf24",
      },
    ],
  };
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Run Heatmap (Day x Hour)</h3>
      <Chart type="heatmap" data={data} options={{}} height={250} />
    </div>
  );
}
