/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // If you have a separate frontend folder, ensure the path is correct:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // You can define your brand colors here to avoid oklch issues
      colors: {
        purple: {
          900: '#1e1b4b', // Using standard Hex instead of oklch
        },
      },
    },
  },
  // If you want to force dark/light mode behavior:
  darkMode: 'class', 
  plugins: [],
}