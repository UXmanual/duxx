/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--theme-bg)',
        'theme-text-primary': 'var(--theme-text-primary)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
        'theme-border': 'var(--theme-border)',
        'theme-card': 'var(--theme-card-bg)',
        'theme-accent': 'var(--theme-accent)',
        'theme-badge-bg': 'var(--theme-badge-bg)',
        'theme-badge-text': 'var(--theme-badge-text)',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
