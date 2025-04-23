#!/bin/bash

# Run Liam Jons profile update script
# This script updates the database with Liam Jons profile data

# Get the directory where this script is running from
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Go to project root folder
cd "$SCRIPT_DIR/../.."

# Ensure data directory exists
mkdir -p data

# Ensure script is executable
chmod +x ./scripts/seed-data/update-liam-profile.js

# Run the script
echo "Running Liam Jons profile update script..."
node ./scripts/seed-data/update-liam-profile.js

# Check for errors
if [ $? -eq 0 ]; then
  echo "Liam Jons profile update completed successfully!"
else
  echo "Error: Liam Jons profile update failed."
  exit 1
fi

# Create script to just run the updater for Liam's profile (for convenience)
echo "#!/bin/bash
node ./scripts/seed-data/update-liam-profile.js" > ./scripts/update-liam-profile.sh
chmod +x ./scripts/update-liam-profile.sh

echo "You can now run './scripts/update-liam-profile.sh' to update Liam's profile at any time."
