// tailwind.config.ts (V4 compatible)
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"], // Adjust based on your project
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
