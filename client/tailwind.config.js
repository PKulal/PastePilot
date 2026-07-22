export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#081425',
        surface: '#081425',
        'surface-bright': '#2f3a4c',
        primary: '#c9c6c5',
        secondary: '#ddfcff',
        obsidian: '#0a0a0a',
        cyan: '#00f2ff',
        slate: '#1e293b'
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
