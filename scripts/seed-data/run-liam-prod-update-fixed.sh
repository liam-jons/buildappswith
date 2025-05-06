#!/bin/bash

# Script to update Liam's profile in PRODUCTION environment
# Includes safety checks and confirmation

# Navigate to the project root directory
cd "$(dirname "$0")/../.." || exit

# Check if we're explicitly targeting production
if [ -z "$TARGET_PROD" ]; then
  echo "⚠️ WARNING: This script will update the PRODUCTION database!"
  echo "Are you sure you want to continue? (y/n)"
  read -r confirmation
  if [ "$confirmation" != "y" ]; then
    echo "Operation cancelled."
    exit 0
  fi
fi

# Set production database URL if not already set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require"
fi

# Verify connection to production database
echo "Verifying connection to production database..."
npx prisma db execute --file scripts/check-user-schema.sql --schema prisma/schema.prisma

if [ $? -ne 0 ]; then
  echo "Error: Could not connect to production database!"
  exit 1
fi

# Run the migration to ensure required columns exist
echo "Running migration to ensure required columns exist in production..."
npx prisma db execute --file prisma/migrations/add_clerk_id_production.sql --schema prisma/schema.prisma

if [ $? -ne 0 ]; then
  echo "Error: Migration failed!"
  exit 1
fi

# Run the script to update Liam's profile
echo "Updating Liam's profile in PRODUCTION..."
export NODE_ENV=production
node scripts/seed-data/update-liam-prod-fixed.js

if [ $? -ne 0 ]; then
  echo "Error: Profile update failed!"
  exit 1
fi

echo ""
echo "======================================================="
echo "Liam's profile has been successfully updated in PRODUCTION!"
echo "======================================================="