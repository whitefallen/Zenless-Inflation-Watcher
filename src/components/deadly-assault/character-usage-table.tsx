import type { DeadlyAssaultData, DeadlyAssaultRun } from "@/types/deadly-assault";
import Image from "next/image";
import { aggregateCharacterUsage } from "@/lib/aggregation-utils";
import { getAgentInfo } from "@/lib/agent-utils";
import { AgentInfoMini } from "@/components/shared/agent-info-mini";

export function CharacterUsageTable({ allData }: { allData: DeadlyAssaultData[] }) {
  const usage = aggregateCharacterUsage<DeadlyAssaultData, DeadlyAssaultRun>(
    allData,
    (run) => run.avatar_list,
    (run) => run.score
  );

  return (
    <div className="overflow-x-auto mb-8">
      <h3 className="text-lg font-semibold mb-2">Most Used Characters</h3>
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-card">
            <th className="px-4 py-2 text-left">Avatar</th>
            <th className="px-4 py-2 text-left">Times Used</th>
            <th className="px-4 py-2 text-left">Average Score</th>
          </tr>
        </thead>
        <tbody>
          {usage.map((entry) => {
            const info = getAgentInfo(entry.avatar.id, { 
              role_square_url: entry.avatar.role_square_url, 
              rarity: entry.avatar.rarity,
              level: entry.avatar.level,
              element_type: entry.avatar.element_type
            });
            return (
              <tr key={entry.avatar.id} className="border-b">
                <td className="px-4 py-2 flex items-center gap-2">
                  {info ? (
                    <AgentInfoMini {...info} />
                  ) : (
                    <>
                      <Image
                        src={entry.avatar.role_square_url}
                        alt={`Avatar #${entry.avatar.id}`}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full border inline-block"
                        unoptimized
                      />
                      <span>ID: {entry.avatar.id}</span>
                    </>
                  )}
                </td>
                <td className="px-4 py-2">{entry.count}</td>
                <td className="px-4 py-2">{entry.averageScore?.toFixed(2) || 'N/A'}</td>
              </tr>
            );
          })}
          {usage.length === 0 && (
            <tr><td colSpan={3} className="text-center py-4 text-muted-foreground">No character data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
