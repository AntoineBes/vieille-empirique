import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["DM Mono", "Menlo", "monospace"],
      },
      colors: {
        ink: {
          50: "#f7f7f5",
          100: "#eeede8",
          200: "#d9d6ce",
          300: "#c0bba9",
          400: "#a49d84",
          500: "#8d856b",
          600: "#756c56",
          700: "#5e5647",
          800: "#4e483c",
          900: "#403c33",
          950: "#2a2720",
        },
        accent: {
          droit: "#4A6FA5",
          economie: "#C17B5C",
          politique: "#7B5EA7",
          europe: "#D4A843",
          societe: "#5C8A6B",
        },
      },
      maxWidth: {
        content: "44rem",
        wide: "72rem",
      },
      fontSize: {
        "display": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.15", fontWeight: "700" }],
        "heading": ["clamp(1.25rem, 2.5vw, 1.75rem)", { lineHeight: "1.3", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};

export default config;
