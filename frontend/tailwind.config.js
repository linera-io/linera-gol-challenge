import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Epilogue', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Hanken Grotesk', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        linera: {
          primary: '#DE2A02',
          'primary-dark': '#B02102',
          'primary-light': '#FF3D0A',
          'primary-lighter': '#FF6B3D',
          background: '#0F1419',
          'background-light': '#1A1F27',
          'background-lighter': '#252C37',
          text: '#FFFFFF',
          'text-muted': '#9CA3AF',
        }
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          primary: {
            DEFAULT: '#DE2A02',
            foreground: '#FFFFFF',
          },
          background: '#0F1419',
          foreground: '#FFFFFF',
        }
      }
    }
  })],
}