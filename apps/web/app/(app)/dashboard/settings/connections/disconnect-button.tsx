"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisconnectButton({ platform }: { platform: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    if (!confirm(`Disconnect ${platform}? Your data will remain.`)) return;
    setLoading(true);
    if (platform === "Instagram") {
      await fetch("/api/instagram/disconnect", { method: "POST" });
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      {loading ? "…" : "Disconnect"}
    </button>
  );
}
