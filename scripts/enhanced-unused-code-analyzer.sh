#!/bin/bash
#
# Enhanced Unused Code Analyzer
# Version: 2.1
#
# This script analyzes the codebase for unused code with improved detection
# It combines multiple tools: ts-prune for exports and dependency-cruiser for imports

# Set script to exit on error
set -e

# Create output directory if it doesn't exist
mkdir -p ./analysis-results

echo "🔍 Starting enhanced unused code analysis..."

# Check for flags
FIX_MODE=false
VERBOSE_MODE=false
SKIP_DUPLICATION=false

for arg in "$@"; do
  if [ "$arg" == "--fix" ]; then
    FIX_MODE=true
  fi
  if [ "$arg" == "--verbose" ]; then
    VERBOSE_MODE=true
  fi
  if [ "$arg" == "--skip-duplication" ]; then
    SKIP_DUPLICATION=true
  fi
done

# Define exclusion patterns for meaningful analysis
EXCLUSION_PATTERNS="prisma/migrations|prisma/backups|.nx/cache|out/.nx-helpers|node_modules"

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Run ts-prune to find unused exports 
echo -e "${BLUE}Step 1: Analyzing unused exports with ts-prune${NC}"
npx ts-prune -p tsconfig.json | grep -v -E "$EXCLUSION_PATTERNS" > ./analysis-results/unused-exports.txt

# Count unused exports
UNUSED_EXPORTS=$(cat ./analysis-results/unused-exports.txt | grep -v "used in module" | grep -v "No output" | wc -l)
echo -e "${YELLOW}Found ${UNUSED_EXPORTS} potentially unused exports${NC}"

# Step 2: Run dependency cruiser for more detailed analysis
echo -e "${BLUE}Step 2: Running dependency analysis with dependency-cruiser${NC}"

# Check if dependency-cruiser config exists, if not create a basic one
if [ ! -f ./.dependency-cruiser.js ]; then
  echo "Creating dependency-cruiser config..."
  npx depcruise --init
fi

# Run dependency analysis with the new config
npx depcruise --output-type dot --exclude="node_modules" --output-to ./analysis-results/dependency-graph.dot .

# Check if dot (graphviz) is installed
if command -v dot &> /dev/null; then
  echo "Generating SVG visualization with graphviz..."
  dot -Tsvg ./analysis-results/dependency-graph.dot -o ./analysis-results/dependency-graph.svg
else
  echo -e "${YELLOW}Warning: graphviz not installed. Skipping SVG generation.${NC}"
  echo -e "${YELLOW}To install: brew install graphviz${NC}"
  echo "Dependency graph saved as DOT file in ./analysis-results/dependency-graph.dot"
fi

# Step 3: Check for code duplication with more precise filtering
if [ "$SKIP_DUPLICATION" = false ]; then
  echo -e "${BLUE}Step 3: Checking for code duplication${NC}"
  
  # Use jscpd with improved ignore patterns
  npx jscpd . \
    --ignore "node_modules/**,**/*.json,**/*.md,**/*.svg,**/*.yml,**/*.yaml,**/*.lock,out/**,.nx/**,.next/**,prisma/migrations/**,prisma/backups/**" \
    --reporters "html,console" \
    --output ./analysis-results/duplication \
    --mode "mild" \
    --min-lines 5 \
    --min-tokens 50 \
    --format "typescript,javascript,tsx,jsx,css,scss" > ./analysis-results/duplication-report.txt
  
  # Generate a categorized duplication report focusing on application code
  echo -e "${BLUE}Analyzing meaningful code duplications...${NC}"
  
  echo "# Code Duplication Analysis" > ./analysis-results/duplication-summary.md
  echo "Date: $(date)" >> ./analysis-results/duplication-summary.md
  echo "" >> ./analysis-results/duplication-summary.md
  
  echo "## High-Priority Duplications (Application Code)" >> ./analysis-results/duplication-summary.md
  echo "These duplications are in core application code and should be addressed:" >> ./analysis-results/duplication-summary.md
  echo "" >> ./analysis-results/duplication-summary.md
  
  # Extract app and lib duplications
  cat ./analysis-results/duplication-report.txt | grep -E "lib/|app/" | grep -v -E "$EXCLUSION_PATTERNS" >> ./analysis-results/duplication-summary.md
  
  echo "" >> ./analysis-results/duplication-summary.md
  echo "## Lower-Priority Duplications" >> ./analysis-results/duplication-summary.md
  echo "These duplications are in infrastructure code or expected patterns:" >> ./analysis-results/duplication-summary.md
  echo "" >> ./analysis-results/duplication-summary.md
  
  # Extract other duplications
  cat ./analysis-results/duplication-report.txt | grep -v -E "lib/|app/" | grep -v -E "$EXCLUSION_PATTERNS" >> ./analysis-results/duplication-summary.md
