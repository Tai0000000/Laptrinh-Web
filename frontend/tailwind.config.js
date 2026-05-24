/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 80px rgba(15, 23, 42, 0.18)',
      },
      backgroundImage: {
        'radial-soft': 'radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 42%)',
      },
    },
  },
  plugins: [],
};