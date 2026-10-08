import type { Config } from "tailwindcss";

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
        background: {
          light: "#FAFAFA",
          dark: "#09090B",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#121214",
        },
        onyx: {
          950: "#09090B",
          900: "#121214",
          850: "#18181B",
          800: "#27272A",
          700: "#3F3F46",
        },
        alabaster: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 50px -10px rgba(255, 255, 255, 0.06)",
        "glow-lg": "0 0 80px -20px rgba(255, 255, 255, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
