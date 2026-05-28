"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

export function DateRangeSelector({ current }: { current: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function select(val: string) {
    const next = new URLSearchParams(params.toString());
    next.set("range", val);
    router.push(`?${next.toString()}`);
  }

  return (
    <div
      className="flex gap-1 rounded-lg border border-white/10 p-1"
      style={{ backgroundColor: "#15161E" }}
    >
      {OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => select(value)}
          className="rounded-md px-3 py-1.5 text-xs font-medium transition"
          style={{
            backgroundColor: current === value ? "#00D97E" : "transparent",
            color: current === value ? "#000" : "rgba(255,255,255,0.5)",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
