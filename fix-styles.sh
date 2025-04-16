#!/bin/bash

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "next"

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Clear node_modules/.cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Rebuild the project
echo "Rebuilding the project..."
pnpm install

echo "Starting development server..."
pnpm run dev
