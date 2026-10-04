import { defineConfig } from 'astro/config';

// Static output only. The single Worker route (/api/scan/turn) lives in src/worker.ts, wired in wrangler.jsonc.
export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
