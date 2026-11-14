/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CitizenQueue Brand Palette
        cqNavy: {
          50: '#f0f5fa',
          100: '#e1ebf5',
          200: '#c5d8ec',
          300: '#9bbfe0',
          400: '#6aa0d1',
          500: '#4683c0',
          600: '#3168a6',
          700: '#285387',
          800: '#1d3e65',
          900: '#0f2744',
          950: '#0a192c', // Primary deep navy
        },
        cqTeal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Accent teal
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
