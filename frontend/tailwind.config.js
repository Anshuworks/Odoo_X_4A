/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c0d0ff',
          300: '#93aaff',
          400: '#6080ff',
          500: '#3d5aff',
          600: '#2636f5',
          700: '#1e28e1',
          800: '#1e23b6',
          900: '#1e238f',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 4px 16px -2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(0,0,0,0.1)',
        'modal': '0 20px 60px -10px rgba(0,0,0,0.25)',
      }
    },
  },
  plugins: [],
}
