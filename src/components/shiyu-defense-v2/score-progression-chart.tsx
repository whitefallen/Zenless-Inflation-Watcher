"use client";
import { useMemo } from "react";
import { Chart } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ShiyuDefenseData } from "@/types/shiyu-defense";

export function ScoreProgressionChartV2({ allData }: { allData: ShiyuDefenseData[] }) {
  const chartData = useMemo(() => {
    // Sort by end time
    const sorted = [...allData].sort((a, b) => {
      const aEnd = a.data.hadal_end_time;
      const bEnd = b.data.hadal_end_time;
      const aDate = new Date(aEnd.year, (aEnd.month || 1) - 1, aEnd.day || 1);
      const bDate = new Date(bEnd.year, (bEnd.month || 1) - 1, bEnd.day || 1);
      return aDate.getTime() - bDate.getTime();
    });

    return sorted.map(d => {
      // Calculate total battle time
      const totalBattleTime = d.data.all_floor_detail.reduce((sum, floor) => {
        return sum + (floor.node_1?.battle_time || 0);
      }, 0);

      // Get rating from first floor (they should all have same overall rating)
      const rating = d.data.rating_list?.[0]?.rating || 'N/A';

      return {
        date: d.data.hadal_begin_time && d.data.hadal_end_time
          ? `${d.data.hadal_begin_time.year}-${String(d.data.hadal_begin_time.month).padStart(2, '0')}-${String(d.data.hadal_begin_time.day).padStart(2, '0')}`
            + " to " +
            `${d.data.hadal_end_time.year}-${String(d.data.hadal_end_time.month).padStart(2, '0')}-${String(d.data.hadal_end_time.day).padStart(2, '0')}`
          : "Unknown",
        battleTime: totalBattleTime,
        rating,
        floors: d.data.all_floor_detail.length,
        maxLayer: d.data.max_layer,
        score: d.data.hadal_score ?? null,
        maxScore: d.data.hadal_max_score ?? null
      };
    });
  }, [allData]);

  const hasScoreData = chartData.some((entry) => typeof entry.score === "number");

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Score Progression Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <h4 className="font-semibold mb-1">Battle Time Progression</h4>
            <Chart
              type="line"
              data={chartData}
              options={{
                xKey: "date",
                lines: [
                  { dataKey: "battleTime", stroke: "#6b21a8", name: "Total Battle Time (s)" }
                ]
              }}
            />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Teams Used Per Run</h4>
            <Chart
              type="bar"
              data={chartData}
              options={{
                xKey: "date",
                bars: [
                  { dataKey: "floors", fill: "#a16207", name: "Teams" }
                ]
              }}
            />
          </div>
          {hasScoreData && (
            <div>
              <h4 className="font-semibold mb-1">Score Progression</h4>
              <Chart
                type="line"
                data={chartData}
                options={{
                  xKey: "date",
                  lines: [
                    { dataKey: "score", stroke: "#16a34a", name: "Score" }
                  ]
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
