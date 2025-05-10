/// <reference types="vitest" />
import { defineConfig } from 'vitest'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      reportsDirectory: './test-results/coverage',
    },
    reporters: [
      'default',
      'json',
      {
        onInit() {
          // Ensure test-results directory exists
          const resultsDir = path.resolve(__dirname, 'test-results/reports')
          if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true })
          }
        },
        onFinished(results) {
          // Write test results to a file for Datadog processing
          const resultsPath = path.resolve(__dirname, 'test-results/reports/vitest-results.json')
          fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))
          console.log(`Test results written to ${resultsPath}`)
        }
      }
    ],
    outputFile: {
      json: './test-results/reports/vitest-results.json'
    },
    include: [
      '**/*.test.{ts,tsx}',
      '**/*.vitest.test.{ts,tsx}',
      '__tests__/**/*.test.{ts,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'test-utils': path.resolve(__dirname, './__tests__/utils/vitest-utils'),
    },
  },
})
