#!/bin/bash

# Complete Next.js Reset Script
# This script performs a thorough reset of the Next.js environment

# Print colored text
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Performing complete Next.js reset...${NC}"

# Step 1: Kill all Node processes (more aggressive than just Next.js)
echo -e "${YELLOW}Stopping all Node processes...${NC}"
pkill -f node || true

# Step 2: Clear all caches
echo -e "${YELLOW}Clearing all caches...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# Step 3: Reset Next.js environment
echo -e "${YELLOW}Resetting Next.js environment...${NC}"
touch next.config.mjs

# Step 4: Check package.json for potential issues
echo -e "${YELLOW}Checking package.json for issues...${NC}"
if grep -q "\"next\": " package.json; then
  NEXT_VERSION=$(grep -o "\"next\": \"[^\"]*\"" package.json | cut -d'"' -f4)
  echo -e "${GREEN}Next.js version: ${NEXT_VERSION}${NC}"
else
  echo -e "${RED}Next.js dependency not found in package.json!${NC}"
fi

# Step 5: Force reinstall of Next.js
echo -e "${YELLOW}Reinstalling Next.js dependencies...${NC}"
pnpm install next@latest --no-frozen-lockfile

# Step 6: Rebuild the application in non-turbo mode
echo -e "${YELLOW}Building application in standard mode...${NC}"
NODE_OPTIONS="--max-old-space-size=4096" npx next build

# Step 7: Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

# Step 8: Clear browser cache instructions
echo -e "${RED}IMPORTANT: Please also clear your browser cache!${NC}"
echo -e "${YELLOW}In Chrome/Safari: Use Shift+Cmd+R (Mac) or Shift+Ctrl+R (Windows)${NC}"
echo -e "${YELLOW}Or open dev tools and disable cache in the Network tab${NC}"

# Step 9: Start server in non-turbo mode
echo -e "${YELLOW}Starting development server in standard mode...${NC}"
NODE_OPTIONS="--max-old-space-size=4096" npx next dev --no-turbo

echo -e "${YELLOW}Reset completed.${NC}"