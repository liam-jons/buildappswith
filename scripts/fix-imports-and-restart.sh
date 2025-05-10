#!/bin/bash

# Script to fix UI imports, rebuild, and restart
# Usage: ./scripts/fix-imports-and-restart.sh

echo "📝 Running UI import path fixer..."
node ./scripts/fix-ui-core-imports.js

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "⚠️ IMPORTANT: After restarting, please clear your browser's cache and localStorage"
echo "   - Open Dev Tools (F12)"
echo "   - Go to Application tab"
echo "   - Select 'Local Storage' and 'Cache' on the left"
echo "   - Right-click and clear both"

echo "🔄 Rebuilding Prisma client..."
pnpm prisma generate

echo "🚀 Starting development server..."
echo "   The marketplace should now load correctly with fixed imports"
echo ""
echo "   Test the following routes:"
echo "   - Main marketplace: http://localhost:3000/marketplace"
echo "   - Builder profile: http://localhost:3000/marketplace/builders/{builder-id}"
echo ""
pnpm dev