/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Keep this as it is
  ],
  darkMode: 'class', // Enable dark mode using the "class" strategy
  theme: {
    extend: {
      colors: {
        darkBlue: '#1E3A8A', // Custom dark blue color for dark mode
        lightBlue: '#3B82F6', // Custom light blue for hover effects
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};
