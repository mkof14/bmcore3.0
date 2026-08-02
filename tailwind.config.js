/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: {
          DEFAULT: '#ebe8e2',
          dark: '#16191e',
        },
        surface: {
          DEFAULT: '#f4f2ec',
          dark: '#1e232b',
        },
        dark: {
          50: '#f3f4f6',
          100: '#e5e7eb',
          200: '#c8ced8',
          300: '#9aa3b2',
          400: '#6b7280',
          500: '#4b5563',
          600: '#3a424e',
          700: '#282e38',
          800: '#1e232b',
          900: '#1a1e25',
          950: '#16191e',
        },
      },
      backgroundColor: {
        'dark-primary': '#16191e',
        'dark-secondary': '#1e232b',
        'dark-tertiary': '#282e38',
      },
      borderColor: {
        'dark-primary': '#3a424e',
        'dark-secondary': '#4a5260',
      },
      textColor: {
        'dark-primary': '#f3f4f6',
        'dark-secondary': '#c8ced8',
        'dark-tertiary': '#9aa3b2',
      },
    },
  },
  plugins: [],
};
