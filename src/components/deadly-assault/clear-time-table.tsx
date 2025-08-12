import type { DeadlyAssaultData } from "@/types/deadly-assault";

export function ClearTimeTable({ }: { allData: DeadlyAssaultData[] }) {
  // Placeholder: no clear time data in current schema
  // const times = aggregateClearTimes(allData);
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Clear Time Analysis</h3>
      <div className="text-muted-foreground">No clear time data available in current schema.</div>
    </div>
  );
}
