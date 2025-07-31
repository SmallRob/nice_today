/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        physical: '#3b82f6', // 蓝色
        emotional: '#ef4444', // 红色
        intellectual: '#10b981', // 绿色
      }
    },
  },
  plugins: [],
}