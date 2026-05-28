"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div
      className="rounded-xl border border-white/10 p-8"
      style={{ backgroundColor: "#15161E" }}
    >
      <div className="mb-8 text-center">
        <div
          className="mb-2 inline-block rounded-lg p-2"
          style={{ backgroundColor: "rgba(0,217,126,0.1)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#00D97E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">
          Sign in to your Ivy account
        </p>
      </div>

      <button
        onClick={handleGoogle}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
            fill="#4285F4"
          />
          <path
            d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.41-4.47-3.29H1.85v2.07A8 8 0 0 0 8.98 17z"
            fill="#34A853"
          />
          <path
            d="M4.51 10.53c-.16-.48-.25-.99-.25-1.53s.09-1.05.25-1.53V5.4H1.85a8 8 0 0 0 0 7.2l2.66-2.07z"
            fill="#FBBC05"
          />
          <path
            d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.85 5.4L4.51 7.47c.63-1.88 2.39-3.29 4.47-3.29z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span
            className="px-2 text-xs text-white/30"
            style={{ backgroundColor: "#15161E" }}
          >
            or
          </span>
        </div>
      </div>

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
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex justify-between text-xs text-white/40">
        <Link href="/forgot-password" className="hover:text-white/70">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-white/70">
          Create account
        </Link>
      </div>
    </div>
  );
}
