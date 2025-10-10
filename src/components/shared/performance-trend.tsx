import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface TrendData {
  value: number;
  label: string;
  date: string;
}

interface TrendAnalysis {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
  changePercent: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PerformanceTrendProps {
  data: TrendData[];
  title: string;
  metricName: string;
}

export function PerformanceTrend({ data, title, metricName }: PerformanceTrendProps) {
  // Take the 4 most recent data points (data is already sorted most-recent first)
  const recentData = data.slice(0, 4);

  if (recentData.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Need at least 2 data points to show trends</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend analysis
  const values = recentData.map(d => d.value);
  const latestValue = values[0]; // Most recent data point
  const earliestValue = values[values.length - 1]; // Oldest data point in our window
  const change = latestValue - earliestValue;
  const changePercent = earliestValue !== 0 ? (change / earliestValue) * 100 : 0;

  let analysis: TrendAnalysis;

  if (Math.abs(changePercent) < 5) {
    // Stable (less than 5% change)
    analysis = {
      trend: 'stable',
      change,
      changePercent,
      description: `Performance is stable with ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}% change over the last 4 periods`,
      icon: Minus,
      color: 'text-blue-500'
    };
  } else if (change > 0) {
    // Improving
    analysis = {
      trend: 'improving',
      change,
      changePercent,
      description: `Performance is improving with +${changePercent.toFixed(1)}% increase over the last 4 periods`,
      icon: TrendingUp,
      color: 'text-green-500'
    };
  } else {
    // Declining
    analysis = {
      trend: 'declining',
      change,
      changePercent,
      description: `Performance is declining with ${changePercent.toFixed(1)}% decrease over the last 4 periods`,
      icon: TrendingDown,
      color: 'text-red-500'
    };
  }

  const Icon = analysis.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`h-5 w-5 ${analysis.color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Latest {metricName}</span>
          <span className="font-semibold">{latestValue.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Change (last 4 periods)</span>
          <span className={`font-semibold ${analysis.color}`}>
            {change > 0 ? '+' : ''}{change.toLocaleString()} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{analysis.description}</p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Performance Trend (oldest to newest):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {recentData.slice().reverse().map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}