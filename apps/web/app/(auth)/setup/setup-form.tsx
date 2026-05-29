"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { createUserRecords } from "@/app/(auth)/register/actions";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

interface SetupFormProps {
  email: string;
}

export function SetupForm({ email }: SetupFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  function onUsernameChange(val: string) {
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(slug);
    setUsernameAvailable(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!slug) return;
    setCheckingUsername(true);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/check-handle?slug=${encodeURIComponent(slug)}`,
      );
      const { available } = (await res.json()) as { available: boolean };
      setUsernameAvailable(available);
      setCheckingUsername(false);
    }, 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameAvailable) return;
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      await createUserRecords({
        authUserId: user.id,
        email: user.email ?? email,
        firstName,
        lastName,
        orgName,
        username,
      });
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]";
  const labelCls = "mb-1 block text-xs font-medium text-white/70";

  return (
    <div
      className="rounded-xl border border-white/10 p-8"
      style={{ backgroundColor: "#15161E" }}
    >
      {/* Header */}
      <div className="mb-6 text-center">
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
        <h1 className="text-xl font-semibold text-white">
          Set up your workspace
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Just a few details to get you started.
        </p>
      </div>

      {/* Read-only email */}
      <p
        className="mb-5 text-center text-xs"
        style={{ color: "rgba(160,160,176,0.5)" }}
      >
        Setting up workspace for <span className="text-white/60">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* First + Last name */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Ada"
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Lovelace"
              className={inputCls}
            />
          </div>
        </div>

        {/* Org name */}
        <div>
          <label className={labelCls}>Workspace name</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            placeholder="Index Daily"
            className={inputCls}
          />
        </div>

        {/* Username */}
        <div>
          <label className={labelCls}>Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              required
              placeholder="yourhandle"
              className={`${inputCls} pr-8`}
            />
            {!checkingUsername && usernameAvailable === true && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#00D97E]">
                ✓
              </span>
            )}
            {!checkingUsername && usernameAvailable === false && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400">
                ✗
              </span>
            )}
          </div>
          {username && (
            <p
              className="mt-1 truncate text-xs"
              style={{ color: "rgba(160,160,176,0.5)" }}
            >
              {appUrl}/{username}
            </p>
          )}
          {usernameAvailable === false && (
            <p className="mt-0.5 text-xs text-red-400">
              Username already taken
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !usernameAvailable}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-50"
          style={{ backgroundColor: "#00D97E" }}
        >
          {loading ? "Setting up…" : "Get started"}
        </button>
      </form>
    </div>
  );
}
