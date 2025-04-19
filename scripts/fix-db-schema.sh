#!/bin/bash
# Fix database schema and Prisma types
# This script runs the fix-prisma-types.js script to update the database schema and fix type issues

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Buildappswith DB Schema Fix Tool ===${NC}\n"

# Make sure the script is executable
chmod +x ./scripts/fix-prisma-types.js

# Run the fix script
echo -e "${YELLOW}Running fix-prisma-types.js...${NC}"
node ./scripts/fix-prisma-types.js

# Check if the script was successful
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Database schema update completed successfully!${NC}"
    echo -e "\nYou can now verify the changes by running:"
    echo -e "  ${CYAN}pnpm type-check${NC}"
else
    echo -e "\n${RED}✗ Database schema update failed. See error messages above.${NC}"
fi
