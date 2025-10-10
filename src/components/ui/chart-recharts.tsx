import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  Legend
} from "recharts";


type LineOption = {
  dataKey: string;
  stroke?: string;
  name?: string;
  yAxisId?: string;
};

type ChartType = "line" | "bar" | "pie" | "scatter";

interface ChartOptions {
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  nameKey?: string;
  lines?: LineOption[];
  xLabel?: string;
  yLabel?: string;
  [key: string]: unknown;
}

interface ChartProps {
  type: ChartType;
  data: object[];
  options?: ChartOptions;
  height?: number;
}

export function Chart({ type, data, options, height = 300 }: ChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted-foreground">No chart data</div>;
  }
  switch (type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} {...options}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={options?.xKey || "x"} />
            <YAxis />
            {options?.yAxisRight && <YAxis {...options.yAxisRight} />}
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#eab308'
              }}
              labelStyle={{ color: '#eab308' }}
            />
            <Legend />
            {Array.isArray(options?.lines)
              ? (options.lines as LineOption[]).map((line, idx) => (
                  <Line
                    key={line.dataKey || idx}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.stroke || "#8884d8"}
                    name={line.name}
                    yAxisId={line.yAxisId}
                  />
                ))
              : (
                  <Line type="monotone" dataKey={options?.yKey || "y"} stroke="#8884d8" />
                )}
          </LineChart>
        </ResponsiveContainer>
      );
    case "bar":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} {...options}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={options?.xKey || "x"} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#eab308'
              }}
              labelStyle={{ color: '#eab308' }}
            />
            <Legend />
            <Bar dataKey={options?.yKey || "y"} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    case "pie":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey={options?.valueKey || "value"} nameKey={options?.nameKey || "name"} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#eab308'
              }}
              labelStyle={{ color: '#eab308' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey={options?.xKey || "x"} name={options?.xLabel || "X"} />
            <YAxis dataKey={options?.yKey || "y"} name={options?.yLabel || "Y"} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#eab308'
              }}
              labelStyle={{ color: '#eab308' }}
            />
            <Legend />
            <Scatter name="Data" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    default:
      return <div>Unsupported chart type</div>;
  }
}
