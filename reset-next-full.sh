#!/bin/bash
set -e

echo "===== Full Next.js Reset Script ====="
echo "This script completely resets the Next.js build environment."

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "next dev" || true

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Move Sentry configs temporarily (if not already moved)
if [ -f sentry.client.config.ts ]; then
  echo "Moving Sentry config files temporarily..."
  mv sentry.client.config.ts sentry.client.config.ts.disabled
  mv sentry.server.config.ts sentry.server.config.ts.disabled
  mv sentry.edge.config.ts sentry.edge.config.ts.disabled 2>/dev/null || true
fi

# Clear package-lock.json and node_modules as last resort if needed
# Uncomment these lines if you're still having issues
# echo "WARNING: Removing package-lock.json and node_modules (emergency fix)..."
# rm -rf node_modules
# rm -f package-lock.json
# npm install

echo "Starting dev server with all monitoring disabled..."
echo "If you still encounter issues, uncomment the emergency fix in this script"

# Start the dev server
NODE_OPTIONS="--max-old-space-size=4096" pnpm dev