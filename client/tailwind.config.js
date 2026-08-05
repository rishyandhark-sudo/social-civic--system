/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16242B',
        bg: '#F3F6F5',
        surface: '#FFFFFF',
        border: '#DDE5E3',
        primary: {
          DEFAULT: '#1F6F6B',
          dark: '#16504D',
          light: '#E4F0EF',
        },
        amber: {
          DEFAULT: '#B8712B',
          light: '#F5E8D8',
        },
        success: {
          DEFAULT: '#3D7A4B',
          light: '#E1EFE3',
        },
        danger: {
          DEFAULT: '#A83B3B',
          light: '#F5E1E1',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
