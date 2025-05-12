#!/bin/bash
set -e

echo "Cleaning Next.js cache and node_modules/.cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "Starting dev server..."
pnpm dev