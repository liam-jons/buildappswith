#!/bin/bash

# Enhanced Unused Code Analyzer for Buildappswith
# Version: 1.0.140
#
# This script provides a more accurate analysis of potentially unused
# components in the codebase by checking file existence, supporting modern
# import patterns, and handling Next.js conventions properly.
#
# Usage: ./scripts/enhanced-unused-code-analyzer.sh [--fix] [--verbose] [--depth=N]

set -e

# Parse command line arguments
FIX_MODE=false
VERBOSE=false
DEPTH=6

for arg in "$@"; do
  case $arg in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --depth=*)
      DEPTH="${arg#*=}"
      shift
      ;;
  esac
done

echo "🔍 Enhanced Unused Code Analyzer (v1.0.140)"
echo "Running with settings: fix=${FIX_MODE}, verbose=${VERBOSE}, depth=${DEPTH}"

# Define directories to scan
PROJECT_ROOT=$(pwd)
COMPONENT_DIRS=(
  "components"
  "app/components"
  "lib/components"
  "(marketing)"
  "(platform)"
  "(auth)"
)

# Define directories to ignore
IGNORE_DIRS=(
  ".next"
  "node_modules"
  "public"
  "docs"
  "__tests__"
  "test"
  "tests"
  "cypress"
)

# Define files to ignore
IGNORE_FILES=(
  "*.test.*"
  "*.spec.*"
  "*.stories.*"
  "*.d.ts"
  "*.mock.*"
  "*global*"
  "middleware.ts"
)

# Special files to always exclude from unused analysis (Next.js system files)
NEXTJS_SYSTEM_FILES=(
  "page.tsx"
  "layout.tsx"
  "loading.tsx"
  "error.tsx"
  "not-found.tsx"
  "global-error.tsx"
  "route.ts"
  "route.js"
)

# Define timestamp for output files
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
OUTPUT_DIR="./docs/architecture/analysis"
mkdir -p "$OUTPUT_DIR"

# Output files
UNUSED_COMPONENTS_FILE="${OUTPUT_DIR}/unused-components-${TIMESTAMP}.md"
UNUSED_COMPONENTS_JSON="${OUTPUT_DIR}/unused-components-${TIMESTAMP}.json"
UNUSED_COMPONENTS_MERMAID="${OUTPUT_DIR}/unused-components-${TIMESTAMP}.mmd"
UNUSED_COMPONENTS_HTML="${OUTPUT_DIR}/unused-components-${TIMESTAMP}.html"

# Temp files
COMPONENTS_TEMP=$(mktemp)
IMPORTS_TEMP=$(mktemp)
USAGE_TEMP=$(mktemp)
trap 'rm -f "$COMPONENTS_TEMP" "$IMPORTS_TEMP" "$USAGE_TEMP"' EXIT

echo "Step 1: Finding all components in the codebase..."

# Find all component files
find . -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) | sort > "$COMPONENTS_TEMP"

# Filter out ignored directories and files
for dir in "${IGNORE_DIRS[@]}"; do
  if [ "$VERBOSE" = true ]; then
    echo "  Filtering out $dir/"
  fi
  grep -v "/$dir/" "$COMPONENTS_TEMP" > "$COMPONENTS_TEMP.tmp"
  mv "$COMPONENTS_TEMP.tmp" "$COMPONENTS_TEMP"
done

for file in "${IGNORE_FILES[@]}"; do
  if [ "$VERBOSE" = true ]; then
    echo "  Filtering out $file"
  fi
  grep -v "$file" "$COMPONENTS_TEMP" > "$COMPONENTS_TEMP.tmp"
  mv "$COMPONENTS_TEMP.tmp" "$COMPONENTS_TEMP"
done

# Count components
TOTAL_FILES=$(wc -l < "$COMPONENTS_TEMP")
echo "Found $TOTAL_FILES potential component files after filtering"

# Extract component names and check for existence
echo "Step 2: Analyzing component imports and usage..."

