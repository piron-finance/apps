import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          warm: "var(--color-bg-warm)",
          card: "var(--color-bg-card)",
          "card-hover": "var(--color-bg-card-hover)",
          elevated: "var(--color-bg-elevated)",
        },
        border: "var(--color-border)",
        "border-hover": "var(--color-border-hover)",
        content: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          subtle: "var(--color-accent-subtle)",
          text: "var(--color-accent-text)",
        },
      },
      boxShadow: {
        card: "var(--color-card-shadow)",
        "card-hover": "var(--color-card-shadow-hover)",
      },
    },
  },
  plugins: [],
};
export default config;
