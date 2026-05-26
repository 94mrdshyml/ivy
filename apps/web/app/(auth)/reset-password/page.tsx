"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  return (
    <div
      className="rounded-xl border border-white/10 p-8"
      style={{ backgroundColor: "#15161E" }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-white">Set new password</h1>
        <p className="mt-1 text-sm text-white/50">Choose a strong password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-50"
          style={{ backgroundColor: "#00D97E" }}
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