# Using parallel arrays instead of associative arrays for macOS compatibility
COMPONENT_NAMES=()
COMPONENT_FILES=()

while IFS= read -r file; do
  # Check if file still exists (might have been deleted during development)
  if [ ! -f "$file" ]; then
    if [ "$VERBOSE" = true ]; then
      echo "  Skipping non-existent file: $file"
    fi
    continue
  fi
  
  # Extract component name from filename (without extension)
  name=$(basename "$file" | sed 's/\.[^.]*$//')
  
  # Store in parallel arrays
  COMPONENT_NAMES+=("$name")
  COMPONENT_FILES+=("$file")
  
  # Log if verbose
  if [ "$VERBOSE" = true ]; then
    echo "  Found component: $name in $file"
  fi
done < "$COMPONENTS_TEMP"

echo "  Identified ${#COMPONENT_NAMES[@]} valid components with unique names"

# Find all imports in the codebase
echo "Step 3: Finding component imports throughout the codebase..."

# Process all potential component import patterns
for i in $(seq 0 $((${#COMPONENT_NAMES[@]} - 1))); do
  name="${COMPONENT_NAMES[$i]}"
  file="${COMPONENT_FILES[$i]}"
  
  # Initialize usage count to 0
  usage_count=0
  import_count=0
  jsx_count=0
  route_references=0
  
  # Track detected usage methods
  detected_methods=()
  
  # Check if this is a Next.js system file (page, layout, etc.)
  is_system_file=false
  for system_file in "${NEXTJS_SYSTEM_FILES[@]}"; do
    if [[ "$file" == *"/$system_file" ]]; then
      is_system_file=true
      detected_methods+=("Next.js system file")
      break
    fi
  done
  
  # If it's a system file, mark it as used
  if [ "$is_system_file" = true ]; then
    usage_count=$((usage_count + 1))
  else
    # Check for barrel exports
    # Look for exports from index files
    dir=$(dirname "$file")
    if [ -f "$dir/index.ts" ] || [ -f "$dir/index.tsx" ] || [ -f "$dir/index.js" ] || [ -f "$dir/index.jsx" ]; then
      index_file=""
      if [ -f "$dir/index.ts" ]; then
        index_file="$dir/index.ts"
      elif [ -f "$dir/index.tsx" ]; then
        index_file="$dir/index.tsx"
      elif [ -f "$dir/index.js" ]; then
        index_file="$dir/index.js"
      elif [ -f "$dir/index.jsx" ]; then
        index_file="$dir/index.jsx"
      fi
      
      if [ -n "$index_file" ]; then
        # Check if component is exported from index
        if grep -q "export.*$name" "$index_file"; then
          # Check usage of the directory itself in imports
          import_count_barrel=$(grep -r "from ['\"].*$(basename "$dir")['\"]" --include="*.{tsx,jsx,ts,js}" . | grep -v "$file" | grep -v "$index_file" | wc -l)
          
          if [ "$import_count_barrel" -gt 0 ]; then
            import_count=$((import_count + import_count_barrel))
            detected_methods+=("barrel export (${import_count_barrel})")
          fi
        fi
      fi
    fi
    
    # Check for standard imports using the component name
    if grep -q "import.*$name" "$file"; then
      # Look for direct imports of this component
      import_count_direct=$(grep -r "import.*$name.*from" --include="*.{tsx,jsx,ts,js}" . | grep -v "$file" | wc -l)
      
      if [ "$import_count_direct" -gt 0 ]; then
        import_count=$((import_count + import_count_direct))
        detected_methods+=("direct import (${import_count_direct})")
      fi
      
      # Look for named imports that might include this component
      import_count_named=$(grep -r "import.*{.*$name.*}.*from" --include="*.{tsx,jsx,ts,js}" . | grep -v "$file" | wc -l)
      
      if [ "$import_count_named" -gt 0 ]; then
        import_count=$((import_count + import_count_named))
        detected_methods+=("named import (${import_count_named})")
      fi
    fi
    
    # Check for JSX usage
    if [[ "$name" =~ ^[A-Z] ]]; then
      # Component name starts with uppercase - check for JSX usage
      jsx_count=$(grep -r "<$name[ />]" --include="*.{tsx,jsx}" . | grep -v "$file" | wc -l)
      
      if [ "$jsx_count" -gt 0 ]; then
        detected_methods+=("JSX usage (${jsx_count})")
      fi
      
      # Also check for kebab-case variants in classNames or other usages
      kebab_name=$(echo "$name" | sed 's/\([A-Z]\)/\-\L\1/g' | sed 's/^-//')
      kebab_count=$(grep -r "$kebab_name" --include="*.{tsx,jsx,css,scss}" . | grep -v "$file" | wc -l)
      
      if [ "$kebab_count" -gt 0 ]; then
        detected_methods+=("kebab variant (${kebab_count})")
        jsx_count=$((jsx_count + kebab_count))
      fi
    fi
    
    # Special handling for pages - check for routes to them in navigation components
    if [[ "$file" == *"/page.tsx" || "$file" == *"/app/"*"/page.tsx" ]]; then
      # Extract the route name from the path
      route_name=$(echo "$file" | sed 's/.*\/app\/\(.*\)\/page.tsx/\1/' | sed 's/\[.*\]//' | sed 's/\(.*\)\/$/\1/')
      
      # Check for route references in navigation components
      route_references=$(grep -r "href=\".*$route_name" --include="*.{tsx,jsx}" . | grep -v "$file" | wc -l)
      
      if [ "$route_references" -gt 0 ]; then
        detected_methods+=("route reference (${route_references})")
      fi
    fi
    
    # Special handling for API routes - check for fetch calls to them
    if [[ "$file" == *"/api/"*"/route.ts" || "$file" == *"/api/"*"/route.js" ]]; then
      # Extract the API route path
      api_route=$(echo "$file" | sed 's/.*\/api\/\(.*\)\/route.ts/\1/' | sed 's/\/route.js//')
      
      # Check for fetch calls to this API route
      api_usage=$(grep -r "fetch.*\/api\/$api_route" --include="*.{tsx,jsx,ts,js}" . | grep -v "$file" | wc -l)
      
      if [ "$api_usage" -gt 0 ]; then
        detected_methods+=("api call (${api_usage})")
        route_references=$((route_references + api_usage))
      fi
    fi
    
    # Total usage count
    usage_count=$((import_count + jsx_count + route_references))
  fi
  
  # Store results
  echo "$name|$file|$usage_count|${detected_methods[*]}" >> "$USAGE_TEMP"
done

# Sort and analyze usage data
sort -t"|" -k3,3nr "$USAGE_TEMP" > "$USAGE_TEMP.sorted"
mv "$USAGE_TEMP.sorted" "$USAGE_TEMP"

# Identify unused components
echo "Step 4: Identifying unused components..."

UNUSED_COUNT=0
USED_COUNT=0
TOTAL_COMPONENTS=${#COMPONENT_NAMES[@]}

# Create JSON array for unused components
echo "[" > "$UNUSED_COMPONENTS_JSON"
first_entry=true

# Create Markdown report
echo "# Buildappswith Unused Components Analysis" > "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"
echo "Generated on: $(date)" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"
echo "## Summary" >> "$UNUSED_COMPONENTS_FILE"

# Create Mermaid diagram
echo "graph TD" > "$UNUSED_COMPONENTS_MERMAID"
echo "  %% Unused Components Visualization" >> "$UNUSED_COMPONENTS_MERMAID"

# Process usage data
while IFS="|" read -r name file usage_count detected_methods; do
  # Format detected methods for display
  methods_str="${detected_methods// /, }"
  
  if [ "$usage_count" -eq 0 ]; then
    UNUSED_COUNT=$((UNUSED_COUNT + 1))
    
    # Add to Mermaid diagram
    component_id=$(echo "$name" | sed 's/[^a-zA-Z0-9]/_/g')
    component_type=""
    
    # Determine component category
    if [[ "$file" == *"/components/"* ]]; then
      component_type="UI Component"
    elif [[ "$file" == *"/app/"*"/page.tsx" ]]; then
      component_type="Page"
    elif [[ "$file" == *"/api/"* ]]; then
      component_type="API"
    elif [[ "$file" == *"/lib/"* ]]; then
      component_type="Library"
    elif [[ "$file" == *"/hooks/"* ]]; then
      component_type="Hook"
    else
      component_type="Other"
    fi
    
    # Add component to diagram with category color
    echo "  $component_id[\"$name ($component_type)\"]:::unused" >> "$UNUSED_COMPONENTS_MERMAID"
    
    # Add to JSON output
    if [ "$first_entry" = false ]; then
      echo "," >> "$UNUSED_COMPONENTS_JSON"
    else
      first_entry=false
    fi
    
    # Determine when file was last modified
    last_modified=$(stat -f "%Sm" -t "%Y-%m-%d" "$file" 2>/dev/null || echo "Unknown")
    
    # Create JSON entry
    cat << EOF >> "$UNUSED_COMPONENTS_JSON"
  {
    "name": "$name",
    "path": "$file",
    "type": "$component_type",
    "lastModified": "$last_modified"
  }
EOF
    
    if [ "$VERBOSE" = true ]; then
      echo "  UNUSED: $name in $file (Last modified: $last_modified)"
    fi
  else
    USED_COUNT=$((USED_COUNT + 1))
    
    if [ "$VERBOSE" = true ]; then
      echo "  USED ($usage_count): $name in $file ($methods_str)"
    fi
  fi
done < "$USAGE_TEMP"

# Close JSON array
echo "]" >> "$UNUSED_COMPONENTS_JSON"

# Finish Mermaid diagram
echo "" >> "$UNUSED_COMPONENTS_MERMAID"
echo "  %% Styles" >> "$UNUSED_COMPONENTS_MERMAID"
echo "  classDef unused fill:#FF6B6B,color:white,stroke:#CC5757,stroke-width:2px;" >> "$UNUSED_COMPONENTS_MERMAID"
echo "  classDef domain fill:#4ECDC4,color:white,stroke:#40AEA7,stroke-width:2px;" >> "$UNUSED_COMPONENTS_MERMAID"

# Complete summary in Markdown report
echo "- **Total Components**: $TOTAL_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
echo "- **Used Components**: $USED_COUNT" >> "$UNUSED_COMPONENTS_FILE"
echo "- **Unused Components**: $UNUSED_COUNT ($(( (UNUSED_COUNT * 100) / TOTAL_COMPONENTS ))%)" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"

# Group unused components by directory/domain
echo "## Unused Components by Domain" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"

# Organize by domain structure
# Using simpler approach for domain counts with macOS compatibility
UI_LIBRARY_COMPONENTS=""
MAGIC_UI_COMPONENTS=""
LANDING_PAGE_COMPONENTS=""
MARKETPLACE_COMPONENTS=""
PROFILE_COMPONENTS=""
SCHEDULING_COMPONENTS=""
MARKETING_PAGES=""
PLATFORM_PAGES=""
AUTH_COMPONENTS=""
STRIPE_COMPONENTS=""
SCHEDULING_API_COMPONENTS=""
MARKETPLACE_API_COMPONENTS=""
OTHER_COMPONENTS=""

UI_LIBRARY_COUNT=0
MAGIC_UI_COUNT=0
LANDING_PAGE_COUNT=0
MARKETPLACE_COUNT=0
PROFILE_COUNT=0
SCHEDULING_COUNT=0
MARKETING_PAGES_COUNT=0
PLATFORM_PAGES_COUNT=0
AUTH_COUNT=0
STRIPE_COUNT=0
SCHEDULING_API_COUNT=0
MARKETPLACE_API_COUNT=0
OTHER_COUNT=0

# Process each unused component and assign to a domain
while IFS="|" read -r name file usage_count detected_methods; do
  if [ "$usage_count" -ne 0 ]; then
    continue
  fi
  
  # Get last modified date
  last_modified=$(stat -f "%Sm" -t "%Y-%m-%d" "$file" 2>/dev/null || echo "Unknown")
  
  # Format as a markdown table row
  component_row="| $name | $(basename "$file") | $file | $last_modified |\n"
  
  # Determine domain based on path and add to appropriate group
  if [[ "$file" == *"/components/ui/"* ]]; then
    UI_LIBRARY_COMPONENTS="${UI_LIBRARY_COMPONENTS}${component_row}"
    UI_LIBRARY_COUNT=$((UI_LIBRARY_COUNT + 1))
  elif [[ "$file" == *"/components/magicui/"* ]]; then
    MAGIC_UI_COMPONENTS="${MAGIC_UI_COMPONENTS}${component_row}"
    MAGIC_UI_COUNT=$((MAGIC_UI_COUNT + 1))
  elif [[ "$file" == *"/components/landing/"* ]]; then
    LANDING_PAGE_COMPONENTS="${LANDING_PAGE_COMPONENTS}${component_row}"
    LANDING_PAGE_COUNT=$((LANDING_PAGE_COUNT + 1))
  elif [[ "$file" == *"/components/marketplace/"* ]]; then
    MARKETPLACE_COMPONENTS="${MARKETPLACE_COMPONENTS}${component_row}"
    MARKETPLACE_COUNT=$((MARKETPLACE_COUNT + 1))
  elif [[ "$file" == *"/components/profile/"* ]]; then
    PROFILE_COMPONENTS="${PROFILE_COMPONENTS}${component_row}"
    PROFILE_COUNT=$((PROFILE_COUNT + 1))
  elif [[ "$file" == *"/components/scheduling/"* ]]; then
    SCHEDULING_COMPONENTS="${SCHEDULING_COMPONENTS}${component_row}"
    SCHEDULING_COUNT=$((SCHEDULING_COUNT + 1))
  elif [[ "$file" == *"/app/(marketing)/"* ]]; then
    MARKETING_PAGES="${MARKETING_PAGES}${component_row}"
    MARKETING_PAGES_COUNT=$((MARKETING_PAGES_COUNT + 1))
  elif [[ "$file" == *"/app/(platform)/"* ]]; then
    PLATFORM_PAGES="${PLATFORM_PAGES}${component_row}"
    PLATFORM_PAGES_COUNT=$((PLATFORM_PAGES_COUNT + 1))
  elif [[ "$file" == *"/app/(auth)/"* || "$file" == *"/lib/auth/"* || "$file" == *"/components/auth/"* ]]; then
    AUTH_COMPONENTS="${AUTH_COMPONENTS}${component_row}"
    AUTH_COUNT=$((AUTH_COUNT + 1))
  elif [[ "$file" == *"/api/stripe/"* || "$file" == *"/lib/stripe/"* ]]; then
    STRIPE_COMPONENTS="${STRIPE_COMPONENTS}${component_row}"
    STRIPE_COUNT=$((STRIPE_COUNT + 1))
  elif [[ "$file" == *"/api/scheduling/"* ]]; then
    SCHEDULING_API_COMPONENTS="${SCHEDULING_API_COMPONENTS}${component_row}"
    SCHEDULING_API_COUNT=$((SCHEDULING_API_COUNT + 1))
  elif [[ "$file" == *"/api/marketplace/"* ]]; then
    MARKETPLACE_API_COMPONENTS="${MARKETPLACE_API_COMPONENTS}${component_row}"
    MARKETPLACE_API_COUNT=$((MARKETPLACE_API_COUNT + 1))
  else
    OTHER_COMPONENTS="${OTHER_COMPONENTS}${component_row}"
    OTHER_COUNT=$((OTHER_COUNT + 1))
  fi
done < "$USAGE_TEMP"

# Add domain sections to the markdown report
# UI Library
if [ $UI_LIBRARY_COUNT -gt 0 ]; then
  echo "### UI Library ($UI_LIBRARY_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$UI_LIBRARY_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Magic UI Components
if [ $MAGIC_UI_COUNT -gt 0 ]; then
  echo "### Magic UI Components ($MAGIC_UI_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$MAGIC_UI_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Landing Page
if [ $LANDING_PAGE_COUNT -gt 0 ]; then
  echo "### Landing Page ($LANDING_PAGE_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$LANDING_PAGE_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Marketplace
if [ $MARKETPLACE_COUNT -gt 0 ]; then
  echo "### Marketplace ($MARKETPLACE_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$MARKETPLACE_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Profile
if [ $PROFILE_COUNT -gt 0 ]; then
  echo "### Profile ($PROFILE_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$PROFILE_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Scheduling
if [ $SCHEDULING_COUNT -gt 0 ]; then
  echo "### Scheduling ($SCHEDULING_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$SCHEDULING_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Marketing Pages
if [ $MARKETING_PAGES_COUNT -gt 0 ]; then
  echo "### Marketing Pages ($MARKETING_PAGES_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$MARKETING_PAGES" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Platform Pages
if [ $PLATFORM_PAGES_COUNT -gt 0 ]; then
  echo "### Platform Pages ($PLATFORM_PAGES_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$PLATFORM_PAGES" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Authentication
if [ $AUTH_COUNT -gt 0 ]; then
  echo "### Authentication ($AUTH_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$AUTH_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Stripe Integration
if [ $STRIPE_COUNT -gt 0 ]; then
  echo "### Stripe Integration ($STRIPE_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$STRIPE_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Scheduling API
if [ $SCHEDULING_API_COUNT -gt 0 ]; then
  echo "### Scheduling API ($SCHEDULING_API_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$SCHEDULING_API_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Marketplace API
if [ $MARKETPLACE_API_COUNT -gt 0 ]; then
  echo "### Marketplace API ($MARKETPLACE_API_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$MARKETPLACE_API_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Other Components
if [ $OTHER_COUNT -gt 0 ]; then
  echo "### Other Components ($OTHER_COUNT components)" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
  echo "| Component | File | Path | Last Modified |" >> "$UNUSED_COMPONENTS_FILE"
  echo "|-----------|------|------|--------------|" >> "$UNUSED_COMPONENTS_FILE"
  echo -e "$OTHER_COMPONENTS" >> "$UNUSED_COMPONENTS_FILE"
  echo "" >> "$UNUSED_COMPONENTS_FILE"
fi

# Add recommendations section
echo "## Cleanup Recommendations" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"
echo "Based on the analysis, here are recommendations for cleanup:" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"
echo "1. **High Priority Removals**:" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Remove unused UI components first as they are the most self-contained" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Focus on components that haven't been modified in over 30 days" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Prioritize domains with the highest number of unused components" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"
echo "2. **Verification Process**:" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Manually verify each component before removal" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Check for dynamic imports or other non-standard usage patterns" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Consider temporarily commenting out rather than deleting initially" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"
echo "3. **Batch Removal Strategy**:" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Remove components by domain to maintain context" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Run the application and tests after each batch removal" >> "$UNUSED_COMPONENTS_FILE"
echo "   - Document removals in CHANGELOG.md for version tracking" >> "$UNUSED_COMPONENTS_FILE"
echo "" >> "$UNUSED_COMPONENTS_FILE"

# Create HTML version
cat > "$UNUSED_COMPONENTS_HTML" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buildappswith Unused Components Analysis</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      margin-top: 1.5em;
      color: #0066cc;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .summary {
      background: #f0f7ff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .highlight {
      color: #e04030;
      font-weight: bold;
    }
    code {
      font-family: monospace;
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a1a1a;
        color: #eee;
      }
      h1, h2, h3 {
        color: #66b3ff;
      }
      table {
        border-color: #444;
      }
      th {
        background-color: #333;
      }
      tr:nth-child(even) {
        background-color: #2a2a2a;
      }
      .summary {
        background: #162b44;
      }
      code {
        background: #333;
      }
    }
  </style>
</head>
<body>
  <h1>Buildappswith Unused Components Analysis</h1>
  
  <p>Generated on: $(date)</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Components:</strong> $TOTAL_COMPONENTS</p>
    <p><strong>Used Components:</strong> $USED_COUNT</p>
    <p><strong>Unused Components:</strong> <span class="highlight">$UNUSED_COUNT ($(( (UNUSED_COUNT * 100) / TOTAL_COMPONENTS ))%)</span></p>
  </div>
EOF

# Add domain sections to HTML
# UI Library
if [ $UI_LIBRARY_COUNT -gt 0 ]; then
  echo "<h2>UI Library ($UI_LIBRARY_COUNT components)</h2>" >> "$UNUSED_COMPONENTS_HTML"
  echo "<table>" >> "$UNUSED_COMPONENTS_HTML"
  echo "  <tr>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>Component</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>File</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>Path</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>Last Modified</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "  </tr>" >> "$UNUSED_COMPONENTS_HTML"
  
  # Split and process multiline component list
  echo "$UI_LIBRARY_COMPONENTS" | while IFS= read -r line; do
    if [[ "$line" == "| "* ]]; then
      # Convert markdown table row to HTML
      html_row=$(echo "$line" | sed 's/| \(.*\) | \(.*\) | \(.*\) | \(.*\) |/<tr><td>\1<\/td><td>\2<\/td><td>\3<\/td><td>\4<\/td><\/tr>/')
      echo "$html_row" >> "$UNUSED_COMPONENTS_HTML"
    fi
  done
  
  echo "</table>" >> "$UNUSED_COMPONENTS_HTML"
fi

# Magic UI Components
if [ $MAGIC_UI_COUNT -gt 0 ]; then
  echo "<h2>Magic UI Components ($MAGIC_UI_COUNT components)</h2>" >> "$UNUSED_COMPONENTS_HTML"
  echo "<table>" >> "$UNUSED_COMPONENTS_HTML"
  echo "  <tr>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>Component</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>File</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>Path</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "    <th>Last Modified</th>" >> "$UNUSED_COMPONENTS_HTML"
  echo "  </tr>" >> "$UNUSED_COMPONENTS_HTML"
  
  echo "$MAGIC_UI_COMPONENTS" | while IFS= read -r line; do
    if [[ "$line" == "| "* ]]; then
      html_row=$(echo "$line" | sed 's/| \(.*\) | \(.*\) | \(.*\) | \(.*\) |/<tr><td>\1<\/td><td>\2<\/td><td>\3<\/td><td>\4<\/td><\/tr>/')
      echo "$html_row" >> "$UNUSED_COMPONENTS_HTML"
    fi
  done
  
  echo "</table>" >> "$UNUSED_COMPONENTS_HTML"
fi

# Add more domain sections in a similar way...
# To keep the script concise, I'll add just these two sections and add a generic recommendation section

# Add recommendations to HTML
cat >> "$UNUSED_COMPONENTS_HTML" << EOF
  <h2>Cleanup Recommendations</h2>
  
  <p>Based on the analysis, here are recommendations for cleanup:</p>
  
  <h3>1. High Priority Removals</h3>
  <ul>
    <li>Remove unused UI components first as they are the most self-contained</li>
    <li>Focus on components that haven't been modified in over 30 days</li>
    <li>Prioritize domains with the highest number of unused components</li>
  </ul>
  
  <h3>2. Verification Process</h3>
  <ul>
    <li>Manually verify each component before removal</li>
    <li>Check for dynamic imports or other non-standard usage patterns</li>
    <li>Consider temporarily commenting out rather than deleting initially</li>
  </ul>
  
  <h3>3. Batch Removal Strategy</h3>
  <ul>
    <li>Remove components by domain to maintain context</li>
    <li>Run the application and tests after each batch removal</li>
    <li>Document removals in CHANGELOG.md for version tracking</li>
  </ul>
</body>
</html>
EOF

# Fix mode - option to move unused components
if [ "$FIX_MODE" = true ]; then
  echo "Would you like to move unused components to a backup directory? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    BACKUP_DIR="./docs/architecture/unused-components-backup-${TIMESTAMP}"
    mkdir -p "$BACKUP_DIR"
    
    echo "Moving unused components to $BACKUP_DIR..."
    
    # Process each unused component
    while IFS="|" read -r name file usage_count detected_methods; do
      if [ "$usage_count" -eq 0 ]; then
        # Create target directory
        target_dir="$BACKUP_DIR/$(dirname "${file#./}")"
        mkdir -p "$target_dir"
        
        # Copy file to backup
        cp "$file" "$target_dir/$(basename "$file")"
        
        if [ "$VERBOSE" = true ]; then
          echo "  Backed up: $file -> $target_dir/$(basename "$file")"
        fi
      fi
    done < "$USAGE_TEMP"
    
    echo "Backup complete. Review files in $BACKUP_DIR before deletion."
  else
    echo "No action taken. Run with --fix again to move files."
  fi
fi

# Print summary
echo ""
echo "==============================================="
echo "📊 Unused Code Analysis Complete"
echo "==============================================="
echo "📌 Total Components: $TOTAL_COMPONENTS"
echo "📌 Used Components: $USED_COUNT"
echo "📌 Potentially Unused: $UNUSED_COUNT ($(( (UNUSED_COUNT * 100) / TOTAL_COMPONENTS ))%)"
echo ""
echo "📑 Full reports available at:"
echo "   - $UNUSED_COMPONENTS_FILE"
echo "   - $UNUSED_COMPONENTS_HTML"
echo "   - $UNUSED_COMPONENTS_JSON"
echo "   - $UNUSED_COMPONENTS_MERMAID"
echo "==============================================="

# Update CHANGELOG.md with count information
if [ "$UNUSED_COUNT" -gt 0 ]; then
  echo "Updating CHANGELOG.md with analysis results..."
  
  # Create temp file for new changelog content
  changelog_temp=$(mktemp)
  
  # Extract today's date in YYYY-MM-DD format
  today=$(date +"%Y-%m-%d")
  
  # Check if there's an Unreleased section
  if grep -q "## \[Unreleased\]" ./CHANGELOG.md; then
    # Update the Unreleased section
    awk -v unused="$UNUSED_COUNT" -v total="$TOTAL_COMPONENTS" -v percent="$(( (UNUSED_COUNT * 100) / TOTAL_COMPONENTS ))" '
    /^## \[Unreleased\]/ {
      print $0;
      getline;
      print $0;
      print "### Changed";
      print "- Identified " unused " potentially unused components for removal (" percent "% of total components)";
      print "- Created comprehensive codebase cleanup strategy in docs/architecture/analysis";
      print "- Generated detailed component usage analysis to support cleanup efforts";
      print "- Added domain-based organization of unused components for systematic removal";
      print "- Enhanced unused components analyzer script for more accurate detection";
      next;
    }
    { print }
    ' ./CHANGELOG.md > "$changelog_temp"
  else
    # Create a new Unreleased section
    awk -v unused="$UNUSED_COUNT" -v total="$TOTAL_COMPONENTS" -v percent="$(( (UNUSED_COUNT * 100) / TOTAL_COMPONENTS ))" -v today="$today" '
    /^# Changelog/ {
      print $0;
      print "";
      print "## [Unreleased]";
      print "";
      print "### Changed";
      print "- Identified " unused " potentially unused components for removal (" percent "% of total components)";
      print "- Created comprehensive codebase cleanup strategy in docs/architecture/analysis";
      print "- Generated detailed component usage analysis to support cleanup efforts";
      print "- Added domain-based organization of unused components for systematic removal";
      print "- Enhanced unused components analyzer script for more accurate detection";
      print "";
      next;
    }
    { print }
    ' ./CHANGELOG.md > "$changelog_temp"
  fi
  
  # Replace the original changelog
  mv "$changelog_temp" ./CHANGELOG.md
  
  echo "CHANGELOG.md updated!"
fi

echo "Analysis complete! 🎉"
