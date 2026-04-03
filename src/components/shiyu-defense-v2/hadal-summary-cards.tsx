import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { percentile } from "@/lib/utils";
import type { ShiyuDefenseData } from "@/types/shiyu-defense";

function formatScore(score?: number, maxScore?: number) {
  if (score === undefined) return "N/A";
  if (maxScore === undefined) return score.toLocaleString();
  return `${score.toLocaleString()} / ${maxScore.toLocaleString()}`;
}

export function HadalSummaryCards({ data }: { data: ShiyuDefenseData[] }) {
  const latest = data[0];

  if (!latest) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hadal Blacksite Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No Hadal Blacksite data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const totalTeams = latest.data.all_floor_detail.length;
  const battleTimes = latest.data.all_floor_detail
    .map((floor) => floor.node_1?.battle_time || 0)
    .filter((time) => time > 0);
  const totalBattleTime = battleTimes.reduce((sum, time) => sum + time, 0);
  const averageBattleTime = battleTimes.length > 0 ? Math.round(totalBattleTime / battleTimes.length) : 0;
  const fastestTeam = battleTimes.length > 0 ? Math.min(...battleTimes) : 0;
  const slowestTeam = battleTimes.length > 0 ? Math.max(...battleTimes) : 0;
  const rating = latest.data.rating_list?.[0]?.rating || "N/A";
  const floor6Teams = latest.data.all_floor_detail.filter((floor) => floor.layer_index === 6).length;
  const floor7Teams = latest.data.all_floor_detail.filter((floor) => floor.layer_index === 7).length;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Hadal Blacksite Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-2xl font-semibold text-amber-500">{rating}</div>
            <div className="text-xs text-muted-foreground">Overall Rating</div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-2xl font-semibold text-blue-500">{formatScore(latest.data.hadal_score, latest.data.hadal_max_score)}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-2xl font-semibold text-purple-500">
              {latest.data.hadal_rank_percent !== undefined ? percentile(latest.data.hadal_rank_percent) : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">Rank Percentile</div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-2xl font-semibold text-emerald-500">{totalTeams}</div>
            <div className="text-xs text-muted-foreground">Teams Used</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <div className="text-lg font-semibold">{averageBattleTime}s</div>
            <div className="text-xs text-muted-foreground">Avg Team Time</div>
          </div>
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <div className="text-lg font-semibold">{fastestTeam}s</div>
            <div className="text-xs text-muted-foreground">Fastest Team</div>
          </div>
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <div className="text-lg font-semibold">{slowestTeam}s</div>
            <div className="text-xs text-muted-foreground">Slowest Team</div>
          </div>
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <div className="text-lg font-semibold">{totalBattleTime}s</div>
            <div className="text-xs text-muted-foreground">Total Battle Time</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between rounded bg-muted/50 p-2">
            <span>Floor 4 (Node 6) Teams</span>
            <span className="font-semibold">{floor6Teams}</span>
          </div>
          <div className="flex justify-between rounded bg-muted/50 p-2">
            <span>Floor 5 (Node 7) Teams</span>
            <span className="font-semibold">{floor7Teams}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
