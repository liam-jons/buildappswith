#!/bin/bash
# Architecture Extraction Installation Script for Buildappswith (Revised)
# Version: 1.0.6

set -e

echo "Installing architecture extraction tools for Buildappswith..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Please install pnpm before running this script."
    echo "You can install it with: npm install -g pnpm"
    exit 1
fi

# Get current pnpm version
PNPM_VERSION=$(pnpm --version)
echo "Detected pnpm version: $PNPM_VERSION"

# Create extraction directories
echo "Creating necessary directories..."
mkdir -p ./docs/architecture/extraction
mkdir -p ./docs/architecture/structurizr

# Define script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

# Create a proper package.json in the scripts directory
echo "Creating package.json for local dependencies..."
cat > "$SCRIPT_DIR/package.json" << EOF
{
  "name": "architecture-extraction-tools",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "ts-morph": "25.0.1",
    "dependency-cruiser": "16.10.1",
    "@types/node": "22.14.1",
    "ts-node": "10.9.2",
    "typescript": "5.8.3"
  }
}
EOF

# Create a dedicated tsconfig.architecture.json if it doesn't exist
if [ ! -f "$SCRIPT_DIR/tsconfig.architecture.json" ]; then
    echo "Creating tsconfig.architecture.json for architecture extraction..."
    cat > "$SCRIPT_DIR/tsconfig.architecture.json" << EOF
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "target": "ES2020",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "../dist/architecture",
    "rootDir": "./"
  },
  "include": [
    "./**/*.ts",
    "../types/**/*.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOF
fi

# Install dependencies in the scripts directory
echo "Installing dependencies using pnpm..."
(cd "$SCRIPT_DIR" && pnpm install)

# Verify ts-node was installed
if [ -f "$SCRIPT_DIR/node_modules/.bin/ts-node" ]; then
    echo "ts-node installed successfully at $SCRIPT_DIR/node_modules/.bin/ts-node"
else
    echo "Warning: ts-node not found in expected location."
    echo "Searching for ts-node installation..."
    find "$SCRIPT_DIR/node_modules" -name "ts-node" -type f -o -type d | grep -v "node_modules/.bin"
fi

echo "Architecture extraction tools installation complete!"
echo "You can now run the architecture extraction scripts:"
echo "  - pnpm arch:extract      # General architecture extraction"
echo "  - pnpm arch:extract:auth # Authentication-specific extraction"
echo "  - pnpm arch:extract:all  # Run all extraction scripts"
echo "  - pnpm arch:report       # Generate comprehensive report"
echo "  - pnpm arch:combined     # Run extraction and generate report"