/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: {
          DEFAULT: '#ebe8e2',
          dark: '#22262d',
        },
        surface: {
          DEFAULT: '#f4f2ec',
          dark: '#2a2f37',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#4d5663',
          700: '#373d47',
          800: '#30363f',
          900: '#272d35',
          950: '#22262d',
        },
      },
      backgroundColor: {
        'dark-primary': '#22262d',
        'dark-secondary': '#2a2f37',
        'dark-tertiary': '#30363f',
      },
      borderColor: {
        'dark-primary': '#373d47',
        'dark-secondary': '#4d5663',
      },
      textColor: {
        'dark-primary': '#f8fafc',
        'dark-secondary': '#e2e8f0',
        'dark-tertiary': '#cbd5e1',
      },
    },
  },
  plugins: [],
};
