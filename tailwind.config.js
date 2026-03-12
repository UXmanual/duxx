/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--theme-bg)',
        'theme-text': {
          primary: 'var(--theme-text-primary)',
          secondary: 'var(--theme-text-secondary)',
        },
        'theme-border': 'var(--theme-border)',
        'theme-card': 'var(--theme-card-bg)',
        'theme-accent': 'var(--theme-accent)',
        'theme-badge': {
          bg: 'var(--theme-badge-bg)',
          text: 'var(--theme-badge-text)',
        },
        'theme-scrollbar': {
          track: 'var(--theme-scrollbar-track)',
          thumb: 'var(--theme-scrollbar-thumb)',
          'thumb-hover': 'var(--theme-scrollbar-thumb-hover)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