fi

# Step 4: Run Nx specific analysis
echo -e "${BLUE}Step 4: Running Nx dependency analysis${NC}"
npx nx graph --file=./analysis-results/nx-dependency-graph.html

# Step 5: Generate a summary report
echo -e "${BLUE}Step 5: Generating summary report${NC}"

echo "# Code Analysis Summary" > ./analysis-results/analysis-summary.md
echo "Date: $(date)" >> ./analysis-results/analysis-summary.md
echo "" >> ./analysis-results/analysis-summary.md

echo "## Unused Exports" >> ./analysis-results/analysis-summary.md
echo "Total potentially unused exports: ${UNUSED_EXPORTS}" >> ./analysis-results/analysis-summary.md
echo "" >> ./analysis-results/analysis-summary.md
echo "See [unused-exports.txt](./unused-exports.txt) for details." >> ./analysis-results/analysis-summary.md
echo "" >> ./analysis-results/analysis-summary.md

echo "## Dependency Analysis" >> ./analysis-results/analysis-summary.md
echo "See [dependency-graph.svg](./dependency-graph.svg) for visualization." >> ./analysis-results/analysis-summary.md
echo "See [nx-dependency-graph.html](./nx-dependency-graph.html) for Nx project dependencies." >> ./analysis-results/analysis-summary.md
echo "" >> ./analysis-results/analysis-summary.md

if [ "$SKIP_DUPLICATION" = false ]; then
  echo "## Code Duplication" >> ./analysis-results/analysis-summary.md
  echo "See [duplication-summary.md](./duplication-summary.md) for categorized duplications." >> ./analysis-results/analysis-summary.md
  echo "See [duplication/index.html](./duplication/index.html) for detailed visualization." >> ./analysis-results/analysis-summary.md
fi

# Step 6: Analyze Nx workspace structure
echo -e "${BLUE}Step 6: Analyzing Nx workspace structure${NC}"
npx nx report > ./analysis-results/nx-workspace-report.txt

if [ "$VERBOSE_MODE" = true ]; then
  echo -e "${GREEN}=== Full analysis results ===${NC}"
  echo -e "${YELLOW}Top 10 potentially unused exports:${NC}"
  head -n 10 ./analysis-results/unused-exports.txt
  
  if [ "$SKIP_DUPLICATION" = false ]; then
    echo -e "${YELLOW}Top duplicated files:${NC}"
    grep "Clone found" ./analysis-results/duplication-report.txt | head -n 10
  fi
  
  echo -e "${YELLOW}Nx workspace structure:${NC}"
  cat ./analysis-results/nx-workspace-report.txt
fi

echo -e "${GREEN}Analysis complete!${NC}"
echo -e "View full report at: ${BLUE}./analysis-results/analysis-summary.md${NC}"

if [ "$FIX_MODE" = true ]; then
  echo -e "${YELLOW}Fix mode is enabled, but automatic fixes are not yet implemented.${NC}"
  echo -e "${YELLOW}Please review the analysis results and make manual fixes.${NC}"
fi

echo -e "  - Unused exports: cat ./analysis-results/unused-exports.txt"
echo -e "  - Dependency graph: open ./analysis-results/dependency-graph.svg"
echo -e "  - Duplication report: open ./analysis-results/duplication/index.html"
