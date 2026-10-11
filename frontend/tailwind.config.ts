import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0f3460", light: "#1a4a8a", dark: "#0a2240" },
        accent: { DEFAULT: "#e94560", light: "#f06070" },
        success: "#1D9E75",
      },
    },
  },
  plugins: [],
};
export default config;
