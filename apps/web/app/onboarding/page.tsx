"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { completeOnboarding } from "./actions";
import { Check } from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/social-icons";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

const platforms = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "youtube", label: "YouTube", icon: YoutubeIcon },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [platform, setPlatform] = useState("");
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  function onHandleChange(val: string) {
    const raw = val.startsWith("@") ? val : `@${val}`;
    setHandle(raw);
    setHandleAvailable(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const slug = raw.replace(/^@/, "").toLowerCase();
    if (!slug) return;
    setCheckingHandle(true);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/check-handle?slug=${encodeURIComponent(slug)}`,
      );
      const { available } = (await res.json()) as { available: boolean };
      setHandleAvailable(available);
      setCheckingHandle(false);
    }, 400);
  }

  async function handleFinish() {
    if (!platform || !userId) return;
    setSaving(true);
    await completeOnboarding(userId, name, handle);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#08090C" }}
    >
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor:
                    step >= s ? "#00D97E" : "rgba(255,255,255,0.1)",
                  color: step >= s ? "#000" : "rgba(255,255,255,0.4)",
                }}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 2 && <div className="h-px w-8 bg-white/10" />}
            </div>
          ))}
          <span className="ml-2 text-xs text-white/40">Step {step} of 2</span>
        </div>

        {step === 1 && (
          <div
            className="rounded-xl border border-white/10 p-8"
            style={{ backgroundColor: "#15161E" }}
          >
            <h1 className="mb-1 text-xl font-semibold text-white">
              Tell us about yourself
            </h1>
            <p className="mb-6 text-sm text-white/50">
              Set up your creator profile
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Handle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => onHandleChange(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-8 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
                    placeholder="@yourhandle"
                  />
                  {!checkingHandle && handleAvailable === true && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#00D97E]">
                      ✓
                    </span>
                  )}
                  {!checkingHandle && handleAvailable === false && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400">
                      ✗
                    </span>
                  )}
                </div>
                {handleAvailable === false && (
                  <p className="mt-1 text-xs text-red-400">
                    Handle already taken
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name || !handle || handleAvailable !== true}
              className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-40"
              style={{ backgroundColor: "#00D97E" }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div
            className="rounded-xl border border-white/10 p-8"
            style={{ backgroundColor: "#15161E" }}
          >
            <h1 className="mb-1 text-xl font-semibold text-white">
              Platform preference
            </h1>
            <p className="mb-2 text-sm text-white/50">
              Which platform do you mainly create for?
            </p>
            <p className="mb-6 text-xs text-white/30">
              You can connect your accounts from Settings.
            </p>

            <div className="space-y-2">
              {platforms.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPlatform(id)}
                  className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm transition"
                  style={{
                    borderColor:
                      platform === id ? "#00D97E" : "rgba(255,255,255,0.1)",
                    backgroundColor:
                      platform === id ? "rgba(0,217,126,0.06)" : "transparent",
                    color:
                      platform === id ? "#00D97E" : "rgba(255,255,255,0.7)",
                  }}
                >
                  <Icon size={18} />
                  {label}
                  {platform === id && <Check size={14} className="ml-auto" />}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!platform || saving}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-40"
                style={{ backgroundColor: "#00D97E" }}
              >
                {saving ? "Setting up…" : "Go to dashboard"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
