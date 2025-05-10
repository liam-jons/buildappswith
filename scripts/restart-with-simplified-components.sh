#!/bin/bash

# Script to restart the Next.js development server with simplified components
# Usage: ./scripts/restart-with-simplified-components.sh

echo "🧹 Cleaning Next.js cache..."

# Remove Next.js cache directories
rm -rf .next
rm -rf node_modules/.cache

# Clear browser localStorage (in instructions)
echo "⚠️ IMPORTANT: After restarting, please clear your browser's localStorage"
echo "   - Open Dev Tools (F12)"
echo "   - Go to Application tab"
echo "   - Select 'Local Storage' on the left"
echo "   - Right-click and select 'Clear'"

# Rebuild Prisma client
echo "🔄 Rebuilding Prisma client..."
pnpm prisma generate

# Restart dev server
echo "🚀 Starting development server..."
echo "   The marketplace should now load with the simplified builder image component"
pnpm dev