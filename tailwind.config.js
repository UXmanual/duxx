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
        'theme-text': 'var(--theme-text-primary)',
        'theme-text-muted': 'var(--theme-text-secondary)',
        'theme-border': 'var(--theme-border)',
        'theme-card': 'var(--theme-card-bg)',
        'theme-accent': 'var(--theme-accent)',
        premium: {
          dark: '#0f172a',
          gold: '#fbbf24',
          accent: '#6366f1'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
