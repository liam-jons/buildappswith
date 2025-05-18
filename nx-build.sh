#!/bin/bash

# This script runs the Nx build with proper environment setup

echo "Preparing for Nx build..."

# Step 1: Generate Prisma client first (critical)
echo "Generating Prisma client..."
pnpm prisma generate

# Step 2: Modify the build environment
echo "Setting up build environment..."
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=8192"

# Step 3: Run the Nx build with specific options
echo "Running Nx build..."
npx nx build buildappswith --verbose

echo "Build process complete."
