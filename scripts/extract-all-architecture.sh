#!/bin/bash
# Extract All Architecture Script for Buildappswith
# Version: 1.0.0
# This script runs all architecture extraction scripts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Ensure we're in the project root
cd "$PROJECT_ROOT"

echo "Starting comprehensive architecture extraction..."
echo "==============================================="

# Run general architecture extraction first
echo "Extracting general architecture..."
bash "$SCRIPT_DIR/run-architecture-extraction.sh"

echo ""
echo "Extracting authentication architecture..."
bash "$SCRIPT_DIR/extract-auth-architecture.sh"

echo ""
echo "Generating architecture report..."
bash "$SCRIPT_DIR/generate-architecture-report.sh"

echo "==============================================="
echo "Architecture extraction complete."
echo ""
echo "Results are available in the following locations:"
echo "- General Architecture: $PROJECT_ROOT/docs/architecture/extraction/architecture-diagram.mmd"
echo "- Auth Architecture: $PROJECT_ROOT/docs/architecture/extraction/auth-architecture.mmd"
echo "- Full Report: $PROJECT_ROOT/docs/architecture/extraction/architecture-report.md"
echo ""
echo "If Docker is available, you can view the Structurizr diagrams at http://localhost:8080"