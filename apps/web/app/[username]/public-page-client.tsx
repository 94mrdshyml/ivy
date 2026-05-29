"use client";

import { useState } from "react";
import Image from "next/image";
import { useReducedMotion, motion } from "framer-motion";
import type { LinkPage, Link, SocialProfile, SocialPlatform } from "@ivy/db";

const SOCIAL_HREFS: Record<SocialPlatform, string> = {
  INSTAGRAM: "/icons/social/instagram.svg",
  TWITTER: "/icons/social/twitter.svg",
  YOUTUBE: "/icons/social/youtube.svg",
  TIKTOK: "/icons/social/tiktok.svg",
  FACEBOOK: "/icons/social/facebook.svg",
  LINKEDIN: "/icons/social/linkedin.svg",
  GITHUB: "/icons/social/github.svg",
  WEBSITE: "/icons/social/website.svg",
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram",
  TWITTER: "X / Twitter",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  GITHUB: "GitHub",
  WEBSITE: "Website",
};

interface ThemeTokens {
  bg: string;
  card: string;
  cardBorder: string;
  cardHover: string;
  hoverBorder: string;
  textPrimary: string;
  textSecond: string;
  textMuted: string;
  iconFilter: string;
  inputBg: string;
  inputBorder: string;
  modalBg: string;
}

const DARK: ThemeTokens = {
  bg: "#08090C",
  card: "#0F1015",
  cardBorder: "rgba(255,255,255,0.07)",
  cardHover: "#15161E",
  hoverBorder: "rgba(255,255,255,0.12)",
  textPrimary: "#EEEEF2",
  textSecond: "#A0A0B0",
  textMuted: "rgba(160,160,176,0.30)",
  iconFilter: "invert(1) opacity(0.45)",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.10)",
  modalBg: "#15161E",
};

const LIGHT: ThemeTokens = {
  bg: "#EFEFEF",
  card: "#FFFFFF",
  cardBorder: "rgba(0,0,0,0.12)",
  cardHover: "#F7F7F7",
  hoverBorder: "rgba(0,0,0,0.20)",
  textPrimary: "#111111",
  textSecond: "#555555",
  textMuted: "rgba(60,60,60,0.45)",
  iconFilter: "opacity(0.55)",
  inputBg: "rgba(0,0,0,0.04)",
  inputBorder: "rgba(0,0,0,0.12)",
  modalBg: "#FFFFFF",
};

interface Props {
  page: LinkPage & { links: Link[]; socialProfiles: SocialProfile[] };
}

const ease = [0.16, 1, 0.3, 1] as const;

const profileVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease } },
  exit: { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.15 } },
};

function handleLinkClick(linkId: string) {
  fetch(`/api/links/${linkId}/click`, { method: "POST", keepalive: true });
}

