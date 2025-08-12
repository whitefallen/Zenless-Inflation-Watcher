import Image from "next/image";

import type { DeadlyAssaultData, DeadlyAssaultRun, TimeStamp } from "@/types/deadly-assault";
import { RunDetails } from "@/components/deadly-assault/run-details";

function getBestWorstRuns(allData: DeadlyAssaultData[]) {
  let best: DeadlyAssaultRun | null = null;
  let bestPeriod: DeadlyAssaultData | null = null;
  let worst: DeadlyAssaultRun | null = null;
  let worstPeriod: DeadlyAssaultData | null = null;
  for (const d of allData) {
    for (const run of d.data.list) {
      if (!best || run.score > best.score) {
        best = run;
        bestPeriod = d;
      }
      if (!worst || run.score < worst.score) {
        worst = run;
        worstPeriod = d;
      }
    }
  }
  return { best, bestPeriod, worst, worstPeriod };
}

function formatDateRangeFromTimeObjects(start?: TimeStamp, end?: TimeStamp) {
  if (!start || !end) return "Unknown period";
  const startDate = new Date(Date.UTC(start.year, (start.month || 1) - 1, start.day || 1));
  const endDate = new Date(Date.UTC(end.year, (end.month || 1) - 1, end.day || 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

export function BestWorstRuns({ allData }: { allData: DeadlyAssaultData[] }) {
  const { best, bestPeriod, worst, worstPeriod } = getBestWorstRuns(allData);

  // Find the period with the lowest rank_percent (best rank)
  const bestRankPeriod = allData.reduce((best, d) => {
    if (d.data.rank_percent !== undefined && (best === null || d.data.rank_percent < best.data.rank_percent)) {
      return d;
    }
    return best;
  }, null as DeadlyAssaultData | null);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Best Run</h3>
        {best ? <>
          <div className="mb-2 text-sm text-muted-foreground">
            Time Frame: {bestPeriod?.data?.start_time && bestPeriod?.data?.end_time ? formatDateRangeFromTimeObjects(bestPeriod.data.start_time, bestPeriod.data.end_time) : "Unknown"}
          </div>
          {/* Boss/Team info only in Best Period/Time Frame section */}
          <RunDetails run={best} />
        </> : <p>No runs available.</p>}
      </div>
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Lowest Scoring Run</h3>
        {worst ? <>
          <div className="mb-2 text-sm text-muted-foreground">
            Time Frame: {worstPeriod?.data?.start_time && worstPeriod?.data?.end_time ? formatDateRangeFromTimeObjects(worstPeriod.data.start_time, worstPeriod.data.end_time) : "Unknown"}
          </div>
          {/* Boss/Team info only in Best Period/Time Frame section */}
          <RunDetails run={worst} />
        </> : <p>No runs available.</p>}
      </div>
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Best Period / Time Frame</h3>
        {bestRankPeriod ? <>
          <div className="mb-2 text-sm text-muted-foreground">
            {bestRankPeriod.data.start_time && bestRankPeriod.data.end_time ? formatDateRangeFromTimeObjects(bestRankPeriod.data.start_time, bestRankPeriod.data.end_time) : "Unknown"}
          </div>
          <div className="mb-2 text-sm">
            <b>Rank Percent:</b> {bestRankPeriod.data.rank_percent !== undefined ? (bestRankPeriod.data.rank_percent / 100).toFixed(2) + "%" : "N/A"}
          </div>
          <div className="mb-2 text-sm">
            <b>Total Score:</b> {bestRankPeriod.data.total_score ?? "N/A"}
          </div>
          <div className="mb-2 text-sm">
            <b>Total Stars:</b> {bestRankPeriod.data.total_star ?? "N/A"}
          </div>
          {bestRankPeriod.data.list && bestRankPeriod.data.list.length > 0 && (
            <div className="mb-2 text-sm">
              <b>Boss/Team Used:</b>
              <div className="overflow-x-auto">
                <table className="min-w-full border mt-2 text-xs">
                  <thead>
                    <tr className="bg-card">
                      <th className="px-2 py-1 border">Boss</th>
                      <th className="px-2 py-1 border">Team</th>
                      <th className="px-2 py-1 border">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestRankPeriod.data.list.map((run, idx) => (
                      <tr key={idx} className="even:bg-card/80">
                        <td className="px-2 py-1 border align-middle">
                          {run.boss && run.boss.length > 0 ? run.boss.map(b => b.name).join(", ") : "N/A"}
                        </td>
                        <td className="px-2 py-1 border align-middle">
                          <span className="flex flex-wrap gap-1">
                            {run.avatar_list && run.avatar_list.length > 0 ? run.avatar_list.map((a, i) => (
                              a.role_square_url ? <Image key={i} src={a.role_square_url} alt={String(a.id)} width={20} height={20} className="w-5 h-5 rounded-full border inline-block" unoptimized /> : <span key={i}>{a.id}</span>
                            )) : "N/A"}
                          </span>
                        </td>
                        <td className="px-2 py-1 border align-middle font-semibold">{run.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </> : <p>No period data available.</p>}
      </div>
    </div>
  );
}
