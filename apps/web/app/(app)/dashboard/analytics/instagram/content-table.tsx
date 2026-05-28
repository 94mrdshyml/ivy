"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Post {
  id: string;
  mediaType: string;
  caption: string | null;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
}

type SortKey =
  | "reach"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "engagementRate";

const PAGE_SIZE = 20;

function typeBadge(type: string) {
  const map: Record<string, { label: string; color: string }> = {
    IMAGE: { label: "Post", color: "#1877F2" },
    VIDEO: { label: "Reel", color: "#7C3AED" },
    CAROUSEL_ALBUM: { label: "Carousel", color: "#00D97E" },
    STORY: { label: "Story", color: "#E1306C" },
  };
  const cfg = map[type] ?? { label: type, color: "#666" };
  return (
    <span
      className="rounded px-1.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export function ContentTable({ posts }: { posts: Post[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("reach");
  const [asc, setAsc] = useState(false);
  const [page, setPage] = useState(0);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(false);
    }
    setPage(0);
  }

  const sorted = [...posts].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return asc ? diff : -diff;
  });

  const total = sorted.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const slice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return null;
    return asc ? (
      <ChevronUp size={12} className="inline" />
    ) : (
      <ChevronDown size={12} className="inline" />
    );
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: "reach", label: "Reach" },
    { key: "likes", label: "Likes" },
    { key: "comments", label: "Comments" },
    { key: "shares", label: "Shares" },
    { key: "saves", label: "Saves" },
    { key: "engagementRate", label: "Eng. %" },
  ];

  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{ backgroundColor: "#15161E" }}
    >
      <p className="px-5 py-4 text-sm font-medium text-white border-b border-white/10">
        Content Performance
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs text-white/40 font-medium w-12">
                —
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/40 font-medium">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/40 font-medium">
                Caption
              </th>
              {cols.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-4 py-3 text-right text-xs text-white/40 font-medium cursor-pointer hover:text-white/70 select-none whitespace-nowrap"
                >
                  {label} <SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((post) => {
              const thumb = post.thumbnailUrl ?? post.mediaUrl;
              return (
                <tr
                  key={post.id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded object-cover w-9 h-9"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-white/10" />
                    )}
                  </td>
                  <td className="px-4 py-3">{typeBadge(post.mediaType)}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-white/70 truncate block">
                      {post.caption
                        ? post.caption.slice(0, 60) +
                          (post.caption.length > 60 ? "…" : "")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">
                    {post.reach.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">
                    {post.likes.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">
                    {post.comments.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">
                    {post.shares.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">
                    {post.saves.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">
                    {post.engagementRate.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-white/30"
                >
                  No posts yet — sync in progress
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <span className="text-xs text-white/40">{total} posts</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
            >
              Prev
            </button>
            <span className="text-xs text-white/40">
              {page + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page === pageCount - 1}
              className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
