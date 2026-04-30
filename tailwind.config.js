/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        journal: {
          bg: '#fcf9f4',
          card: '#ffffff',
          text: '#2f3e46',
          muted: '#6b705c',
          accent: '#8cb67a', // Positive/Green
          error: '#d57a66', // Negative/Red-Orange
          neutral: '#a3a3a3',
          yellow: '#d4a373',
          purple: '#b79ced',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
        '6xl': '4rem',
      }
    },
  },
  plugins: [],
}
