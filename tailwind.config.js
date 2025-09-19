/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-save': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'toast-enter': 'toast-enter 0.3s ease-out',
        'toast-exit': 'toast-exit 0.2s ease-in forwards',
      },
      keyframes: {
        'toast-enter': {
          '0%': { transform: 'translateY(-1rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-exit': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-1rem)', opacity: '0' },
        },
      },
    },
  },
}
