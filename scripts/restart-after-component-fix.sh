#!/bin/bash

# Script to restart the Next.js development server after component fixes
# Usage: ./scripts/restart-after-component-fix.sh

echo "🧹 Cleaning Next.js cache..."

# Remove Next.js cache directories
rm -rf .next
rm -rf node_modules/.cache

# Clear browser localStorage (in instructions)
echo "⚠️ IMPORTANT: After restarting, please clear your browser's cache and localStorage"
echo "   - Open Dev Tools (F12)"
echo "   - Go to Application tab"
echo "   - Select 'Local Storage' and 'Cache' on the left"
echo "   - Right-click and clear both"

# Rebuild Prisma client
echo "🔄 Rebuilding Prisma client..."
pnpm prisma generate

# Restart dev server
echo "🚀 Starting development server..."
echo "   The marketplace should now load correctly with simplified components"
echo ""
echo "   Test the following routes:"
echo "   - Main marketplace: http://localhost:3000/marketplace"
echo "   - Builder profile: http://localhost:3000/marketplace/builders/{builder-id}"
echo ""
pnpm dev