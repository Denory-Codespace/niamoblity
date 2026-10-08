import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#DCEEFF",       // Soft Blue
          yellow: "#FFF1B8",     // Soft Yellow
          green: "#DDF5E3",      // Soft Green
          dark: "#102A43",       // Primary Dark
          darker: "#0B1D30",     // Deep Navy Accent
          darkMuted: "#243B53",  // Slate Dark Navy
          light: "#F8FAFC",      // Neutral Light
          border: "#E2E8F0",     // Clean border
          accentBlue: "#2563EB", // Vibrant contrast blue
          accentGreen: "#16A34A",// Trust verified green
          accentAmber: "#D97706",// Warning/Pending amber
        }
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["var(--font-jakarta)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(16, 42, 67, 0.04), 0 1px 3px rgba(16, 42, 67, 0.06)',
        'card': '0 4px 20px rgba(16, 42, 67, 0.06)',
        'floating': '0 10px 30px rgba(16, 42, 67, 0.10)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
};

export default config;
