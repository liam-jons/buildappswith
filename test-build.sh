#!/bin/bash

# Test Build Script for Buildappswith
# This script tests the build process after fixing the Tailwind CSS configuration

echo "Starting test build process..."

# Install @tailwindcss/postcss
echo "Installing @tailwindcss/postcss..."
pnpm add @tailwindcss/postcss -D

# Update PostCSS configuration
echo "Updating PostCSS configuration..."
cat > postcss.config.js << EOL
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
EOL

# Clean build artifacts
echo "Cleaning build artifacts..."
rm -rf .next

# Build the application
echo "Building application..."
pnpm build

# Check build status
if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
else
  echo "Build failed! Please check the error messages above."
  exit 1
fi

echo "Test build completed!"
