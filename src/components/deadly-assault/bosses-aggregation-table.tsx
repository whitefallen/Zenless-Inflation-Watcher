import Image from "next/image";
import type { DeadlyAssaultData } from "@/types/deadly-assault";
import type { DeadlyAssaultRun } from "@/types/deadly-assault";
import { useMemo } from "react";
import { aggregateBossData } from "@/lib/aggregation-utils";

export function BossesAggregationTable({ allData }: { allData: DeadlyAssaultData[] }) {
  const bosses = useMemo(() => 
    aggregateBossData<DeadlyAssaultData, DeadlyAssaultRun>(
      allData,
      (run) => run.boss,
      (run) => run.score
    ), 
    [allData]
  );
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Boss</th>
            <th className="px-4 py-2 text-left">Times Fought</th>
            <th className="px-4 py-2 text-left">Highest Score</th>
            <th className="px-4 py-2 text-left">Average Score</th>
          </tr>
        </thead>
        <tbody>
          {bosses.map((boss, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {boss.icon && <Image src={boss.icon} alt={boss.name} width={28} height={28} className="w-7 h-7 rounded inline-block" unoptimized />}
                  <span>{boss.name}</span>
                </div>
              </td>
              <td className="px-4 py-2">{boss.count}</td>
              <td className="px-4 py-2 font-semibold">{boss.maxScore || 'N/A'}</td>
              <td className="px-4 py-2">{boss.averageScore?.toFixed(2) || 'N/A'}</td>
            </tr>
          ))}
          {bosses.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No boss data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
