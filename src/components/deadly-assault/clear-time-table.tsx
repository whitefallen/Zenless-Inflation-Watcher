import type { DeadlyAssaultData } from "@/types/deadly-assault";

function aggregateClearTimes(allData: DeadlyAssaultData[]) {
  const times: number[] = [];
  for (const d of allData) {
    for (const run of d.data.list) {
      // If you have a clear time field, use it here. For now, use challenge_time as a placeholder.
      // times.push(run.clear_time)
    }
  }
  // Placeholder: return empty array
  return times;
}

export function ClearTimeTable({ allData }: { allData: DeadlyAssaultData[] }) {
  // Placeholder: no clear time data in current schema
  // const times = aggregateClearTimes(allData);
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Clear Time Analysis</h3>
      <div className="text-muted-foreground">No clear time data available in current schema.</div>
    </div>
  );
}
