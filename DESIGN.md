# Ivy — Design System Reference

> This file is the single source of truth for all UI decisions in Ivy.
> Claude Code must read this file before writing any component, page, or layout.
> Do not deviate from these tokens, patterns, or principles without explicit instruction.

---

## Colour Tokens

All tokens defined in `apps/web/app/globals.css` and mapped to Tailwind in `apps/web/tailwind.config.ts`.

```css
/* Backgrounds — defined in globals.css, mapped via tailwind as bg-bg-base / bg-surface-1 etc. */
--bg-base: #08090c; /* bg-bg-base / body default */
--bg-surface-1: #0f1015; /* bg-surface-1 — sidebar, cards */
--bg-surface-2: #15161e; /* bg-surface-2 — elevated cards, modals, dropdowns */
--bg-surface-3: #1c1d27; /* bg-surface-3 — hover states, selected rows */

/* Borders */
--border-default: rgba(255, 255, 255, 0.07); /* border-border-default */
--border-hover: rgba(255, 255, 255, 0.12); /* border-border-hover */
--border-focus: #00d97e; /* border-border-focus */

/* Ivy Green — primary accent */
--ivy: #00d97e; /* text-ivy / bg-ivy */
--ivy-dim: rgba(0, 217, 126, 0.1); /* bg-ivy-dim */
--ivy-hover: #00f090; /* bg-ivy-hover */
--ivy-muted: rgba(0, 217, 126, 0.4); /* focus ring colour */

/* Violet — secondary accent */
--violet: #7c3aed; /* text-violet / bg-violet */
--violet-dim: rgba(124, 58, 237, 0.1); /* bg-violet-dim */

/* Text */
--text-primary: #eeeef2; /* text-text-primary */
--text-secondary: #a0a0b0; /* text-text-secondary */
--text-muted: rgba(160, 160, 176, 0.5); /* text-text-muted */
--text-disabled: rgba(160, 160, 176, 0.3); /* text-text-disabled */

/* Semantic */
--success: #10b981; /* text-success / bg-success */
--warning: #f59e0b; /* text-warning / bg-warning */
--error: #ef4444; /* text-error / bg-error */
--info: #3b82f6; /* text-info / bg-info */
--success-dim: rgba(16, 185, 129, 0.1); /* bg-success-dim */
--warning-dim: rgba(245, 158, 11, 0.1); /* bg-warning-dim */
--error-dim: rgba(239, 68, 68, 0.1); /* bg-error-dim */

/* Shadows — use via CSS var directly: style={{ boxShadow: 'var(--shadow-md)' }} */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3);
--glow-ivy: 0 0 20px rgba(0, 217, 126, 0.2); /* shadow-glow-ivy */
--glow-violet: 0 0 20px rgba(124, 58, 237, 0.2); /* shadow-glow-violet */

/* Border Radius — use via CSS var: style={{ borderRadius: 'var(--radius-lg)' }} */
--radius-sm: 6px; /* rounded-ds-sm */
--radius-md: 10px; /* rounded-ds-md */
--radius-lg: 14px; /* rounded-ds-lg */
--radius-xl: 20px; /* rounded-ds-xl */
--radius-full: 9999px; /* rounded-ds-full */
```

### Tailwind mapping

All tokens are live in `tailwind.config.ts`. Use these utility class patterns:

```
Backgrounds:   bg-bg-base  bg-surface-1  bg-surface-2  bg-surface-3
Borders:       border-border-default  border-border-hover  border-border-focus
Ivy green:     text-ivy  bg-ivy  bg-ivy-dim  bg-ivy-hover
Violet:        text-violet  bg-violet  bg-violet-dim
Text:          text-text-primary  text-text-secondary  text-text-muted  text-text-disabled
Semantic:      text-success  bg-success  bg-success-dim
               text-warning  bg-warning  bg-warning-dim
               text-error    bg-error    bg-error-dim
               text-info     bg-info
Shadows:       shadow-ds-sm  shadow-ds-md  shadow-ds-lg  shadow-glow-ivy
Border radius: rounded-ds-sm  rounded-ds-md  rounded-ds-lg  rounded-ds-xl  rounded-ds-full
```

shadcn/ui tokens (`background`, `foreground`, `primary`, `card`, etc.) remain available unchanged.

---

## Typography

### Font Families

```
Display & Headings:  Geist          — weights: 400, 500, 600, 700
Body & UI:           Inter          — weights: 400, 500, 600
Numbers & Data:      Geist Mono     — weights: 400, 500
```

Load all three via `next/font/google`. Never use system fonts for UI text.

### Type Scale

```
--text-xs:   11px / line-height: 1.5  / letter-spacing: 0.02em
--text-sm:   13px / line-height: 1.6  / letter-spacing: 0.01em
--text-base: 15px / line-height: 1.6  / letter-spacing: 0
--text-lg:   17px / line-height: 1.5  / letter-spacing: -0.01em
--text-xl:   20px / line-height: 1.4  / letter-spacing: -0.02em
--text-2xl:  24px / line-height: 1.3  / letter-spacing: -0.02em
--text-3xl:  30px / line-height: 1.2  / letter-spacing: -0.03em
--text-4xl:  38px / line-height: 1.1  / letter-spacing: -0.04em
--text-5xl:  48px / line-height: 1.05 / letter-spacing: -0.04em
```

