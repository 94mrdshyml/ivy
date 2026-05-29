"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Upload,
  BarChart3,
} from "lucide-react";
import type {
  LinkPage,
  Link,
  SocialProfile,
  SocialPlatform,
  Subscriber,
} from "@ivy/db";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "INSTAGRAM",
  "TWITTER",
  "YOUTUBE",
  "TIKTOK",
  "FACEBOOK",
  "LINKEDIN",
  "GITHUB",
  "WEBSITE",
];

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram",
  TWITTER: "X / Twitter",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  GITHUB: "GitHub",
  WEBSITE: "Website",
};

const ACCENT_PRESETS = [
  "#00D97E",
  "#7C3AED",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

interface Props {
  linkPage: LinkPage & { links: Link[]; socialProfiles: SocialProfile[] };
  totalClicks: number;
  recentClicks: number;
  dailyData: { date: string; clicks: number }[];
  linkClickMap: Record<string, number>;
  subscribers: Subscriber[];
  appUrl: string;
}

interface SortableLinkRowProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

function SortableLinkRow({
  link,
  onEdit,
  onDelete,
  onToggle,
}: SortableLinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: "var(--bg-surface-2)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
      className="flex items-center gap-3 rounded-ds-lg border px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-white/30 hover:text-white/60"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{link.title}</p>
        <p
          className="truncate text-xs"
          style={{ color: "rgba(160,160,176,0.5)" }}
        >
          {link.url}
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(link.id, !link.isActive)}
        className="relative h-5 w-9 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{
          backgroundColor: link.isActive ? "#00D97E" : "rgba(255,255,255,0.1)",
        }}
        aria-label={link.isActive ? "Deactivate link" : "Activate link"}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
          style={{ left: link.isActive ? "calc(100% - 18px)" : 2 }}
        />
      </button>

      <button
        onClick={() => onEdit(link)}
        className="text-white/30 hover:text-white/70"
        aria-label="Edit link"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDelete(link.id)}
        className="text-white/30 hover:text-error"
        aria-label="Delete link"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function LinkInBioEditor({
  linkPage: initialPage,
  totalClicks,
  recentClicks,
  dailyData,
  linkClickMap,
  subscribers: initialSubscribers,
  appUrl,
}: Props) {
  const page = initialPage;
  const [links, setLinks] = useState(initialPage.links);
  const [socialProfiles, setSocialProfiles] = useState(
    initialPage.socialProfiles,
  );
  const subscribers = initialSubscribers;

  // Profile fields
  const [displayName, setDisplayName] = useState(page.displayName ?? "");
  const [bio, setBio] = useState(page.bio ?? "");
  const [accentColor, setAccentColor] = useState(page.accentColor ?? "#00D97E");
  const [theme, setTheme] = useState(page.theme ?? "dark");
  const [isPublished, setIsPublished] = useState(page.isPublished);
  const [avatarUrl, setAvatarUrl] = useState(page.avatarUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(page.coverImageUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Social profile URLs (keyed by platform)
  const [socialUrls, setSocialUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const sp of initialPage.socialProfiles) {
      map[sp.platform] = sp.url;
    }
    return map;
  });

  // Add link form
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  // Edit link
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Copy URL
  const [copied, setCopied] = useState(false);

  // Preview refresh key
  const [previewKey, setPreviewKey] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const publicUrl = `${appUrl}/${page.username}`;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function refreshPreview() {
    setPreviewKey((k) => k + 1);
  }

  async function savePageField(data: Record<string, unknown>) {
    await fetch("/api/link-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    refreshPreview();
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    await savePageField({
      displayName: displayName || null,
      bio: bio || null,
      accentColor,
      theme,
      avatarUrl: avatarUrl || null,
      coverImageUrl: coverImageUrl || null,
    });
    setSavingProfile(false);
  }

  async function handleTogglePublish() {
    const next = !isPublished;
    setIsPublished(next);
    await savePageField({ isPublished: next });
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    setAvatarError("");
    const ext = file.name.split(".").pop();
    const path = `linkpage-${page.id}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      await savePageField({ avatarUrl: data.publicUrl });
    } else {
      setAvatarError(`Upload failed: ${error.message}`);
    }
    setUploadingAvatar(false);
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `covers/linkpage-${page.id}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setCoverImageUrl(data.publicUrl);
      await savePageField({ coverImageUrl: data.publicUrl });
    }
    setUploadingCover(false);
  }

  async function handleSocialBlur(platform: SocialPlatform, url: string) {
    const existing = socialProfiles.find((sp) => sp.platform === platform);
    if (!url) {
      if (existing) {
        await fetch(`/api/social-profiles/${existing.id}`, {
          method: "DELETE",
        });
        setSocialProfiles((p) => p.filter((sp) => sp.id !== existing.id));
      }
      return;
    }
    if (existing) {
      await fetch(`/api/social-profiles/${existing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      setSocialProfiles((p) =>
        p.map((sp) => (sp.id === existing.id ? { ...sp, url } : sp)),
      );
    } else {
      const res = await fetch("/api/social-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url }),
      });
      if (res.ok) {
        const created = (await res.json()) as SocialProfile;
        setSocialProfiles((p) => [...p, created]);
      }
    }
    refreshPreview();
  }

  async function handleAddLink() {
    if (!newLinkTitle || !newLinkUrl) return;
    setAddingLink(true);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newLinkTitle, url: newLinkUrl }),
    });
    if (res.ok) {
      const link = (await res.json()) as Link;
      setLinks((l) => [...l, link]);
      setNewLinkTitle("");
      setNewLinkUrl("");
      setShowAddLink(false);
      refreshPreview();
    }
    setAddingLink(false);
  }

  async function handleEditSave() {
    if (!editingLink) return;
    await fetch(`/api/links/${editingLink.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, url: editUrl }),
    });
    setLinks((l) =>
      l.map((lk) =>
        lk.id === editingLink.id
          ? { ...lk, title: editTitle, url: editUrl }
          : lk,
      ),
    );
    setEditingLink(null);
    refreshPreview();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    setLinks((l) => l.filter((lk) => lk.id !== id));
    setDeletingId(null);
    refreshPreview();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setLinks((l) => l.map((lk) => (lk.id === id ? { ...lk, isActive } : lk)));
    refreshPreview();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      position: i,
    }));
    setLinks(reordered);

    await fetch("/api/links/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        links: reordered.map(({ id, position }) => ({ id, position })),
      }),
    });
    refreshPreview();
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalLinkClicks = Object.values(linkClickMap).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="flex gap-8">
      {/* Left column — editor */}
      <div className="min-w-0 flex-1">
        {/* Publish toggle + public URL */}
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-ds-lg border p-4"
          style={{
            backgroundColor: "var(--bg-surface-1)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePublish}
              className="relative h-6 w-11 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: isPublished
                  ? "#00D97E"
                  : "rgba(255,255,255,0.1)",
              }}
              aria-label={isPublished ? "Hide page" : "Publish page"}
            >
              <span
                className="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200"
                style={{ left: isPublished ? "calc(100% - 20px)" : 4 }}
              />
            </button>
            <span
              className="text-sm font-medium"
              style={{ color: isPublished ? "#00D97E" : "#A0A0B0" }}
            >
              {isPublished ? "Page is live" : "Page is hidden"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <code className="text-xs" style={{ color: "#A0A0B0" }}>
              {publicUrl}
            </code>
            <button
              onClick={handleCopy}
              className="rounded p-1 transition-colors hover:bg-white/5"
              aria-label="Copy URL"
            >
              {copied ? (
                <Check size={14} style={{ color: "#00D97E" }} />
              ) : (
                <Copy size={14} style={{ color: "#A0A0B0" }} />
              )}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 transition-colors hover:bg-white/5"
              aria-label="Open in new tab"
            >
              <ExternalLink size={14} style={{ color: "#A0A0B0" }} />
            </a>
          </div>
        </div>

        {/* Profile section */}
        <section
          className="mb-6 rounded-ds-lg border p-6"
          style={{
            backgroundColor: "var(--bg-surface-1)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Profile</h3>

          {/* Cover image */}
          <div className="mb-4">
            <label
              className="mb-1 block text-xs font-medium"
              style={{ color: "#A0A0B0" }}
            >
              Cover image
            </label>
            <div
              className="relative cursor-pointer overflow-hidden rounded-ds-lg border transition hover:opacity-80"
              style={{
                height: 100,
                borderColor: "rgba(255,255,255,0.07)",
                backgroundColor: "var(--bg-surface-2)",
              }}
              onClick={() => coverRef.current?.click()}
            >
              {coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center gap-2 text-xs"
                  style={{ color: "#A0A0B0" }}
                >
                  <Upload size={14} />
                  {uploadingCover
                    ? "Uploading…"
                    : "Click to upload cover (1440×400 recommended)"}
                </div>
              )}
            </div>
            {coverImageUrl && (
              <button
                onClick={() => {
                  setCoverImageUrl("");
                  savePageField({ coverImageUrl: null });
                }}
                className="mt-1 text-xs"
                style={{ color: "#EF4444" }}
              >
                Remove cover
              </button>
            )}
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverUpload(f);
              }}
            />
          </div>

          {/* Avatar */}
          <div className="mb-4 flex items-center gap-4">
            <div
              className="h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border transition hover:opacity-80"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
              onClick={() => fileRef.current?.click()}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <Upload size={18} style={{ color: "#A0A0B0" }} />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-sm disabled:opacity-50"
                style={{ color: "#A0A0B0" }}
              >
                {uploadingAvatar ? "Uploading…" : "Upload photo"}
              </button>
              <p className="text-xs" style={{ color: "rgba(160,160,176,0.5)" }}>
                PNG, JPG up to 2MB
              </p>
              {avatarError && (
                <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>
                  {avatarError}
                </p>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }}
            />
          </div>

          <div className="space-y-3">
            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{ color: "#A0A0B0" }}
              >
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={page.username}
                className="w-full rounded-ds-md border px-3 py-2 text-sm text-white outline-none transition"
                style={{
                  backgroundColor: "var(--bg-surface-2)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00D97E")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.07)")
                }
              />
            </div>

            <div>
              <label
                className="mb-1 flex items-center justify-between text-xs font-medium"
                style={{ color: "#A0A0B0" }}
              >
                Bio{" "}
                <span
                  style={{
                    color:
                      bio.length > 140 ? "#EF4444" : "rgba(160,160,176,0.5)",
                  }}
                >
                  {bio.length}/160
                </span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                rows={3}
                className="w-full resize-none rounded-ds-md border px-3 py-2 text-sm text-white outline-none transition"
                style={{
                  backgroundColor: "var(--bg-surface-2)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00D97E")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.07)")
                }
              />
            </div>

            {/* Accent color */}
            <div>
              <label
                className="mb-2 block text-xs font-medium"
                style={{ color: "#A0A0B0" }}
              >
                Accent colour
              </label>
              <div className="flex items-center gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccentColor(c)}
                    className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: accentColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: 2,
                    }}
                    aria-label={c}
                  />
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  title="Custom colour"
                />
              </div>
            </div>

            {/* Theme */}
            <div>
              <label
                className="mb-2 block text-xs font-medium"
                style={{ color: "#A0A0B0" }}
              >
                Page theme
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-1.5 rounded-ds-md border px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    backgroundColor:
                      theme === "dark" ? "rgba(0,217,126,0.1)" : "transparent",
                    borderColor:
                      theme === "dark" ? "#00D97E" : "rgba(255,255,255,0.1)",
                    color: theme === "dark" ? "#00D97E" : "#A0A0B0",
                  }}
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-1.5 rounded-ds-md border px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    backgroundColor:
                      theme === "light" ? "rgba(0,217,126,0.1)" : "transparent",
                    borderColor:
                      theme === "light" ? "#00D97E" : "rgba(255,255,255,0.1)",
                    color: theme === "light" ? "#00D97E" : "#A0A0B0",
                  }}
                >
                  ☀️ Light
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-ds-md px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-50"
              style={{ backgroundColor: "#00D97E" }}
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </div>
        </section>

        {/* Social profiles */}
        <section
          className="mb-6 rounded-ds-lg border p-6"
          style={{
            backgroundColor: "var(--bg-surface-1)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <h3 className="mb-4 text-sm font-semibold text-white">
            Social profiles
          </h3>
          <div className="space-y-2">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform} className="flex items-center gap-3">
                <span
                  className="w-24 flex-shrink-0 text-xs font-medium"
                  style={{ color: "#A0A0B0" }}
                >
                  {PLATFORM_LABELS[platform]}
                </span>
                <input
                  type="url"
                  placeholder="https://"
                  defaultValue={socialUrls[platform] ?? ""}
                  onChange={(e) =>
                    setSocialUrls((m) => ({ ...m, [platform]: e.target.value }))
                  }
                  onBlur={(e) => handleSocialBlur(platform, e.target.value)}
                  className="flex-1 rounded-ds-md border px-3 py-1.5 text-sm text-white outline-none transition"
                  style={{
                    backgroundColor: "var(--bg-surface-2)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#00D97E")}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section
          className="mb-6 rounded-ds-lg border p-6"
          style={{
            backgroundColor: "var(--bg-surface-1)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Links</h3>
            <button
              onClick={() => setShowAddLink(true)}
              className="flex items-center gap-1.5 rounded-ds-md px-3 py-1.5 text-xs font-medium text-black transition"
              style={{ backgroundColor: "#00D97E" }}
            >
              <Plus size={13} /> Add link
            </button>
          </div>

          {showAddLink && (
            <div
              className="mb-4 rounded-ds-lg border p-4"
              style={{
                backgroundColor: "var(--bg-surface-2)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div className="mb-3 space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full rounded-ds-md border px-3 py-2 text-sm text-white outline-none"
                  style={{
                    backgroundColor: "var(--bg-surface-1)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                />
                <input
                  type="url"
                  placeholder="https://"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full rounded-ds-md border px-3 py-2 text-sm text-white outline-none"
                  style={{
                    backgroundColor: "var(--bg-surface-1)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLink}
                  disabled={addingLink || !newLinkTitle || !newLinkUrl}
                  className="rounded-ds-md px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
                  style={{ backgroundColor: "#00D97E" }}
                >
                  {addingLink ? "Adding…" : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowAddLink(false);
                    setNewLinkTitle("");
                    setNewLinkUrl("");
                  }}
                  className="rounded-ds-md border px-4 py-1.5 text-xs"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    color: "#A0A0B0",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {links.map((link) => (
                  <SortableLinkRow
                    key={link.id}
                    link={link}
                    onEdit={(l) => {
                      setEditingLink(l);
                      setEditTitle(l.title);
                      setEditUrl(l.url);
                    }}
                    onDelete={(id) => setDeletingId(id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {links.length === 0 && !showAddLink && (
            <p
              className="py-4 text-center text-sm"
              style={{ color: "rgba(160,160,176,0.5)" }}
            >
              No links yet. Add your first link above.
            </p>
          )}
        </section>

        {/* Analytics */}
        <section
          className="rounded-ds-lg border p-6"
          style={{
            backgroundColor: "var(--bg-surface-1)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={16} style={{ color: "#00D97E" }} />
            <h3 className="text-sm font-semibold text-white">Analytics</h3>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div
              className="rounded-ds-lg border p-4"
              style={{
                backgroundColor: "var(--bg-surface-2)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-xs" style={{ color: "#A0A0B0" }}>
                Total clicks
              </p>
              <p
                className="mt-1 text-2xl font-semibold"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  color: "#EEEEF2",
                }}
              >
                {totalClicks.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-ds-lg border p-4"
              style={{
                backgroundColor: "var(--bg-surface-2)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-xs" style={{ color: "#A0A0B0" }}>
                Last 30 days
              </p>
              <p
                className="mt-1 text-2xl font-semibold"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  color: "#EEEEF2",
                }}
              >
                {recentClicks.toLocaleString()}
              </p>
            </div>
          </div>

          {recentClicks > 0 ? (
            <div className="mb-6 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D97E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D97E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#A0A0B0" }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#A0A0B0" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-surface-2)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10,
                    }}
                    labelStyle={{ color: "#A0A0B0", fontSize: 12 }}
                    itemStyle={{ color: "#00D97E", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#00D97E"
                    strokeWidth={2}
                    fill="url(#clickGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className="mb-6 flex h-36 items-center justify-center rounded-ds-lg"
              style={{ backgroundColor: "var(--bg-surface-2)" }}
            >
              <p className="text-sm" style={{ color: "rgba(160,160,176,0.5)" }}>
                No clicks in the last 30 days
              </p>
            </div>
          )}

          {/* Per-link breakdown */}
          {links.length > 0 && (
            <div className="space-y-2">
              {[...links]
                .sort(
                  (a, b) =>
                    (linkClickMap[b.id] ?? 0) - (linkClickMap[a.id] ?? 0),
                )
                .map((link) => {
                  const clicks = linkClickMap[link.id] ?? 0;
                  const pct =
                    totalLinkClicks > 0 ? (clicks / totalLinkClicks) * 100 : 0;
                  return (
                    <div key={link.id} className="flex items-center gap-3">
                      <span
                        className="w-32 flex-shrink-0 truncate text-xs"
                        style={{ color: "#A0A0B0" }}
                      >
                        {link.title}
                      </span>
                      <div
                        className="flex-1 overflow-hidden rounded-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          height: 4,
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: "#00D97E",
                          }}
                        />
                      </div>
                      <span
                        className="w-10 flex-shrink-0 text-right text-xs font-medium"
                        style={{
                          fontFamily: "var(--font-geist-sans)",
                          color: "#EEEEF2",
                        }}
                      >
                        {clicks}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Subscribers */}
        <section
          className="rounded-ds-lg border p-6"
          style={{
            backgroundColor: "var(--bg-surface-1)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16 }}>🔔</span>
              <h3 className="text-sm font-semibold text-white">Subscribers</h3>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: "rgba(0,217,126,0.1)",
                color: "#00D97E",
              }}
            >
              {subscribers.length}
            </span>
          </div>

          {subscribers.length === 0 ? (
            <p
              className="py-4 text-center text-sm"
              style={{ color: "rgba(160,160,176,0.5)" }}
            >
              No subscribers yet. The bell icon on your public page lets
              visitors subscribe.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {[
                      "ID",
                      "First name",
                      "Last name",
                      "Email",
                      "Subscribed",
                    ].map((h) => (
                      <th
                        key={h}
                        className="pb-2 pr-4 font-medium"
                        style={{ color: "#A0A0B0" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td
                        className="py-2 pr-4 font-mono"
                        style={{ color: "rgba(160,160,176,0.6)", fontSize: 10 }}
                      >
                        {s.id}
                      </td>
                      <td className="py-2 pr-4 text-white">
                        {s.firstName ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-white">
                        {s.lastName ?? "—"}
                      </td>
                      <td className="py-2 pr-4" style={{ color: "#A0A0B0" }}>
                        {s.email}
                      </td>
                      <td
                        className="py-2 pr-4"
                        style={{ color: "rgba(160,160,176,0.5)" }}
                      >
                        {new Date(s.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Right column — preview (desktop only) */}
      <div className="hidden w-80 flex-shrink-0 xl:block">
        <p
          className="mb-2 text-xs font-medium"
          style={{ color: "rgba(160,160,176,0.5)" }}
        >
          Preview
        </p>
        <div
          className="overflow-hidden rounded-ds-xl border"
          style={{ borderColor: "rgba(255,255,255,0.07)", height: 600 }}
        >
          <iframe
            key={previewKey}
            src={`/${page.username}`}
            className="h-full w-full"
            title="Public page preview"
          />
        </div>
      </div>

      {/* Edit link modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-sm rounded-ds-xl border p-6"
            style={{
              backgroundColor: "var(--bg-surface-2)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <h3 className="mb-4 text-sm font-semibold text-white">Edit link</h3>
            <div className="mb-3 space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-ds-md border px-3 py-2 text-sm text-white outline-none"
                style={{
                  backgroundColor: "var(--bg-surface-1)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              />
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://"
                className="w-full rounded-ds-md border px-3 py-2 text-sm text-white outline-none"
                style={{
                  backgroundColor: "var(--bg-surface-1)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                disabled={!editTitle || !editUrl}
                className="flex-1 rounded-ds-md py-2 text-sm font-semibold text-black disabled:opacity-40"
                style={{ backgroundColor: "#00D97E" }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingLink(null)}
                className="flex-1 rounded-ds-md border py-2 text-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  color: "#A0A0B0",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-xs rounded-ds-xl border p-6"
            style={{
              backgroundColor: "var(--bg-surface-2)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <h3 className="mb-2 text-sm font-semibold text-white">
              Delete link?
            </h3>
            <p className="mb-4 text-xs" style={{ color: "#A0A0B0" }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 rounded-ds-md py-2 text-sm font-semibold"
                style={{
                  backgroundColor: "rgba(239,68,68,0.15)",
                  color: "#EF4444",
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-ds-md border py-2 text-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  color: "#A0A0B0",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
