import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { uetDevPlugin } from '../../scripts/uet-dev';

export default defineConfig({
  base: '/demos/smart-classroom/',
  plugins: [react(), uetDevPlugin()],
});
