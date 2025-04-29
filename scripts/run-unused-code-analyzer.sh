#!/bin/bash

# Unused Code Analyzer Runner for Buildappswith
# Version: 1.0.140
#
# Note: Consider using enhanced-unused-code-analyzer.sh for more accurate results
#
# This script runs the unused features analyzer and reports the results

# Set the timestamp for consistent naming across files
export EXTRACTION_TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
echo "Using timestamp: $EXTRACTION_TIMESTAMP"

# Define output directories
ANALYSIS_DIR="./docs/architecture/analysis"
EXTRACTION_DIR="./docs/architecture/extraction"

# Create directories if they don't exist
mkdir -p "$ANALYSIS_DIR"
mkdir -p "$EXTRACTION_DIR"

echo "Step 1: Running architecture extraction to get latest model..."
ts-node ./scripts/extract-architecture.ts

echo "Step 2: Running unused features analyzer..."
ts-node ./scripts/create-unused-features-analyzer.ts

echo "Step 3: Generating report summary..."
if [ -f "$ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.md" ]; then
  # Extract high-level metrics
  TOTAL_COMPONENTS=$(grep -m1 "Total Components:" "$ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.md" | awk '{print $3}' | tr -d '**')
  UNUSED_COMPONENTS=$(grep -m1 "Potentially Unused Components:" "$ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.md" | awk '{print $4}' | tr -d '**')
  UNUSED_PERCENTAGE=$(grep -m1 "Potentially Unused Components:" "$ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.md" | awk '{print $5}' | tr -d '()')
  
  echo ""
  echo "==============================================="
  echo "📊 Unused Code Analysis Complete"
  echo "==============================================="
  echo "📌 Total Components: $TOTAL_COMPONENTS"
  echo "📌 Potentially Unused: $UNUSED_COMPONENTS ($UNUSED_PERCENTAGE)"
  
  # Check for AI Timeline components
  TIMELINE_COUNT=$(grep -A1 "AI Timeline Feature Analysis" "$ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.md" | grep -c "components:")
  if [ "$TIMELINE_COUNT" -gt 0 ]; then
    TIMELINE_COMPONENTS=$(grep -A1 "AI Timeline Feature Analysis" "$ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.md" | grep "components:" | awk '{print $4}' | tr -d '**')
    echo "📌 AI Timeline Feature: $TIMELINE_COMPONENTS components identified"
  fi
  
  # Get complexity stats
  if [ -f "$ANALYSIS_DIR/architectural-complexity-report-$EXTRACTION_TIMESTAMP.md" ]; then
    COMPLEXITY_SCORE=$(grep -m1 "System Complexity Score:" "$ANALYSIS_DIR/architectural-complexity-report-$EXTRACTION_TIMESTAMP.md" | awk '{print $4}' | tr -d '**')
    CYCLIC_DEPS=$(grep -m1 "Detected " "$ANALYSIS_DIR/architectural-complexity-report-$EXTRACTION_TIMESTAMP.md" | grep "dependency cycles" | awk '{print $2}' | tr -d '**')
    
    echo "📌 System Complexity: $COMPLEXITY_SCORE/10"
    if [ ! -z "$CYCLIC_DEPS" ]; then
      echo "📌 Cyclic Dependencies: $CYCLIC_DEPS detected"
    fi
  fi
  
  echo ""
  echo "📑 Full reports available at:"
  echo "   - $ANALYSIS_DIR/unused-components-report-$EXTRACTION_TIMESTAMP.html"
  echo "   - $ANALYSIS_DIR/architectural-complexity-report-$EXTRACTION_TIMESTAMP.html"
  echo "==============================================="
else
  echo "Error: Analysis reports not found"
fi

echo "Analysis complete! 🎉"
