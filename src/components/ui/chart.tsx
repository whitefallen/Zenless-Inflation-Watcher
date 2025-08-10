// Chart wrapper for future charting library integration (e.g., Chart.js, Recharts)
// For now, this is a placeholder. Replace with your preferred chart library implementation.
import React from "react";

interface ChartProps {
  type: "line" | "bar" | "pie" | "heatmap" | "scatter";
  data: unknown;
  options?: unknown;
  height?: number;
}

export function Chart({ type, data, options, height = 300 }: ChartProps) {
  // TODO: Integrate a real chart library
  return (
    <div style={{ height, width: '100%', overflow: 'auto' }} className="flex flex-col items-center justify-center bg-muted/30 rounded border border-dashed text-muted-foreground p-2">
      <span className="mb-2">Chart placeholder: {type}</span>
      <pre className="text-xs text-left w-full max-h-48 overflow-auto bg-background rounded p-2 border" style={{ fontFamily: 'monospace' }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