### Rules

- All metric values and numbers in dashboards use **Geist Mono** with `font-variant-numeric: tabular-nums` so columns align perfectly
- Headings always use **Geist**
- Body copy, labels, captions use **Inter**
- Never mix fonts within a single UI component
- Never use font-weight below 400 in the UI

---

## Spacing Scale

Use multiples of 4px only. Never use arbitrary values.

```
4px   — xs   — icon padding, tight inline gaps
8px   — sm   — between label and input
12px  — md   — inner card padding (compact)
16px  — lg   — standard gap between elements
20px  — xl   — section spacing (compact)
24px  — 2xl  — card padding, section gaps
32px  — 3xl  — between major sections
40px  — 4xl  — page section padding
48px  — 5xl  — hero spacing
64px  — 6xl  — large section gaps
```

---

## Border Radius

```
--radius-sm:   6px   — badges, tags, small inputs
--radius-md:   10px  — buttons, inputs, small cards
--radius-lg:   14px  — cards, panels
--radius-xl:   20px  — large cards, modals
--radius-full: 9999px — pills, avatars, toggles
```

---

## Shadows

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3);

/* Glow effects — use sparingly */
--glow-ivy: 0 0 20px rgba(0, 217, 126, 0.2);
--glow-violet: 0 0 20px rgba(124, 58, 237, 0.2);
```

---

## Component Patterns

### Buttons

Three variants only. No others.

```
Primary:     bg #00D97E, text #08090C (dark), font-weight 600
             hover: bg #00F090
             active: scale(0.97)
             border-radius: --radius-md

Secondary:   bg transparent, border 1px --border-default, text --text-primary
             hover: bg --bg-surface-2, border --border-hover
             border-radius: --radius-md

Destructive: bg transparent, border 1px rgba(239,68,68,0.30), text #EF4444
             hover: bg --error-dim
             border-radius: --radius-md
```

All buttons:

- Height: 36px (default), 32px (sm), 40px (lg)
- Padding: 0 16px (default), 0 12px (sm), 0 20px (lg)
- Transition: all 150ms ease
- Cursor: pointer
- Focus ring: 2px offset, color --ivy-muted
- Disabled: opacity 0.4, cursor not-allowed

### Inputs

```
Background:   --bg-surface-1
Border:       1px solid --border-default
Border-focus: 1px solid --ivy
Border-error: 1px solid --error
Border-radius: --radius-md
Height:       40px
Padding:      0 12px
Font:         Inter 14px --text-primary
Placeholder:  --text-muted

Transition:   border-color 150ms ease, box-shadow 150ms ease
Focus shadow: 0 0 0 3px rgba(0, 217, 126, 0.12)
```

Error state: red border + small error message below in --error, 12px Inter.

### Cards

```
Background:   --bg-surface-1
Border:       1px solid --border-default
Border-radius: --radius-lg
Padding:      24px
Shadow:       --shadow-md

Hover (interactive cards):
  border-color: --border-hover
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))
  transition: all 200ms ease
```

### Badges / Pills

```
Default:  bg --bg-surface-2, border --border-default, text --text-secondary
Green:    bg --ivy-dim, text --ivy
Violet:   bg --violet-dim, text --violet
Success:  bg --success-dim, text --success
Warning:  bg --warning-dim, text --warning
Error:    bg --error-dim, text --error

