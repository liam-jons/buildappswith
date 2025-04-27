#!/bin/bash
# Architecture Report Generator Script for Buildappswith
# Version: 1.0.5
# This script generates a comprehensive report of the architecture extraction results

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Ensure we're in the project root
cd "$PROJECT_ROOT"

# Run the installation script to ensure dependencies are available
bash "$SCRIPT_DIR/install-architecture-extraction.sh"

# Use the local installation of ts-node
LOCAL_TS_NODE="$SCRIPT_DIR/node_modules/.bin/ts-node"

if [ -f "$LOCAL_TS_NODE" ]; then
    echo "Using locally installed ts-node from $LOCAL_TS_NODE"
    # Use the custom tsconfig.architecture.json file
    "$LOCAL_TS_NODE" --project "$SCRIPT_DIR/tsconfig.architecture.json" "$SCRIPT_DIR/generate-architecture-report.ts"
else
    echo "Error: Could not find ts-node in $LOCAL_TS_NODE"
    echo "Please run the installation script again or install ts-node manually."
    exit 1
fi

echo ""
echo "Architecture report generation completed successfully."
echo "Report is available at: $PROJECT_ROOT/docs/architecture/extraction/architecture-report.md"
echo "HTML version is available at: $PROJECT_ROOT/docs/architecture/extraction/architecture-report.html"