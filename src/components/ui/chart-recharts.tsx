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
  Cell,
  ScatterChart,
  Scatter,
  Legend
} from "recharts";

interface ChartProps {
  type: "line" | "bar" | "pie" | "scatter";
  data: any[];
  options?: any;
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
            <Tooltip />
            <Legend />
            {Array.isArray(options?.lines)
              ? options.lines.map((line: any, idx: number) => (
                  <Line
                    key={line.dataKey || idx}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.stroke || "#8884d8"}
                    name={line.name}
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
            <Tooltip />
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
            <Tooltip />
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
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    default:
      return <div>Unsupported chart type</div>;
  }
}
