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
      <div className="text-sm text-[#6b7280]">Not enough data for comparison.</div>
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
          className="p-4 border border-[#1e2438] bg-[#0f1117]"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
        >
          <div className="text-[9px] font-black tracking-[0.2em] uppercase text-[#f5c842] mb-3">Latest Period</div>
          {fields.map(({ label, key, render }) => (
            <div key={key} className="flex justify-between py-1 border-b border-[#1e2438] last:border-0 text-sm">
              <span className="text-[#6b7280]">{label}</span>
              <span className="font-bold text-[#e8e0cc]">{render ? render(latest[key]) : (latest[key] as React.ReactNode)}</span>
            </div>
          ))}
        </div>
        <div
          className="p-4 border border-[#1e2438] bg-[#0f1117]"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
        >
          <div className="text-[9px] font-black tracking-[0.2em] uppercase text-[#6b7280] mb-3">Previous Period</div>
          {fields.map(({ label, key, render }) => (
            <div key={key} className="flex justify-between py-1 border-b border-[#1e2438] last:border-0 text-sm">
              <span className="text-[#6b7280]">{label}</span>
              <span className="font-bold text-[#e8e0cc]">{render ? render(previous[key]) : (previous[key] as React.ReactNode)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
