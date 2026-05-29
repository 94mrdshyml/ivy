"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div
      className="rounded-xl border border-white/10 p-8"
      style={{ backgroundColor: "#15161E" }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-white/50">
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-[#00D97E]/30 bg-[#00D97E]/10 p-4 text-center">
          <p className="text-sm text-[#00D97E]">
            Check your email for a reset link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/70">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-50"
            style={{ backgroundColor: "#00D97E" }}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-white/40">
        <Link href="/login" className="text-white/60 hover:text-white/90">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
