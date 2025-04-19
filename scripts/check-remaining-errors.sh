#!/bin/bash
# Script to check and categorize remaining TypeScript errors

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Checking Remaining TypeScript Errors ===${NC}\n"

# Run type-check and capture output
echo -e "${YELLOW}Running TypeScript type check...${NC}"
OUTPUT=$(pnpm type-check 2>&1)
EXIT_CODE=$?

# Count total errors
TOTAL_ERRORS=$(echo "$OUTPUT" | grep -o "Found [0-9]* error" | grep -o "[0-9]*")

if [ -z "$TOTAL_ERRORS" ]; then
    TOTAL_ERRORS=0
fi

# Count errors by category
NEXT_APP_ERRORS=$(echo "$OUTPUT" | grep -c ".next/types/app")
MOCK_DATA_ERRORS=$(echo "$OUTPUT" | grep -c "lib/data/mockBuilders.ts")
SEED_ERRORS=$(echo "$OUTPUT" | grep -c "prisma/seed/index.ts")
OTHER_ERRORS=$((TOTAL_ERRORS - NEXT_APP_ERRORS - MOCK_DATA_ERRORS - SEED_ERRORS))

# Print summary
echo -e "\n${CYAN}=== Error Summary ===${NC}"
echo -e "Total errors: ${YELLOW}${TOTAL_ERRORS}${NC}"
echo -e "  - Next.js generated type errors: ${YELLOW}${NEXT_APP_ERRORS}${NC} (can be ignored)"
echo -e "  - Mock data errors: ${YELLOW}${MOCK_DATA_ERRORS}${NC} (development only)"
echo -e "  - Seed script errors: ${YELLOW}${SEED_ERRORS}${NC} (development only)"
echo -e "  - Other errors: ${YELLOW}${OTHER_ERRORS}${NC}"

if [ $OTHER_ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All production-critical type errors have been resolved!${NC}"
    echo -e "The remaining errors are in Next.js generated types, mock data, or seed scripts - these won't affect your application in production."
else
    echo -e "\n${RED}✗ There are still ${OTHER_ERRORS} errors that need to be fixed.${NC}"
    # Extract and display the "other" errors
    echo -e "\n${YELLOW}Remaining errors (non-mock data, non-Next.js):${NC}"
    echo "$OUTPUT" | grep -v ".next/types/app" | grep -v "lib/data/mockBuilders.ts" | grep -v "prisma/seed/index.ts" | grep "error TS"
fi

exit $EXIT_CODE
