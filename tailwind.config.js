/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Priority system
        urgent: {
          DEFAULT: '#ef4444', // Urgent + Important (red)
          light: '#fef2f2',
          dark: '#991b1b',
        },
        important: {
          DEFAULT: '#f97316', // Important + Not Urgent (orange)
          light: '#fff7ed',
          dark: '#9a3412',
        },
        notable: {
          DEFAULT: '#eab308', // Urgent + Not Important (yellow)
          light: '#fefce8',
          dark: '#713f12',
        },
        // Category colors
        academic:    '#6366f1', // indigo
        competition: '#f97316', // orange
        hackathon:   '#a855f7', // purple
        club:        '#22c55e', // green
        event:       '#06b6d4', // cyan
        workshop:    '#ec4899', // pink
        seminar:     '#14b8a6', // teal
        opportunity: '#f59e0b', // amber
        general:     '#6b7280', // gray
        // Surfaces (dark mode aware via CSS vars)
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-md': '0 4px 14px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-lg': '0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -3px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 24px -4px rgba(99, 102, 241, 0.35)',
        'glow-purple': '0 0 24px -4px rgba(168, 85, 247, 0.35)',
        'glow-red': '0 0 24px -4px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 24px -4px rgba(34, 197, 94, 0.35)',
        'glow-sky': '0 0 24px -4px rgba(14, 165, 233, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s infinite linear',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { transform: 'translateY(14px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideInRight: { from: { transform: 'translateX(20px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.65 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
