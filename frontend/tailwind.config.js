/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        bg: {
          base:    '#0f0f13',
          surface: '#18181f',
          card:    '#1e1e2a',
          border:  '#2a2a3a',
          hover:   '#252535',
        },
        content: {
          primary:   '#f0f0ff',
          secondary: '#a0a0c0',
          muted:     '#60607a',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        head:  ['Outfit', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow:        '0 0 20px rgba(99,102,241,0.18)',
        'glow-lg':   '0 0 40px rgba(99,102,241,0.25)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.18)',
        card:        '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
