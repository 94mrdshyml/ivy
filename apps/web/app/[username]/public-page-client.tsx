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

function handleLinkClick(linkId: string) {
  fetch(`/api/links/${linkId}/click`, { method: "POST", keepalive: true });
}

export function PublicPageClient({ page }: Props) {
  const reducedMotion = useReducedMotion();
  const [theme, setTheme] = useState(page.theme ?? "dark");
  const t = theme === "light" ? LIGHT : DARK;
  const accentColor = page.accentColor ?? "#00D97E";
  const displayName = page.displayName || page.username;

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg }}>
      <div
        style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 80px" }}
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

          {/* Display name */}
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
                  style={{ display: "block", transition: "opacity 150ms" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HREFS[sp.platform]}
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
    </div>
  );
}

// alias to avoid name collision with SOCIAL_LABELS
const HREFS = SOCIAL_HREFS;
