/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 클래스 기반 다크모드 활성화
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
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
