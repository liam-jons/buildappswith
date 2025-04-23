#!/bin/bash

# Run the Liam Jons profile update script
# This script updates Liam's profile with ADHD focus and imports session types

# Navigate to the project root directory
cd "$(dirname "$0")/../.." || exit

# Ensure the data directory exists
if [ ! -d "./data" ]; then
  echo "Creating data directory..."
  mkdir -p ./data
fi

# Check if the Liam session types JSON file exists
if [ ! -f "./data/liam-session-types.json" ]; then
  echo "Error: liam-session-types.json not found in the data directory"
  echo "Please ensure the file exists before running this script"
  exit 1
fi

# Run the database migration if needed
echo "Running database migration..."
npx prisma migrate dev --name add_session_types

# Run the Liam profile update script
echo "Running Liam Jons profile update script..."
node scripts/seed-data/update-liam-profile.js

# Output completion message
echo ""
echo "=================================================="
echo "Liam Jons profile update complete!"
echo "Session types have been imported to the database."
echo "=================================================="
