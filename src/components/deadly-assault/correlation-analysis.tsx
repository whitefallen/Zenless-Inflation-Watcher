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
  const data = {
    datasets: [
      {
        label: "Score vs Star",
        data: points.map(([x, y]) => ({ x, y })),
        backgroundColor: "#34d399",
        pointRadius: 4,
      },
    ],
  };
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Score/Star Correlation</h3>
      <Chart type="scatter" data={data} options={{ scales: { x: { title: { display: true, text: 'Score' } }, y: { title: { display: true, text: 'Stars' } } } }} height={250} />
    </div>
  );
}
