import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
      },
      boxShadow: {
        glow: "0 4px 40px -12px rgba(93, 63, 211, 0.45)",
      },
    },
  },
  plugins: [animate],
};

export default config;
