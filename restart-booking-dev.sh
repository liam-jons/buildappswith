#!/bin/bash

# Kill any running Next.js dev server
echo "Stopping current Next.js dev server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Restart the dev server
echo "Starting Next.js dev server..."
pnpm dev