import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        border: "var(--border-color)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        amber: {
          pause: "#F5B84B",
          glow: "rgba(245, 184, 75, 0.18)"
        },
        safe: "#3DD6C3",
        danger: "#FF5C6C",
        info: "#7C9CFF",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Fraunces", "Instrument Serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pause-ring": "pauseRing 2.4s ease-in-out infinite",
      },
      keyframes: {
        pauseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.14)", opacity: "0.2" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
