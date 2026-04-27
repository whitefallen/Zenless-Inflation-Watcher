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
      <div className="zzz-section-label mb-2">{title}</div>
      <div className="text-sm text-[#8f919c]">Not enough data for comparison.</div>
    </div>
  );
  const sorted = [...allData];
  const latest = getPeriodStats(sorted[sorted.length - 1]);
  const previous = getPeriodStats(sorted[sorted.length - 2]);
  return (
    <div className="mb-8">
      <div className="zzz-section-label mb-3">{title}</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div
          className="border border-[#3a3a42] bg-[#131316] p-4"
        >
          <div className="mb-3 text-[0.72rem] font-semibold tracking-normal uppercase text-[#ffd400]">Latest Period</div>
          {fields.map(({ label, key, render }) => (
            <div key={key} className="flex justify-between py-1 border-b border-[#2b2b33] last:border-0 text-sm">
              <span className="text-[#8f919c]">{label}</span>
              <span className="font-bold text-[#f4f4f0]">{render ? render(latest[key]) : (latest[key] as React.ReactNode)}</span>
            </div>
          ))}
        </div>
        <div
          className="border border-[#3a3a42] bg-[#131316] p-4"
        >
          <div className="mb-3 text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">Previous Period</div>
          {fields.map(({ label, key, render }) => (
            <div key={key} className="flex justify-between py-1 border-b border-[#2b2b33] last:border-0 text-sm">
              <span className="text-[#8f919c]">{label}</span>
              <span className="font-bold text-[#f4f4f0]">{render ? render(previous[key]) : (previous[key] as React.ReactNode)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
