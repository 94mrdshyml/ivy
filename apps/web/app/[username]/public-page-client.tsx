"use client";

import Image from "next/image";
import { useReducedMotion, motion } from "framer-motion";
import type { LinkPage, Link, SocialProfile, SocialPlatform } from "@ivy/db";

const SOCIAL_ICONS: Record<SocialPlatform, string> = {
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

  const accentColor = page.accentColor ?? "#00D97E";

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
    <div className="min-h-screen" style={{ backgroundColor: "#08090C" }}>
      <div
        style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 80px" }}
      >
        {/* Profile section */}
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
              border: "2px solid rgba(255,255,255,0.07)",
              marginBottom: 16,
              flexShrink: 0,
            }}
          >
            {page.avatarUrl ? (
              <Image
                src={page.avatarUrl}
                alt={page.displayName ?? page.username}
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
                {(page.displayName ?? page.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: 22,
              fontWeight: 700,
              color: "#EEEEF2",
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {page.displayName ?? page.username}
          </h1>

          {/* Bio */}
          {page.bio && (
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                color: "#A0A0B0",
                lineHeight: 1.5,
                maxWidth: 320,
                marginTop: 8,
                marginBottom: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
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
                    color: "rgba(160, 160, 176, 0.50)",
                    transition: "color 150ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#EEEEF2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(160, 160, 176, 0.50)")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SOCIAL_ICONS[sp.platform]}
                    alt={SOCIAL_LABELS[sp.platform]}
                    width={20}
                    height={20}
                    style={{
                      display: "block",
                      filter: "invert(1) opacity(0.5)",
                    }}
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
                  backgroundColor: "var(--bg-surface-1)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "var(--radius-lg)",
                  fontFamily: "var(--font-inter)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#EEEEF2",
                  textDecoration: "none",
                  transition:
                    "background-color 180ms ease, border-color 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-surface-2)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-surface-1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                {link.title}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: "rgba(160, 160, 176, 0.30)",
            textAlign: "center",
            marginTop: 40,
          }}
        >
          Made with Ivy
        </p>
      </div>
    </div>
  );
}
