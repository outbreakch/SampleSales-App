import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        sand: "#efe7dc",
        clay: "#cbb8a0",
        stone: "#7f7468",
        mist: "#f8f5f0",
        success: "#1d6b42",
        danger: "#a83b30"
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(21, 21, 21, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
