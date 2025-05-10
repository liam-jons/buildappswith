#!/bin/bash

# Restart Development Server Script
# This script properly restarts the Next.js development server to fix JS chunk issues

# Print colored text
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping any running Next.js processes...${NC}"
# Find and kill any running Next.js processes
pkill -f "node.*next"

echo -e "${YELLOW}Clearing Next.js cache...${NC}"
# Remove the .next directory
rm -rf .next

echo -e "${YELLOW}Generating Prisma client...${NC}"
# Generate Prisma client
npx prisma generate

echo -e "${YELLOW}Starting development server...${NC}"
# Start the development server
npm run dev

# This line will only execute if the npm run dev command fails
echo -e "${YELLOW}Server failed to start. Please check for errors.${NC}"