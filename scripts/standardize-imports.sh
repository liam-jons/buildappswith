#!/bin/bash

# Standardize Imports
# This script helps standardize imports across the codebase to use barrel exports
# Usage: ./scripts/standardize-imports.sh [--dry-run]

# Process command-line arguments
DRY_RUN=false
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
  esac
done

echo "📦 Buildappswith Import Standardization Script"
echo "=============================================="
echo ""

# Step 1: Fix barrel exports to use relative paths
echo "🔄 Step 1: Fixing barrel export files to use relative paths..."
if [ "$DRY_RUN" = true ]; then
  node scripts/fix-barrel-exports.js --dry-run
else
  node scripts/fix-barrel-exports.js
fi
echo ""

# Step 2: Find and analyze component imports
echo "🔍 Step 2: Analyzing component imports that need updating..."
mkdir -p tmp
# Display analysis to console (but not when writing JSON)
node scripts/find-component-imports.js
# Generate clean JSON file for the update script
node scripts/find-component-imports.js --json > tmp/update-imports.json
cp tmp/update-imports.json scripts/update-imports.json
echo ""

# Step 3: Update component imports
echo "🔄 Step 3: Updating component imports to use barrel exports..."
if [ "$DRY_RUN" = true ]; then
  node scripts/update-component-imports.js --dry-run
else
  node scripts/update-component-imports.js
fi
echo ""

# Step 4: Update version number
if [ "$DRY_RUN" = false ]; then
  echo "📝 Step 4: Updating version number..."
  # Get current version from package.json
  CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")
  # Split into components
  IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
  MAJOR="${VERSION_PARTS[0]}"
  MINOR="${VERSION_PARTS[1]}"
  PATCH="${VERSION_PARTS[2]}"
  # Increment patch
  PATCH=$((PATCH + 1))
  # Construct new version
  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
  # Update package.json with new version
  node -e "
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    packageJson.version = '$NEW_VERSION';
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
  "
  echo "Version updated from $CURRENT_VERSION to $NEW_VERSION"
  echo ""
else
  echo "📝 Step 4: Skipping version update (dry run)..."
  echo ""
fi

# Step 5: Add entry to CHANGELOG.md
if [ "$DRY_RUN" = false ]; then
  echo "📝 Step 5: Updating CHANGELOG.md..."
  
  # Get current date in YYYY-MM-DD format
  TODAY=$(date +"%Y-%m-%d")
  
  # Prepare changelog entry
  CHANGELOG_ENTRY="## [$(node -e "console.log(require('./package.json').version)")] - $TODAY\n\n### Changed\n\n- Standardized component imports to use barrel exports\n- Updated barrel export files to use relative paths\n- Added component style guide with import standards\n"
  
  # Update CHANGELOG.md
  node -e "
    const fs = require('fs');
    const changelog = fs.readFileSync('./CHANGELOG.md', 'utf8');
    const lines = changelog.split('\n');
    let updatedChangelog = '';
    let foundFirstEntry = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (!foundFirstEntry && lines[i].startsWith('## [')) {
        updatedChangelog += '$CHANGELOG_ENTRY';
        foundFirstEntry = true;
      }
      updatedChangelog += lines[i] + '\n';
    }
    
    fs.writeFileSync('./CHANGELOG.md', updatedChangelog);
  "
  echo "CHANGELOG.md updated"
  echo ""
else
  echo "📝 Step 5: Skipping CHANGELOG.md update (dry run)..."
  echo ""
fi

echo "✅ Import standardization complete!"
if [ "$DRY_RUN" = true ]; then
  echo "This was a dry run. No files were modified."
  echo "Run './scripts/standardize-imports.sh' to apply the changes."
else
  echo "All imports have been standardized to use barrel exports."
fi
