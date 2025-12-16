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
        // Primary colors (light mode by default, dark mode with -dark suffix)
        primary: {
          DEFAULT: 'var(--primary-light-bg)',
          bg: 'var(--primary-light-bg)',
          text: 'var(--primary-light-text)',
        },
        'primary-dark': {
          DEFAULT: 'var(--primary-dark-bg)',
          bg: 'var(--primary-dark-bg)',
          text: 'var(--primary-dark-text)',
        },
        // Secondary colors
        secondary: {
          DEFAULT: 'var(--secondary-light-bg)',
          bg: 'var(--secondary-light-bg)',
          text: 'var(--secondary-light-text)',
        },
        'secondary-dark': {
          DEFAULT: 'var(--secondary-dark-bg)',
          bg: 'var(--secondary-dark-bg)',
          text: 'var(--secondary-dark-text)',
        },
        // Legacy support
        cream: {
          DEFAULT: 'var(--cream)',
          light: '#FAFAF0',
          dark: '#E8E8D0',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          light: '#E5C158',
          dark: '#B8941F',
          text: 'var(--gold-text)',
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
