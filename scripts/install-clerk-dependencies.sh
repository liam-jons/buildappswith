#!/bin/bash
# Install dependencies for Clerk authentication
# Version: 1.0.64

echo "Installing Clerk dependencies..."
echo "--------------------------------"

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    echo "Using pnpm to install dependencies"
    pnpm add svix
elif command -v npm &> /dev/null; then
    echo "Using npm to install dependencies"
    npm install svix
else
    echo "Error: Neither pnpm nor npm found. Please install manually:"
    echo "  pnpm add svix"
    echo "  or"
    echo "  npm install svix"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo "You can now build and deploy the application"
