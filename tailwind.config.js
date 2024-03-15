/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.tsx", "index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        "mainBackgroudColor": '#0D1117',
        "columnBackgroundColor": '#161C22'
      }
    },
  },
  plugins: [],
}

