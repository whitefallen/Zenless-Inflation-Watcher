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
    <div className="overflow-x-auto border border-[#2b2b33] bg-[#101014]">
      <table className={`min-w-full text-sm text-[#f4f4f0] ${tableClassName}`}>
        <thead>
          <tr className="border-b border-[#3a3a42] bg-[#18181d]">
            {fields.map((f, i) => (
              <th key={i} className={`px-4 py-2.5 text-left text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c] ${f.className || ""}`}>{f.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, idx) => (
            <tr key={idx} className="border-b border-[#2b2b33] transition-colors hover:bg-[#18181d]">
              {fields.map((f, i) => (
                <td key={i} className={`px-4 py-2.5 ${f.className || ""}`}>{f.render(row)}</td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={fields.length} className="text-center py-6 text-[#8f919c]">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
