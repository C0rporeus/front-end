import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-b612-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Panel Mímico (DESIGN.md): tinta del logo como fondo y turquesa como única señal.
        surface: {
          950: "#08131a",
          900: "#0d1a22",
          850: "#10202a",
          800: "#152833",
          700: "#1d3440",
        },
        text: {
          primary: "#f6f3e8",
          secondary: "#b8c6c8",
          muted: "#8498a0",
        },
        brand: {
          400: "#33c8c0",
          500: "#22a39d",
          600: "#0f6f73",
        },
        // `slate` se redefine como la escala de tinta para que las páginas que aún
        // usan clases slate-* (tools, admin) hereden el mundo nuevo sin tocar su layout.
        slate: {
          50: "#fbf9ee",
          100: "#f6f3e8",
          200: "#d8dedb",
          300: "#b8c6c8",
          400: "#8498a0",
          500: "#5a7480",
          600: "#3a5a69",
          700: "#284452",
          800: "#182d38",
          900: "#10202a",
          950: "#08131a",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 2px 0 rgba(0, 0, 0, 0.45), 0 10px 24px rgba(0, 0, 0, 0.28)",
        card: "0 3px 0 rgba(0, 0, 0, 0.5), 0 18px 36px rgba(0, 0, 0, 0.32)",
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
