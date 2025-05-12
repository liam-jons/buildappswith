#!/bin/bash
set -e

echo "Resetting Next.js cache and restarting dev server..."

# Stop any running Next.js processes
pkill -f "next dev" || true

# Clear Next.js cache
rm -rf .next

# Clear node_modules/.cache
rm -rf node_modules/.cache

# Reinstall sentry/nextjs specifically
pnpm install @sentry/nextjs@latest

# Restart the development server
echo "Starting dev server..."
pnpm dev