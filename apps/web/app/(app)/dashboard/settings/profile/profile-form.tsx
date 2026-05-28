"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { saveProfile } from "./actions";
import { Upload } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

interface ProfileFormProps {
  userId: string;
  orgId: string;
  initialName: string;
  initialSlug: string;
  avatarUrl: string | null;
}

export function ProfileForm({
  userId,
  orgId,
  initialName,
  initialSlug,
  avatarUrl,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = name !== initialName || slug !== initialSlug;

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatar(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!dirty) return;
    setSaving(true);
    await saveProfile(userId, orgId, name, slug);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10"
          onClick={() => fileRef.current?.click()}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt="Avatar"
              width={64}
              height={64}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <Upload size={18} />
          )}
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm text-white/60 hover:text-white/90 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          <p className="text-xs text-white/30">PNG, JPG up to 2MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAvatarUpload(file);
          }}
        />
      </div>

      {/* Fields */}
      <div>
        <label className="mb-1 block text-xs font-medium text-white/70">
          Full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-white/70">
          Handle
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00D97E] focus:ring-1 focus:ring-[#00D97E]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-black transition disabled:opacity-40"
        style={{ backgroundColor: "#00D97E" }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
