// vitest.config.js - CommonJS format
const { defineConfig } = require('vitest/config')
const react = require('@vitejs/plugin-react')
const path = require('path')

module.exports = defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-results/coverage'
    },
    outputFile: {
      json: './test-results/reports/vitest-results.json'
    },
    reporters: ['default', 'json'],
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
