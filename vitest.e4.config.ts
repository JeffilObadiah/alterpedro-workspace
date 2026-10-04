import { defineConfig } from 'vitest/config';
// E4 runs spend real money (DeepSeek). Never part of `npm test`. Run with: npm run e4:smoke / npm run e4
export default defineConfig({ test: { include: ['tests/e4/*.run.ts'], environment: 'node', testTimeout: 3_600_000, hookTimeout: 60_000, onConsoleLog: () => false } });
