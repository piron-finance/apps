import type { Config } from "tailwindcss";

/** Every colour resolves through a CSS variable so a single class works in both themes. */
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),

        surface: {
          DEFAULT: token("surface"),
          sunken: token("surface-sunken"),
          raised: token("surface-raised"),
        },

        border: {
          DEFAULT: token("border"),
          subtle: token("border-subtle"),
          strong: token("border-strong"),
        },

        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        "subtle-foreground": token("subtle-foreground"),

        brand: {
          DEFAULT: token("brand"),
          strong: token("brand-strong"),
          foreground: token("brand-foreground"),
          ink: token("brand-ink"),
          soft: token("brand-soft"),
          line: token("brand-line"),
        },

        positive: {
          DEFAULT: token("positive"),
          soft: token("positive-soft"),
        },
        negative: {
          DEFAULT: token("negative"),
          soft: token("negative-soft"),
        },
        warning: {
          DEFAULT: token("warning"),
          soft: token("warning-soft"),
        },
        info: {
          DEFAULT: token("info"),
          soft: token("info-soft"),
        },

        // shadcn compatibility
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        input: token("input"),
        ring: token("ring"),

        chart: {
          1: token("chart-1"),
          2: token("chart-2"),
          3: token("chart-3"),
          4: token("chart-4"),
          5: token("chart-5"),
          grid: token("chart-grid"),
          axis: token("chart-axis"),
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },

      borderRadius: {
        DEFAULT: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 2px)",
        "2xl": "calc(var(--radius) + 4px)",
      },

      boxShadow: {
        pop: "var(--shadow-pop)",
        none: "none",
      },

      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--brand) / 0.45)" },
          "70%": { boxShadow: "0 0 0 6px hsl(var(--brand) / 0)" },
          "100%": { boxShadow: "0 0 0 0 hsl(var(--brand) / 0)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(-4px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "pop-in": "pop-in 0.16s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
