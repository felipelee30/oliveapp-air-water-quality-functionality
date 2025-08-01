/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        glass: {
          white: {
            5: 'rgba(255, 255, 255, 0.05)',
            8: 'rgba(255, 255, 255, 0.08)',
            10: 'rgba(255, 255, 255, 0.1)',
            15: 'rgba(255, 255, 255, 0.15)',
            20: 'rgba(255, 255, 255, 0.2)',
            25: 'rgba(255, 255, 255, 0.25)',
            30: 'rgba(255, 255, 255, 0.3)',
            40: 'rgba(255, 255, 255, 0.4)',
            50: 'rgba(255, 255, 255, 0.5)',
          },
          dark: {
            5: 'rgba(0, 0, 0, 0.05)',
            8: 'rgba(0, 0, 0, 0.08)',
            10: 'rgba(0, 0, 0, 0.1)',
            15: 'rgba(0, 0, 0, 0.15)',
            20: 'rgba(0, 0, 0, 0.2)',
            30: 'rgba(0, 0, 0, 0.3)',
            40: 'rgba(0, 0, 0, 0.4)',
            50: 'rgba(0, 0, 0, 0.5)',
          },
          border: 'rgba(255, 255, 255, 0.15)',
          borderDark: 'rgba(0, 0, 0, 0.08)',
        },
        quality: {
          excellent: '#10B981',
          good: '#3B82F6',
          fair: '#F59E0B',
          poor: '#F97316',
          bad: '#EF4444',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}