import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: [
      '**/*.test.{ts,tsx}',
      '**/*.vitest.test.{ts,tsx}',
      '__tests__/**/*.test.{ts,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/libs/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  }
});
