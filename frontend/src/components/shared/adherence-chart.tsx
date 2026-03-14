"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdherenceLog } from "@/types";

interface AdherenceChartProps {
  logs: AdherenceLog[];
  title?: string;
}

interface DayData {
  date: string;
  taken: number;
  missed: number;
  late: number;
}

export function AdherenceChart({
  logs,
  title = "Daily Adherence",
}: AdherenceChartProps) {
  const grouped: Record<string, DayData> = {};

  logs.forEach((log) => {
    const date = log.date || log.taken_time?.split("T")[0] || "Unknown";
    if (!grouped[date]) {
      grouped[date] = { date, taken: 0, missed: 0, late: 0 };
    }
    if (log.status === "taken") grouped[date].taken++;
    else if (log.status === "missed") grouped[date].missed++;
    else if (log.status === "late") grouped[date].late++;
  });

  const chartData = Object.values(grouped)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No adherence data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="taken"
              fill="oklch(0.6 0.18 145)"
              name="Taken"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="late"
              fill="oklch(0.75 0.18 85)"
              name="Late"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="missed"
              fill="oklch(0.6 0.2 25)"
              name="Missed"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
