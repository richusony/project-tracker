/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        canvas:      'rgb(var(--canvas) / <alpha-value>)',
        surface:     'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--surface-3) / <alpha-value>)',
        stroke:      'rgb(var(--stroke) / <alpha-value>)',
        'stroke-2':  'rgb(var(--stroke-2) / <alpha-value>)',
        ink:         'rgb(var(--ink) / <alpha-value>)',
        'ink-2':     'rgb(var(--ink-2) / <alpha-value>)',
        'ink-3':     'rgb(var(--ink-3) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(0 0 0 / 0.06)',
        'sm':    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'md':    '0 4px 8px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'lg':    '0 12px 24px -4px rgb(0 0 0 / 0.12), 0 4px 8px -2px rgb(0 0 0 / 0.06)',
        'xl':    '0 24px 48px -8px rgb(0 0 0 / 0.18)',
        'glow':  '0 0 0 3px rgb(14 165 233 / 0.2)',
        'modal': '0 32px 64px -16px rgb(0 0 0 / 0.45)',
        'card':  '0 1px 4px 0 rgb(0 0 0 / 0.08)',
      },
      animation: {
        'fade-in':   'fadeIn 0.15s ease-out',
        'slide-up':  'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':  'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
