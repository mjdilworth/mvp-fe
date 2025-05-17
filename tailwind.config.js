// tailwind.config.js (ESM version)
export default {
  content: [
    './out/**/*.html',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        goldtone: '#bfa93a',
      },
    },
  },
  plugins: [],
};
