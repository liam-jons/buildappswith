#!/bin/bash
# Run Architecture Extraction Script for Buildappswith
# Version: 1.0.6
# This script runs the architecture extraction process and ensures all reports have proper timestamps

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Create timestamp for consistent file naming
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
export EXTRACTION_TIMESTAMP=$TIMESTAMP

# Ensure we're in the project root
cd "$PROJECT_ROOT"

# Run the installation script to ensure dependencies are available
bash "$SCRIPT_DIR/install-architecture-extraction.sh"

# Use the local installation of ts-node
echo "Running architecture extraction with local dependencies..."
echo "Using timestamp: $TIMESTAMP for all reports"
LOCAL_TS_NODE="$SCRIPT_DIR/node_modules/.bin/ts-node"

if [ -f "$LOCAL_TS_NODE" ]; then
    echo "Using locally installed ts-node from $LOCAL_TS_NODE"
    # Use the custom tsconfig.architecture.json file specifically for architecture extraction
    "$LOCAL_TS_NODE" --project "$SCRIPT_DIR/tsconfig.architecture.json" "$SCRIPT_DIR/extract-architecture.ts"
else
    echo "Error: Could not find ts-node in $LOCAL_TS_NODE"
    echo "Please run the installation script again or install ts-node manually."
    exit 1
fi

# Ensure reports have timestamps
EXTRACTION_DIR="$PROJECT_ROOT/docs/architecture/extraction"
for file in "$EXTRACTION_DIR"/*.{md,mmd,json,html}; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        extension="${filename##*.}"
        basename="${filename%.*}"
        
        # Skip files that already have a timestamp pattern
        if [[ "$basename" =~ [0-9]{4}-[0-9]{2}-[0-9]{2} ]]; then
            echo "Skipping already timestamped file: $filename"
            continue
        fi
        
        # Create timestamped copy
        timestamped_file="$EXTRACTION_DIR/${basename}-${TIMESTAMP}.${extension}"
        cp "$file" "$timestamped_file"
        echo "Created timestamped copy: $(basename "$timestamped_file")"
    fi
done

# Check if Structurizr workspace directory exists
STRUCTURIZR_DIR="$PROJECT_ROOT/docs/architecture/structurizr"
if [ ! -d "$STRUCTURIZR_DIR" ]; then
    echo "Creating Structurizr directory..."
    mkdir -p "$STRUCTURIZR_DIR"
fi

# Check if Docker and docker-compose are available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    # Check if Structurizr docker-compose.yml exists
    if [ ! -f "$STRUCTURIZR_DIR/docker-compose.yml" ]; then
        echo "Creating Structurizr docker-compose.yml file..."
        cat > "$STRUCTURIZR_DIR/docker-compose.yml" << EOF
version: '3'
services:
  structurizr:
    image: structurizr/lite:latest
    ports:
      - "8080:8080"
    volumes:
      - ./:/usr/local/structurizr
EOF
    fi
    
    echo "Starting Structurizr Lite..."
    cd "$STRUCTURIZR_DIR"
    docker-compose up -d
    
    echo ""
    echo "Architecture extraction completed successfully."
    echo "You can view the updated architecture at http://localhost:8080"
    echo ""
    echo "When you're done, stop Structurizr Lite with:"
    echo "cd $STRUCTURIZR_DIR && docker-compose down"
else
    echo ""
    echo "Architecture extraction completed successfully."
    echo ""
    echo "Docker or docker-compose not found. To view the architecture:"
    echo ""
    echo "1. Manually start Structurizr Lite, or"
    echo "2. View the generated Mermaid diagrams in:"
    echo "   $EXTRACTION_DIR/architecture-diagram-${TIMESTAMP}.mmd"
    echo "   $EXTRACTION_DIR/auth-architecture-${TIMESTAMP}.mmd"
    echo ""
    echo "You can also open these .mmd files in a Mermaid viewer like:"
    echo "- https://mermaid.live"
    echo "- VS Code with Mermaid extension"
fi