import type { DeadlyAssaultData, DeadlyAssaultRun } from "@/types/deadly-assault";
import { RunDetails } from "@/components/deadly-assault/run-details";

function getBestWorstRuns(allData: DeadlyAssaultData[]): { best: DeadlyAssaultRun | null, worst: DeadlyAssaultRun | null } {
  const runs = allData.flatMap(d => d.data.list);
  if (runs.length === 0) return { best: null, worst: null };
  let best = runs[0], worst = runs[0];
  for (const run of runs) {
    if (run.score > best.score) best = run;
    if (run.score < worst.score) worst = run;
  }
  return { best, worst };
}

export function BestWorstRuns({ allData }: { allData: DeadlyAssaultData[] }) {
  const { best, worst } = getBestWorstRuns(allData);
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Best Run</h3>
        {best ? <RunDetails run={best} /> : <p>No runs available.</p>}
      </div>
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Lowest Scoring Run</h3>
        {worst ? <RunDetails run={worst} /> : <p>No runs available.</p>}
      </div>
    </div>
  );
}