export function PublicPageClient({ page }: Props) {
  const reducedMotion = useReducedMotion();
  const [theme, setTheme] = useState(page.theme ?? "dark");
  const t = theme === "light" ? LIGHT : DARK;
  const accentColor = page.accentColor ?? "#00D97E";
  const displayName = page.displayName || page.username;

  // Subscribe modal state
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subFirst, setSubFirst] = useState("");
  const [subLast, setSubLast] = useState("");
  const [subLoading, setSubLoading] = useState(false);
  const [subResult, setSubResult] = useState<"success" | "duplicate" | null>(
    null,
  );

  const profileAnim = reducedMotion
    ? {}
    : {
        variants: profileVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  const containerAnim = reducedMotion
    ? {}
    : {
        variants: containerVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  const itemAnim = reducedMotion ? {} : { variants: itemVariants };

  const hoverAnim = reducedMotion
    ? {}
    : {
        whileHover: { y: -1, transition: { duration: 0.18 } },
        whileTap: { scale: 0.98, transition: { duration: 0.1 } },
      };

  const modalAnim = reducedMotion
    ? {}
    : {
        variants: modalVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubLoading(true);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: page.username,
        email: subEmail,
        firstName: subFirst,
        lastName: subLast,
      }),
    });
    const data = (await res.json()) as {
      subscribed?: boolean;
      alreadySubscribed?: boolean;
    };
    setSubLoading(false);
    setSubResult(data.alreadySubscribed ? "duplicate" : "success");
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: t.textPrimary,
    outline: "none",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg }}>
      {/* Cover image — max-w-6xl */}
      {page.coverImageUrl && (
        <div style={{ width: "100%", maxWidth: "72rem", margin: "0 auto" }}>
          <div style={{ width: "100%", height: 220, overflow: "hidden" }}>
            <Image
              src={page.coverImageUrl}
              alt="Cover"
              width={1152}
              height={220}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: `${page.coverImageUrl ? 24 : 40}px 20px 80px`,
        }}
      >
        {/* Profile */}
        <motion.div
          {...profileAnim}
          style={{
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 9999,
              overflow: "hidden",
              border: `2px solid ${t.cardBorder}`,
              marginBottom: 16,
              flexShrink: 0,
              ...(page.coverImageUrl
                ? { marginTop: -36, boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }
                : {}),
            }}
          >
            {page.avatarUrl ? (
              <Image
                src={page.avatarUrl}
                alt={displayName}
                width={72}
                height={72}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  backgroundColor: `${accentColor}1A`,
                  color: accentColor,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Display name + bell */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: 22,
                fontWeight: 700,
                color: t.textPrimary,
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {displayName}
            </h1>
            <button
              onClick={() => {
                setShowSubscribe(true);
                setSubResult(null);
              }}
              aria-label="Subscribe for updates"
              title="Subscribe for updates"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
                fontSize: 16,
                lineHeight: 1,
                color: t.textSecond,
                opacity: 0.6,
                transition: "opacity 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              🔔
            </button>
          </div>

          {/* Bio */}
          {page.bio && page.bio.trim() && (
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                color: t.textSecond,
                lineHeight: 1.5,
                maxWidth: 320,
                marginTop: 8,
                marginBottom: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {page.bio}
            </p>
          )}

          {/* Social icons */}
          {page.socialProfiles.length > 0 && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {page.socialProfiles.map((sp) => (
                <a
                  key={sp.id}
                  href={sp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LABELS[sp.platform]}
                  style={{
                    display: "block",
                    transition: "opacity 150ms",
                    opacity: 0.55,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SOCIAL_HREFS[sp.platform]}
                    alt={SOCIAL_LABELS[sp.platform]}
                    width={20}
                    height={20}
                    style={{ display: "block", filter: t.iconFilter }}
                  />
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Links */}
        <motion.div
          {...containerAnim}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {page.links.map((link) => (
            <motion.div key={link.id} {...itemAnim}>
              <motion.a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                {...hoverAnim}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 52,
                  width: "100%",
                  padding: "0 18px",
                  textAlign: "center",
                  backgroundColor: t.card,
                  border: `1px solid ${t.cardBorder}`,
                  borderRadius: "var(--radius-lg)",
                  fontFamily: "var(--font-inter)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: t.textPrimary,
                  textDecoration: "none",
                  transition:
                    "background-color 180ms ease, border-color 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = t.cardHover;
                  e.currentTarget.style.borderColor = t.hoverBorder;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = t.card;
                  e.currentTarget.style.borderColor = t.cardBorder;
                }}
              >
                {link.title}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: t.textMuted,
              margin: 0,
            }}
          >
            Made with Ivy
          </p>
          <button
            onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 6,
              fontSize: 14,
              lineHeight: 1,
              opacity: 0.45,
              color: t.textPrimary,
              transition: "opacity 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.45")}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Subscribe modal */}
      {showSubscribe && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSubscribe(false);
          }}
        >
          <motion.div
            {...modalAnim}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: t.modalBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            {subResult ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>
                  {subResult === "success" ? "🎉" : "👋"}
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: t.textPrimary,
                    margin: "0 0 8px",
                  }}
                >
                  {subResult === "success"
                    ? "You're subscribed!"
                    : "Already subscribed"}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 14,
                    color: t.textSecond,
                    margin: "0 0 20px",
                  }}
                >
                  {subResult === "success"
                    ? `You'll get updates from ${displayName}.`
                    : "This email is already subscribed to updates."}
                </p>
                <button
                  onClick={() => setShowSubscribe(false)}
                  style={{
                    backgroundColor: accentColor,
                    color: "#000",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: 18,
                      fontWeight: 700,
                      color: t.textPrimary,
                      margin: "0 0 4px",
                    }}
                  >
                    Subscribe for updates
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 14,
                      color: t.textSecond,
                      margin: 0,
                    }}
                  >
                    Get notified when {displayName} posts something new.
                  </p>
                </div>

                <form
                  onSubmit={handleSubscribe}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 500,
                          color: t.textSecond,
                          marginBottom: 4,
                        }}
                      >
                        First name
                      </label>
                      <input
                        type="text"
                        value={subFirst}
                        onChange={(e) => setSubFirst(e.target.value)}
                        placeholder="Ada"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = accentColor)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = t.inputBorder)
                        }
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 500,
                          color: t.textSecond,
                          marginBottom: 4,
                        }}
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        value={subLast}
                        onChange={(e) => setSubLast(e.target.value)}
                        placeholder="Lovelace"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = accentColor)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = t.inputBorder)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 500,
                        color: t.textSecond,
                        marginBottom: 4,
                      }}
                    >
                      Email <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                      onFocus={(e) =>
                        (e.target.style.borderColor = accentColor)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = t.inputBorder)
                      }
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      type="submit"
                      disabled={subLoading || !subEmail}
                      style={{
                        flex: 1,
                        backgroundColor: accentColor,
                        color: "#000",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 0",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: subLoading || !subEmail ? 0.5 : 1,
                      }}
                    >
                      {subLoading ? "Subscribing…" : "Subscribe"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubscribe(false)}
                      style={{
                        flex: 1,
                        backgroundColor: "transparent",
                        border: `1px solid ${t.cardBorder}`,
                        borderRadius: 10,
                        padding: "10px 0",
                        fontSize: 14,
                        color: t.textSecond,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
