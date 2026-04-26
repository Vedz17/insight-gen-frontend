import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      
    },
  },
  plugins: [
    require('@tailwindcss/typography'), 
  ],
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 🚀 YAHAN SE ADD KARNA HAI
      keyframes: {
        streak: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
      },
      animation: {
        streak: 'streak 2s ease-in-out infinite',
      },
      // 🚀 YAHAN TAK
    },
  },
  plugins: [],
};