Padding:  3px 8px
Font:     Inter 11px, font-weight 500, letter-spacing 0.02em
Radius:   --radius-full
```

### Skeleton Loaders

Never use a spinner. Always use skeletons.

```css
background: linear-gradient(
  90deg,
  rgba(255, 255, 255, 0.04) 25%,
  rgba(255, 255, 255, 0.08) 50%,
  rgba(255, 255, 255, 0.04) 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: --radius-sm;

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## Animation Principles

Use Framer Motion for all animations. These are the only motion patterns used in Ivy.

### Page transitions

```typescript
// Page wrapper — fade + slide up
const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};
```

### Stagger children (lists, card grids)

```typescript
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};
```

### Press effect (buttons, links, interactive cards)

```typescript
whileTap={{ scale: 0.96 }}
transition={{ duration: 0.1 }}
```

### Hover lift (cards)

```typescript
whileHover={{ y: -2, transition: { duration: 0.2 } }}
```

### Modal / sheet entry

```typescript
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.15 } },
};
```

### Rules

- No animation should exceed 400ms duration
- Always use the custom ease `[0.16, 1, 0.3, 1]` — it feels snappy and premium
- Respect `prefers-reduced-motion` — wrap all Framer Motion components with a reduced motion check
- Never animate layout-affecting properties (width, height) — only transform and opacity

---

## Layout — Dashboard Shell

```
Sidebar:      240px wide, fixed, full height, bg --bg-surface-1, border-right --border-default
Header:       56px tall, sticky, bg rgba(8,9,12,0.80), backdrop-blur 12px
Content:      padding 32px, max-width 1200px, margin 0 auto
```

### Sidebar nav item

```
Height:       40px
Padding:      0 12px
Border-radius: --radius-md
Font:         Inter 14px, font-weight 500
Icon:         20px, --text-secondary

Default:      transparent bg, --text-secondary
Hover:        bg --bg-surface-2, --text-primary, icon --text-primary
Active:       bg --ivy-dim, text --ivy, icon --ivy
              + 2px left border in --ivy
```

---

## Layout — Public Link Page (`/[username]`)

This is the most important public surface. Treat it as a product unto itself.

### Core principles for the public page

- **Mobile-first at 390px.** Design for phone first. Desktop is an enhancement.
- **Content is the hero.** No chrome, no distractions. Just the creator's profile and links.
- **Fast.** Static generation. No loading spinners on the public page.
- **Tasteful, not templated.** It should not look like Linktree. It should look like a designer made it.

### Layout

```
Max-width:     480px, centred
Background:    --bg-base (default, creator can override accent)
Padding:       40px 20px 80px

Profile section:
  Avatar:      72px circle, border 2px solid --border-default
  Name:        Geist 22px font-weight 700 --text-primary
  Bio:         Inter 14px --text-secondary, max 2 lines
  Social row:  icons 20px, gap 16px, --text-muted, hover --text-primary

Links section:
  Gap between links: 10px
  Each link card:
    bg --bg-surface-1
    border 1px solid --border-default
    border-radius --radius-lg
    padding: 14px 18px
    height: 52px
    font: Inter 15px font-weight 500 --text-primary
    hover: bg --bg-surface-2, border --border-hover, y: -1px
    active/tap: scale(0.98)
    transition: all 180ms ease

Footer:
  "Made with Ivy" — Inter 12px --text-muted, centred
  Subtle, not promotional
```

### Public page animation sequence

```typescript
// Profile section fades in first
// Links stagger in 60ms apart after profile
// Each link slides up 10px from below

// Total perceived load time: under 400ms
```

### What the public page must NOT have

- No Ivy logo prominently displayed (subtle footer only)
- No ads, no upsell banners
- No navigation header
- No sidebar
- No external fonts beyond the two loaded — no decorative fonts
- No background patterns, textures, or gradients on the default theme

---

## Dashboard Charts (Tremor)

Override Tremor defaults to match the design system:

```typescript
// Colour order for multi-series charts
const chartColors = ["#00D97E", "#7C3AED", "#3B82F6", "#F59E0B"];

// All chart text: Inter 12px --text-secondary
// Grid lines: rgba(255,255,255,0.05)
// Tooltip: bg --bg-surface-2, border --border-default, shadow --shadow-md
// Axis lines: rgba(255,255,255,0.06)
```

---

## Iconography

Use **Lucide React** exclusively. No mixing icon libraries.

```
Default size:  20px (UI icons), 16px (inline/small), 24px (empty states)
Stroke-width:  1.5 (default), 2 (emphasis)
Colour:        inherit from parent text colour
```

Social platform icons are the exception — use the official SVG brand icons, not Lucide approximations. Store in `apps/web/public/icons/social/`.

---

## Do / Don't

### Do

- Use `--bg-surface-2` for hover states, never a lighter version of the base
- Use Geist Mono for all numbers — follower counts, click counts, percentages
- Keep empty states simple: icon + heading + one line subtext + one CTA max
- Use `--ivy-dim` as background when highlighting something in green
- Always show skeleton loaders while data is loading
- Animate lists with stagger — it makes the UI feel alive without being distracting

### Don't

- Don't use pure white (#FFFFFF) anywhere in the UI — use --text-primary (#EEEEF2)
- Don't use pure black (#000000) — use --bg-base (#08090C)
- Don't add box shadows to elements that are already on a dark surface — it muddies the depth
- Don't use more than 2 accent colours on a single page
- Don't put borders on both a card and its container — one level of border only
- Don't use opacity hacks to create colour variants — use the defined dim tokens
- Don't animate width, height, or layout properties — only transform and opacity
- Don't show empty charts — show a "no data yet" empty state instead

---

## Responsive Breakpoints

```
Mobile:   < 640px   — single column, touch-friendly tap targets (min 44px)
Tablet:   640–1024px — two column where applicable
Desktop:  > 1024px  — full layout
```

The public link page is mobile-only in design intent. It looks fine on desktop but optimise for 390px.

The dashboard is desktop-first. A simplified mobile view is a future session — do not build it now.

---

## Accessibility Baseline

- All interactive elements have `:focus-visible` ring: `2px solid --ivy-muted, offset 2px`
- Colour contrast: all text on backgrounds must meet WCAG AA (4.5:1 for body, 3:1 for large text)
- All icon-only buttons have `aria-label`
- All form inputs have associated `<label>` elements
- Skeleton loaders have `aria-busy="true"` on their container
