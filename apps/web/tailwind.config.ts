import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* shadcn/ui tokens — map to HSL CSS vars */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* Ivy Design System tokens — map to CSS custom props */
        "bg-base": "var(--bg-base)",
        "surface-1": "var(--bg-surface-1)",
        "surface-2": "var(--bg-surface-2)",
        "surface-3": "var(--bg-surface-3)",

        "border-default": "var(--border-default)",
        "border-hover": "var(--border-hover)",
        "border-focus": "var(--border-focus)",

        ivy: {
          DEFAULT: "var(--ivy)",
          dim: "var(--ivy-dim)",
          hover: "var(--ivy-hover)",
          muted: "var(--ivy-muted)",
          /* legacy aliases */
          green: "#00D97E",
          surface: "#15161E",
          bg: "#08090C",
        },

        violet: {
          DEFAULT: "var(--violet)",
          dim: "var(--violet-dim)",
        },

        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-disabled": "var(--text-disabled)",

        success: {
          DEFAULT: "var(--success)",
          dim: "var(--success-dim)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          dim: "var(--warning-dim)",
        },
        error: {
          DEFAULT: "var(--error)",
          dim: "var(--error-dim)",
        },
        info: "var(--info)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        /* Ivy design system radius */
        "ds-sm": "var(--radius-sm)",
        "ds-md": "var(--radius-md)",
        "ds-lg": "var(--radius-lg)",
        "ds-xl": "var(--radius-xl)",
        "ds-full": "var(--radius-full)",
      },
      boxShadow: {
        "ds-sm": "var(--shadow-sm)",
        "ds-md": "var(--shadow-md)",
        "ds-lg": "var(--shadow-lg)",
        "ds-xl": "var(--shadow-xl)",
        "glow-ivy": "var(--glow-ivy)",
        "glow-violet": "var(--glow-violet)",
      },
    },
  },
  plugins: [],
};

export default config;
