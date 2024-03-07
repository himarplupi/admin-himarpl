"use client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "May",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Jul",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Aug",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Sep",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Oct",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Nov",
    total: Math.floor(Math.random() * 25) + 5,
  },
  {
    name: "Dec",
    total: Math.floor(Math.random() * 25) + 5,
  },
];

export function OverviewPost() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderRadius: "var(--radius)",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--primary-foreground))",
          }}
          cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
