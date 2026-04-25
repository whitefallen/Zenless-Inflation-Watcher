import React from "react";

export type AggregationTableField<T> = {
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export type AggregationTableProps<T> = {
  data: T[];
  fields: AggregationTableField<T>[];
  emptyMessage?: string;
  tableClassName?: string;
};

export function SharedAggregationTable<T>({ data, fields, emptyMessage = "No data available", tableClassName = "" }: AggregationTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full text-sm text-[#e8e0cc] ${tableClassName}`}>
        <thead>
          <tr className="bg-[#161921] border-b border-[#1e2438]">
            {fields.map((f, i) => (
              <th key={i} className={`px-4 py-2.5 text-left text-[9px] font-black tracking-[0.2em] uppercase text-[#6b7280] ${f.className || ""}`}>{f.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, idx) => (
            <tr key={idx} className="border-b border-[#1e2438] hover:bg-[#161921] transition-colors">
              {fields.map((f, i) => (
                <td key={i} className={`px-4 py-2.5 ${f.className || ""}`}>{f.render(row)}</td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={fields.length} className="text-center py-6 text-[#6b7280]">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
