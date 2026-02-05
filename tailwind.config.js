/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#11A32B',
          light: 'rgba(17, 163, 43, 0.2)',
          lighter: 'rgba(17, 163, 43, 0.08)',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          dark: '#9333EA',
          light: 'rgba(124, 58, 237, 0.2)',
          lighter: 'rgba(124, 58, 237, 0.08)',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        background: {
          DEFAULT: '#F9FAFB',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      borderRadius: {
        DEFAULT: '12px',
      },
      boxShadow: {
        'green': '0 4px 20px rgba(17, 163, 43, 0.3)',
        'purple': '0 4px 20px rgba(124, 58, 237, 0.3)',
      },
    },
  },
  plugins: [],
}
