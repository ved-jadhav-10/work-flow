import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 mostly reads tokens from the @theme block in globals.css.
 * This file is kept for IDE intellisense and any plugin registration.
 * All custom color/font tokens are mirrored in src/app/globals.css @theme.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Starlight Focus — dark palette
        space: {
          900: "#060B19", // Deepest background
          800: "#0F172A", // Glass surfaces
        },
        starlight: {
          DEFAULT: "#FFD700", // Gold glow
          hover:   "#FDE047", // Lighter gold hover
        },
        nebula: {
          DEFAULT: "#38BDF8", // Cyan glow
          hover:   "#7DD3FC", // Lighter cyan hover
        },
        content: {
          main:  "#F8FAFC", // Bright text
          muted: "#94A3B8", // Muted text
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans:  ["var(--font-inter)", "var(--font-geist-sans)", "sans-serif"],
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.2) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
