"use client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function OverviewPost({
  data,
}: {
  data: { date: string; total: number }[];
}) {
  return (
    <>
      {data.length === 0 && (
        <div className="flex min-h-32 items-center justify-center">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Tidak ada data postingan
          </h4>
        </div>
      )}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) =>
                `${new Date(value).toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "2-digit",
                })}`
              }
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
                color: "hsl(var(--foreground))",
              }}
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }}
              labelFormatter={(value: string) =>
                new Date(value).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })
              }
              formatter={(value: number) => `${value} postingan`}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
}
