#!/bin/bash

# Fix Tailwind CSS v3 Configuration
# This script ensures correct configuration for Tailwind CSS v3.4.17

echo "Starting Tailwind CSS v3 configuration fix..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "Ensuring correct Tailwind version is installed..."
pnpm remove tailwindcss @tailwindcss/postcss
pnpm add tailwindcss@3.4.17 -D

echo "Updating PostCSS configuration..."
cat > postcss.config.js << EOL
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOL

echo "Updating Tailwind configuration imports..."
# Check if fontFamily import is missing and add it if needed
if ! grep -q "import { fontFamily } from \"tailwindcss/defaultTheme\";" tailwind.config.ts; then
  sed -i.bak '1s/^/import { fontFamily } from "tailwindcss\/defaultTheme";\n/' tailwind.config.ts
  rm tailwind.config.ts.bak
fi

# Update font family configuration
sed -i.bak 's/sans: \["var(--font-sans)", "sans-serif"\]/sans: \["var(--font-sans)", ...fontFamily.sans\]/' tailwind.config.ts
rm tailwind.config.ts.bak

echo "Cleaning build artifacts..."
rm -rf .next

echo "Configuration fixed successfully!"
echo "You can now run 'pnpm dev' to start the development server."
