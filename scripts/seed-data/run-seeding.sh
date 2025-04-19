#!/bin/bash

# Script to run the database seeding 

echo "Starting database seeding process..."

# Check if tsconfig-paths is installed, if not install it
if ! pnpm list | grep -q tsconfig-paths; then
  echo "Installing tsconfig-paths..."
  pnpm add -D tsconfig-paths
fi

# Run the TypeScript file with ts-node and tsconfig-paths to resolve path aliases
npx ts-node -r tsconfig-paths/register -P tsconfig.json scripts/seed-data/create-profiles.ts

echo "Seed script execution completed"
