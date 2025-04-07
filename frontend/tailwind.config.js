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
          50: '#E5F1FB',
          100: '#CCE3F7',
          200: '#99C7EF',
          300: '#66ABE7',
          400: '#338FDF',
          500: '#0078D4',
          600: '#0060AA',
          700: '#004880',
          800: '#003055',
          900: '#00182B',
        },
        neutral: {
          50: '#F3F2F1',
          100: '#E1DFDD',
          200: '#C8C6C4',
          300: '#979593',
          400: '#605E5C',
          500: '#323130',
          600: '#201F1E',
          700: '#161514',
          800: '#0B0A0A',
          900: '#000000',
        },
        success: {
          50: '#E6F2E6',
          100: '#CCE5CC',
          500: '#107C10',
        },
        warning: {
          50: '#F3F2F1',
          100: '#E1DFDD',
          500: '#797673',
        },
        error: {
          50: '#F9E9E9',
          100: '#F3D3D3',
          500: '#A4262C',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 