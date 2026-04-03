"use client";

import { useMemo } from "react";
import { Chart } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ELEMENT_TYPES } from "@/types/shared";
import type { ShiyuDefenseData } from "@/types/shiyu-defense";

export function HadalBreakdownCharts({ data }: { data: ShiyuDefenseData[] }) {
  const latest = data[0];

  const elementData = useMemo(() => {
    if (!latest) return [];
    const counts = new Map<number, number>();

    latest.data.all_floor_detail.forEach((floor) => {
      [floor.node_1, floor.node_2].forEach((node) => {
        node?.avatars?.forEach((avatar) => {
          counts.set(avatar.element_type, (counts.get(avatar.element_type) || 0) + 1);
        });
      });
    });

    return Array.from(counts.entries())
      .map(([element, count]) => ({
        element: ELEMENT_TYPES[element] || `Element ${element}`,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [latest]);

  const teamTimeData = useMemo(() => {
    if (!latest) return [];
    return latest.data.all_floor_detail.map((floor, index) => ({
      team: `Team ${index + 1} (L${floor.layer_index})`,
      battleTime: floor.node_1?.battle_time || 0
    }));
  }, [latest]);

  if (!latest) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hadal Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No Hadal Blacksite data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Hadal Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="font-semibold mb-2">Element Usage</h4>
          <Chart
            type="bar"
            data={elementData}
            options={{
              xKey: "element",
              yKey: "count"
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Team Battle Times</h4>
          <Chart
            type="bar"
            data={teamTimeData}
            options={{
              xKey: "team",
              yKey: "battleTime"
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
