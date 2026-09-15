import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-inverse": "var(--ink-inverse)",
        ground: "var(--ground)",
        panel: "var(--panel)",
        "panel-raised": "var(--panel-raised)",
        line: "var(--line)",
        "line-dark": "var(--line-dark)",
        muted: "var(--muted)",
        "muted-inverse": "var(--muted-inverse)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        gold: "var(--gold)",
        "gold-ink": "var(--gold-ink)",
        alert: "var(--alert)",
        good: "var(--good)",
        neutral: "var(--neutral)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        poster: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
