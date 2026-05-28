"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  delta: number;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function MetricCard({ label, value, delta }: MetricCardProps) {
  const up = delta >= 0;
  return (
    <div
      className="rounded-xl border border-white/10 p-5"
      style={{ backgroundColor: "#15161E" }}
    >
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-white">
        {fmt(value)}
      </p>
      <div className="mt-1 flex items-center gap-1">
        {up ? (
          <TrendingUp size={12} style={{ color: "#00D97E" }} />
        ) : (
          <TrendingDown size={12} className="text-red-400" />
        )}
        <span className="text-xs" style={{ color: up ? "#00D97E" : undefined }}>
          {up ? "+" : ""}
          {fmt(Math.abs(delta))} vs prev period
        </span>
      </div>
    </div>
  );
}

interface MetricsRowProps {
  followers: number;
  reach: number;
  impressions: number;
  profileViews: number;
  accountsEngaged: number;
  prevFollowers: number;
  prevReach: number;
  prevImpressions: number;
  prevProfileViews: number;
  prevAccountsEngaged: number;
}

export function MetricsRow({
  followers,
  reach,
  impressions,
  profileViews,
  accountsEngaged,
  prevFollowers,
  prevReach,
  prevImpressions,
  prevProfileViews,
  prevAccountsEngaged,
}: MetricsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <MetricCard
        label="Followers"
        value={followers}
        delta={followers - prevFollowers}
      />
      <MetricCard label="Reach" value={reach} delta={reach - prevReach} />
      <MetricCard
        label="Impressions"
        value={impressions}
        delta={impressions - prevImpressions}
      />
      <MetricCard
        label="Profile Views"
        value={profileViews}
        delta={profileViews - prevProfileViews}
      />
      <MetricCard
        label="Accounts Engaged"
        value={accountsEngaged}
        delta={accountsEngaged - prevAccountsEngaged}
      />
    </div>
  );
}
