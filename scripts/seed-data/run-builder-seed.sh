#!/bin/bash

# Script to run the builder profile seeding

echo "Starting builder profile seeding process..."

# Run the JavaScript file directly with Node.js
node scripts/seed-data/seed-builder-profiles.js

echo "Builder profile seeding completed"
