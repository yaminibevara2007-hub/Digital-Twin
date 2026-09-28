/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F7F8FA',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          borderLight: '#F1F5F9',
          text: '#172033',
          muted: '#64748B',
          navy: '#183B56',
          navyDark: '#102A3E',
          secondaryNavy: '#315A75',
          softBlue: '#EAF3F8',
          blue: '#3B82A0',
          softGreen: '#EAF6EF',
          green: '#3D8B68',
          softAmber: '#FFF6DF',
          amber: '#B7791F',
          softRed: '#FDECEC',
          red: '#C94A4A',
          steam: '#D9824B',
          softSteam: '#FDF2E9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      }
    },
  },
  plugins: [],
}
