/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wanua: {
          dark: "#0b0f0b",
          card: "rgba(18, 26, 18, 0.75)",
          border: "rgba(212, 175, 55, 0.25)",
          gold: "#d4af37",
          amber: "#f59e0b",
          emerald: "#10b981",
          crimson: "#dc2626",
          parchment: "#f4ecd8"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Cinzel", "Georgia", "serif"]
      },
      backdropBlur: {
        xs: "2px"
      }
    },
  },
  plugins: [],
}
