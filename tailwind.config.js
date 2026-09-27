/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#0b1320', // deep control room background
          900: '#111c2e', // panel surface
          850: '#16233b', // active element / card surface
          800: '#1c2c47', // border / secondary surface
          700: '#2b3f63', // highlight border
          600: '#405782', // muted text / icon
          500: '#5c75a3', // secondary labels
          400: '#8ba2c7', // primary labels
          300: '#b8cbe6', // high emphasis text
          200: '#dce5f2', // off-white
          100: '#f0f4fa', // crisp readout
        },
        petro: {
          orange: '#d97736', // thermal / steam injection
          orangeMuted: '#9a5323',
          green: '#22c55e', // healthy normal
          greenMuted: '#166534',
          amber: '#f59e0b', // warning / watch
          amberMuted: '#78350f',
          red: '#ef4444', // critical alarm
          redMuted: '#7f1d1d',
          blue: '#38bdf8', // pressure / fluid
          blueDark: '#0284c7',
          steel: '#64748b', // mechanical / SRP
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
