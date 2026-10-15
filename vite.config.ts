import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署时，base 需要设成仓库名。
// 若部署到 https://<user>.github.io/fitness-tracker/ ，就用 '/fitness-tracker/'。
// 用环境变量可覆盖：VITE_BASE=/xxx/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE ?? '/fitness-tracker/',
  plugins: [react()],
});
