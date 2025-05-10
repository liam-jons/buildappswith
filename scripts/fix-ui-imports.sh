#!/bin/bash

# Script to fix UI component import paths
# This script changes imports from "@/components/ui/*" to "@/components/ui/core/*"

echo "Fixing UI component import paths..."

# Find files with UI component imports that need fixing
grep -r --include="*.tsx" --include="*.ts" "@/components/ui/" . | grep -v "@/components/ui/core" | cut -d: -f1 | sort | uniq > /tmp/files_to_fix.txt

# Count files needing fixes
file_count=$(wc -l < /tmp/files_to_fix.txt)
echo "Found $file_count files with UI imports that need to be fixed"

# Process each file
fixed_count=0
while IFS= read -r file; do
  # Skip node_modules
  if [[ $file == *"node_modules"* ]]; then
    continue
  fi
  
  # Skip files that don't exist (may be in .git history)
  if [ ! -f "$file" ]; then
    continue
  fi
  
  echo "Fixing imports in $file"
  
  # Process various UI components that need to be fixed
  sed -i '' 's|@/components/ui/button|@/components/ui/core/button|g' "$file"
  sed -i '' 's|@/components/ui/input|@/components/ui/core/input|g' "$file"
  sed -i '' 's|@/components/ui/textarea|@/components/ui/core/textarea|g' "$file"
  sed -i '' 's|@/components/ui/form|@/components/ui/core/form|g' "$file"
  sed -i '' 's|@/components/ui/checkbox|@/components/ui/core/checkbox|g' "$file"
  sed -i '' 's|@/components/ui/dialog|@/components/ui/core/dialog|g' "$file"
  sed -i '' 's|@/components/ui/label|@/components/ui/core/label|g' "$file"
  sed -i '' 's|@/components/ui/select|@/components/ui/core/select|g' "$file"
  sed -i '' 's|@/components/ui/switch|@/components/ui/core/switch|g' "$file"
  sed -i '' 's|@/components/ui/card|@/components/ui/core/card|g' "$file"
  sed -i '' 's|@/components/ui/badge|@/components/ui/core/badge|g' "$file"
  sed -i '' 's|@/components/ui/alert|@/components/ui/core/alert|g' "$file"
  sed -i '' 's|@/components/ui/avatar|@/components/ui/core/avatar|g' "$file"
  sed -i '' 's|@/components/ui/tabs|@/components/ui/core/tabs|g' "$file"
  sed -i '' 's|@/components/ui/toast|@/components/ui/core/toast|g' "$file"
  sed -i '' 's|@/components/ui/dropdown-menu|@/components/ui/core/dropdown-menu|g' "$file"
  sed -i '' 's|@/components/ui/sonner|@/components/ui/core/sonner|g' "$file"
  
  ((fixed_count++))
done < /tmp/files_to_fix.txt

echo "Fixed imports in $fixed_count files"
echo "Complete!"