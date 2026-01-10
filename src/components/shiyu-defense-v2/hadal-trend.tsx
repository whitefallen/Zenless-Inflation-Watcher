"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShiyuDefenseData } from "@/types/shiyu-defense";

export function HadalTrend({ data }: { data: ShiyuDefenseData[] }) {
  // Filter for v2 data
  const v2Data = data.filter(d => d.data.max_layer === 7);

  if (v2Data.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hadal Blacksite Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No Hadal Blacksite data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const latest = v2Data[0];
  const totalTeams = latest.data.all_floor_detail.length;
  const totalBattleTime = latest.data.all_floor_detail.reduce(
    (sum, floor) => sum + (floor.node_1?.battle_time || 0),
    0
  );
  const averageBattleTime = totalTeams > 0 ? Math.round(totalBattleTime / totalTeams) : 0;
  const rating = latest.data.rating_list?.[0]?.rating || 'N/A';

  // Count 6th vs 7th floor teams
  const floor6Teams = latest.data.all_floor_detail.filter(f => f.layer_index === 6).length;
  const floor7Teams = latest.data.all_floor_detail.filter(f => f.layer_index === 7).length;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Hadal Blacksite Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{rating}</div>
            <div className="text-sm text-muted-foreground">Overall Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{totalTeams}</div>
            <div className="text-sm text-muted-foreground">Teams Used</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{averageBattleTime}s</div>
            <div className="text-sm text-muted-foreground">Avg Time/Team</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-500">{totalBattleTime}s</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Floor 4 (Node 6) Teams:</span>
            <span className="font-semibold">{floor6Teams}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Floor 5 (Node 7) Teams:</span>
            <span className="font-semibold">{floor7Teams}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
