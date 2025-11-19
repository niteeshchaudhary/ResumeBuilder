/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textShadow: {
        'white-glow': '0 0 5px rgba(255, 255, 255, 1)',
      }
    }
  },
  variants: {
    textShadow: ['responsive']
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-white-glow': {
          textShadow: '0 0 5px rgba(255, 255, 255, 1)',
        }
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ]
}
