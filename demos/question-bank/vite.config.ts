import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { uetDevPlugin } from '../../scripts/uet-dev';

export default defineConfig({
  base: '/demos/question-bank/',
  plugins: [react(), uetDevPlugin()],
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
