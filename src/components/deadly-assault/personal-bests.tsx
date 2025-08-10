import type { DeadlyAssaultData, DeadlyAssaultRun } from "@/types/deadly-assault";

function getPersonalBests(allData: DeadlyAssaultData[]) {
  const runs = allData.flatMap(d => d.data.list);
  if (runs.length === 0) return null;
  let bestScore = runs[0], bestStars = runs[0], fastest = runs[0];
  for (const run of runs) {
    if (run.score > bestScore.score) bestScore = run;
    if (run.star > bestStars.star) bestStars = run;
    // No clear time in schema, so fastest = highest score for now
    if (run.score > fastest.score) fastest = run;
  }
  return { bestScore, bestStars, fastest };
}

export function PersonalBests({ allData }: { allData: DeadlyAssaultData[] }) {
  const bests = getPersonalBests(allData);
  if (!bests) return null;
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Personal Bests</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-1">Best Score</h4>
          <div>Score: {bests.bestScore.score}</div>
          <div>Stars: {bests.bestScore.star}</div>
        </div>
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-1">Most Stars</h4>
          <div>Score: {bests.bestStars.score}</div>
          <div>Stars: {bests.bestStars.star}</div>
        </div>
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-1">Fastest Clear</h4>
          <div>Score: {bests.fastest.score}</div>
          <div>Stars: {bests.fastest.star}</div>
        </div>
      </div>
    </div>
  );
}
