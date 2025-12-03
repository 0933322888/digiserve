/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)', // Dynamic
          dark: '#6B0000', // TODO: Calculate dynamic dark variant
          light: '#A00000', // TODO: Calculate dynamic light variant
        },
        cream: {
          DEFAULT: 'var(--cream)', // Dynamic
          light: '#FAFAF0',
          dark: '#E8E8D0',
        },
        gold: {
          DEFAULT: 'var(--gold)', // Dynamic
          light: '#E5C158',
          dark: '#B8941F',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
