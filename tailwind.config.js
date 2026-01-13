/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        andreani: {
          red: '#DA291C',
          dark: '#1F1F1F',
          gray: '#F4F4F4'
        }
      }
    },
  },
  plugins: [],
}
