#!/bin/bash
# Auth Cleanup Script for Buildappswith
# Version 1.0.0
# This script removes legacy auth components after the NextAuth to Clerk migration

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Authentication System Cleanup (Phase 2)${NC}"
echo "This script will remove legacy authentication components"
echo

# Define array of files to be removed
AUTH_FILES=(
  "app/api/auth/[...nextauth]/route.ts"
  "components/auth/auth-provider.tsx"
  "lib/auth-utils.ts"
  "lib/auth/auth-utils.ts"
  "lib/auth/auth-config.ts"
  "components/auth/login-button.tsx"
  "components/auth/user-profile.tsx"
  "lib/auth/hooks.ts"
  "lib/contexts/auth/auth-provider.tsx"
)

# Create backup directory if it doesn't exist
BACKUP_DIR="archived/auth-cleanup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}Created backup directory: $BACKUP_DIR${NC}"

# Process each file
for FILE in "${AUTH_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Create directory structure in backup
    BACKUP_PATH="$BACKUP_DIR/$FILE"
    BACKUP_DIR_PATH=$(dirname "$BACKUP_PATH")
    mkdir -p "$BACKUP_DIR_PATH"
    
    # Copy file to backup
    cp "$FILE" "$BACKUP_PATH"
    echo -e "${GREEN}Backed up: $FILE${NC}"
    
    # Remove file
    rm "$FILE"
    echo -e "${GREEN}Removed: $FILE${NC}"
  else
    echo -e "${RED}File not found: $FILE${NC}"
  fi
done

echo
echo -e "${YELLOW}Authentication cleanup complete!${NC}"
echo -e "Backup created in: ${GREEN}$BACKUP_DIR${NC}"
echo 
echo "Next steps:"
echo "1. Verify that authentication still works correctly"
echo "2. Update version number in package.json"
echo "3. Commit changes with message: 'refactor: remove legacy auth components'"
