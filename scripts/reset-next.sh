#!/bin/bash

# Script to reset Next.js cache and restart development server
# Usage: ./scripts/reset-next.sh

echo "🧹 Cleaning Next.js cache..."

# Remove Next.js cache directories
rm -rf .next
rm -rf node_modules/.cache

# Clean npm cache (optional)
echo "🧹 Cleaning npm cache..."
pnpm cache clean

# Reinstall dependencies (optional)
echo "📦 Reinstalling dependencies..."
pnpm install

# Rebuild Prisma client
echo "🔄 Rebuilding Prisma client..."
pnpm prisma generate

# Restart dev server
echo "🚀 Starting development server..."
pnpm dev