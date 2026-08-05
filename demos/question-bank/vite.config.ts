import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/demos/question-bank/',
  plugins: [react()],
  server: {
    proxy: {
      '/dl-proxy': {
        target: 'https://dl.easeplay.vip',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dl-proxy/, ''),
      },
    },
  },
});
