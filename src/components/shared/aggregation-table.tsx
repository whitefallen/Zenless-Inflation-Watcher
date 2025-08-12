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
      <table className={`min-w-full border rounded ${tableClassName}`}>
        <thead>
          <tr className="bg-card">
            {fields.map((f, i) => (
              <th key={i} className={`px-4 py-2 text-left ${f.className || ""}`}>{f.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, idx) => (
            <tr key={idx} className="border-b">
              {fields.map((f, i) => (
                <td key={i} className={`px-4 py-2 ${f.className || ""}`}>{f.render(row)}</td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={fields.length} className="text-center py-4 text-muted-foreground">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
