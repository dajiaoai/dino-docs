import { readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

// Demo HTML bypasses the VitePress head. Serve the same UET asset locally.
export function uetDevPlugin() {
  return {
    name: 'dino-uet-dev',
    apply: 'serve' as const,
    transformIndexHtml() {
      if (process.env.DINO_UET_DEV !== '1') return;
      return [{ tag: 'script', attrs: { defer: true, src: '/microsoft-uet.js' }, injectTo: 'head' as const }];
    },
    configureServer(server: { middlewares: { use: (handler: Middleware) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (process.env.DINO_UET_DEV !== '1' || req.url?.split('?')[0] !== '/microsoft-uet.js') return next();
        res.setHeader('Content-Type', 'application/javascript');
        res.end(readFileSync(new URL('../docs/public/microsoft-uet.js', import.meta.url), 'utf8'));
      });
    },
  };
}
