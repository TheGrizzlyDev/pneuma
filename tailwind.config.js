/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#19e65e",
        "background-light": "#f6f8f6",
        "background-dark": "#112116",
        "surface-dark": "#1a3222",
        "surface-highlight": "#244730",
        "text-secondary": "#93c8a5",
        "sage-light": "#dbece2",
        "sage-dark": "#244730",
        "text-main-light": "#112116",
        "text-main-dark": "#ffffff",
        "text-sub-light": "#4b6354",
        "text-sub-dark": "#93c8a5",
      },
      fontFamily: {
        "display": ["Lexend", "Noto Sans", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
