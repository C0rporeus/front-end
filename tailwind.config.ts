import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#0b1220",
          900: "#111b2e",
          850: "#17243a",
          800: "#1b2a43",
          700: "#253757",
        },
        text: {
          primary: "#e6edf7",
          secondary: "#c0ccde",
          muted: "#8da0bb",
        },
        brand: {
          400: "#7ba5e0",
          500: "#5a85c6",
          600: "#446da9",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.25)",
        card: "0 16px 40px rgba(6, 12, 26, 0.34)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
