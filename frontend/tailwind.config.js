/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 添加这行来启用基于class的暗黑模式
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