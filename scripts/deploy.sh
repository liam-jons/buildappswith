#!/bin/bash

# Buildappswith Deployment Script
# This script helps with the deployment process for the Buildappswith platform
# It installs required dependencies and updates configuration files

echo "Starting Buildappswith deployment process..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "Installing required dependencies..."
pnpm add @tailwindcss/postcss -D

echo "Updating PostCSS configuration for Tailwind CSS v4..."
cat > postcss.config.js << EOL
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
EOL

echo "Checking for conflicting PostCSS configurations..."
find . -path "./node_modules" -prune -o -name "postcss.config.*" -not -path "./postcss.config.js" -print

echo "Cleaning build artifacts..."
rm -rf .next

echo "Building application..."
pnpm build

echo "Deployment process completed!"
