/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    container: false,   // ← 生成停止
    // preflight: false, // ←（任意）リセットも消す
  },
  theme: { extend: {} },
  plugins: [],
};