"use client";
import { Chart } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ShiyuDefenseData } from "@/types/shiyu-defense";

export function ScoreProgressionChart({ allData }: { allData: ShiyuDefenseData[] }) {
  // Sort by end_time (oldest to newest), end_time is a string (ISO or timestamp)
  const sorted = [...(allData || [])].sort((a, b) => {
    const aDate = new Date(a.data.end_time);
    const bDate = new Date(b.data.end_time);
    return aDate.getTime() - bDate.getTime();
  });
  const filtered = sorted.filter(d => d.data && d.data.max_layer !== undefined && d.data.fast_layer_time !== undefined && d.data.begin_time);

  const data = filtered.map(d => {
    return {
      date: d.data.begin_time && d.data.end_time
        ? `${d.data.begin_time} to ${d.data.end_time}`
        : "Unknown",
      maxLayer: d.data.max_layer,
      fastTime: d.data.fast_layer_time,
      rating: d.data.rating_list?.[0]?.rating || null
    };
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-1">Max Layer Progression</h4>
            <Chart
              type="line"
              data={data}
              options={{
                xKey: "date",
                lines: [
                  { dataKey: "maxLayer", stroke: "#0ea5e9", name: "Max Layer" }
                ]
              }}
            />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Fastest Layer Time Progression</h4>
            <Chart
              type="line"
              data={data}
              options={{
                xKey: "date",
                lines: [
                  { dataKey: "fastTime", stroke: "#fbbf24", name: "Fastest Layer Time" }
                ]
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
