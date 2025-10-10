"use client";
import { Chart } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ShiyuDefenseData } from "@/types/shiyu-defense";

export function ScoreProgressionChart({ allData }: { allData: ShiyuDefenseData[] }) {
  // Sort by end_time (oldest to newest), using hadal_end_time TimeStamp objects
  const sorted = [...(allData || [])].sort((a, b) => {
    const aEnd = a.data.hadal_end_time;
    const bEnd = b.data.hadal_end_time;
    if (!aEnd || !bEnd) return 0;
    const aDate = new Date(aEnd.year, (aEnd.month || 1) - 1, aEnd.day || 1, aEnd.hour || 0, aEnd.minute || 0, aEnd.second || 0);
    const bDate = new Date(bEnd.year, (bEnd.month || 1) - 1, bEnd.day || 1, bEnd.hour || 0, bEnd.minute || 0, bEnd.second || 0);
    return aDate.getTime() - bDate.getTime();
  });
  const filtered = sorted.filter(d => d.data && d.data.max_layer !== undefined && d.data.fast_layer_time !== undefined && d.data.hadal_begin_time);

  const data = filtered.map(d => {
    return {
      date: d.data.hadal_begin_time && d.data.hadal_end_time
        ? `${d.data.hadal_begin_time.year}-${String(d.data.hadal_begin_time.month).padStart(2, '0')}-${String(d.data.hadal_begin_time.day).padStart(2, '0')}`
          + " to " +
          `${d.data.hadal_end_time.year}-${String(d.data.hadal_end_time.month).padStart(2, '0')}-${String(d.data.hadal_end_time.day).padStart(2, '0')}`
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
                  { dataKey: "maxLayer", stroke: "#0369a1", name: "Max Layer" }
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
                  { dataKey: "fastTime", stroke: "#a16207", name: "Fastest Layer Time" }
                ]
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
