/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#0F0F1A',
          card: '#13131F',
          hover: '#1A1A2E',
          border: '#1E1E30',
        },
        accent: {
          primary: '#6C63FF',
          secondary: '#4ECDC4',
          danger: '#FF6B6B',
          warn: '#FFD93D',
          success: '#6BCB77',
        },
        text: {
          primary: '#F0F0FF',
          secondary: '#8888AA',
          muted: '#44445A',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(108, 99, 255, 0.3)',
        'glow-sm': '0 0 10px rgba(108, 99, 255, 0.2)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}
