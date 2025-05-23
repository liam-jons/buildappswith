// vitest.config.mjs - ESM format
import { defineConfig } from 'vitest'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

// Convert __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['**/*.test.{ts,tsx}', '**/*.vitest.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'test-utils': path.resolve(__dirname, './__tests__/utils/vitest-utils'),
    },
  },
})
