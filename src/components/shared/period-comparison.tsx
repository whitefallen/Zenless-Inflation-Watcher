import React from "react";

// Generic period comparison props for both modes
type PeriodComparisonProps<T, S extends Record<string, unknown>> = {
  allData: T[];
  getPeriodStats: (data: T) => S;
  fields: { label: string; key: keyof S & string; render?: (val: S[keyof S]) => React.ReactNode }[];
  title?: string;
};

export function SharedPeriodComparison<T, S extends Record<string, unknown>>({ allData, getPeriodStats, fields, title = "Period Comparison" }: PeriodComparisonProps<T, S>) {
  if (allData.length < 2) return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-muted-foreground">Not enough data for comparison.</div>
    </div>
  );
  // Sort by end or start time if available, else use as is
  const sorted = [...allData];
  // Optionally, user can pre-sort or provide a sort function if needed
  const latest = getPeriodStats(sorted[sorted.length - 1]);
  const previous = getPeriodStats(sorted[sorted.length - 2]);
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <h4 className="font-medium mb-1">Latest Period</h4>
          {fields.map(({ label, key, render }) => (
            <div key={key}>
              {label}: {render ? render(latest[key]) : (latest[key] as React.ReactNode)}
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <h4 className="font-medium mb-1">Previous Period</h4>
          {fields.map(({ label, key, render }) => (
            <div key={key}>
              {label}: {render ? render(previous[key]) : (previous[key] as React.ReactNode)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
