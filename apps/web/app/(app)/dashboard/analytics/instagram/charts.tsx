"use client";

import {
  AreaChart,
  LineChart,
  BarChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DayMetric {
  date: string;
  followers: number;
  reach: number;
  impressions: number;
}

export function FollowerGrowthChart({ data }: { data: DayMetric[] }) {
  return (
    <div
      className="rounded-xl border border-white/10 p-5"
      style={{ backgroundColor: "#15161E" }}
    >
      <p className="mb-4 text-sm font-medium text-white">Follower Growth</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="igGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D97E" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00D97E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#15161E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
            itemStyle={{ color: "#00D97E", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="followers"
            stroke="#00D97E"
            strokeWidth={2}
            fill="url(#igGreen)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReachImpressionsChart({ data }: { data: DayMetric[] }) {
  return (
    <div
      className="rounded-xl border border-white/10 p-5"
      style={{ backgroundColor: "#15161E" }}
    >
      <p className="mb-4 text-sm font-medium text-white">
        Reach vs Impressions
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#15161E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              paddingTop: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="reach"
            stroke="#00D97E"
            strokeWidth={2}
            dot={false}
            name="Reach"
          />
          <Line
            type="monotone"
            dataKey="impressions"
            stroke="#7C3AED"
            strokeWidth={2}
            dot={false}
            name="Impressions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface EngagementData {
  name: string;
  value: number;
}

export function EngagementChart({ data }: { data: EngagementData[] }) {
  return (
    <div
      className="rounded-xl border border-white/10 p-5"
      style={{ backgroundColor: "#15161E" }}
    >
      <p className="mb-4 text-sm font-medium text-white">
        Engagement Breakdown
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#15161E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
            itemStyle={{ color: "#00D97E", fontSize: 12 }}
          />
          <Bar
            dataKey="value"
            fill="#00D97E"
            radius={[4, 4, 0, 0]}
            name="Total"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
