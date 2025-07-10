/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF6347', // Tomato
        secondary: '#4682B4', // SteelBlue
        accent: '#3CB371', // MediumSeaGreen
        dark: '#2F4F4F', // DarkSlateGray
        light: '#F5F5DC', // Beige
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}

