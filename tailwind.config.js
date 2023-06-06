/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // primary: '#ffaa00', // Deus Ex Gold
        primary: '#00fe49', // Stasia Green.
        secondary: '#090909',
        tertiary: '#131517',
        quaternary: '#0e0e0e'
      },
    },
  },
  plugins: [],
}