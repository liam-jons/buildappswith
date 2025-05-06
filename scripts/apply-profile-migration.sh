#!/bin/bash

# Script to apply the consolidated profile migration and update Liam's profile
# Usage: ./scripts/apply-profile-migration.sh [dev|preview|prod]

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="${PROJECT_ROOT}/prisma/migrations/consolidated_profile_enhancements/migration.sql"

echo "🔍 Environment: ${ENVIRONMENT}"
echo "📁 Project root: ${PROJECT_ROOT}"
echo "📄 Migration file: ${MIGRATION_FILE}"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: ${MIGRATION_FILE}"
  exit 1
fi

# Function to apply migration and update profile
apply_migration() {
  local env_file="$1"
  
  echo "📋 Using environment file: ${env_file}"
  
  if [ ! -f "$env_file" ]; then
    echo "❌ Environment file not found: ${env_file}"
    exit 1
  fi
  
  # Source the environment file to get DATABASE_URL
  source "$env_file"
  
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in ${env_file}"
    exit 1
  fi
  
  echo "⚠️ Skipping database backup to avoid connection issues"
  # Creating a backup would require pg_dump which needs direct database access
  # This can be challenging with cloud-hosted databases like those on Vercel
  # For production migrations, consider creating a backup through your database provider's interface
  
  echo "🔄 Applying migration..."
  npx prisma db execute --file "$MIGRATION_FILE" --schema "${PROJECT_ROOT}/prisma/schema.prisma"
  echo "✅ Migration applied successfully"
  
  echo "🔄 Updating Liam's profile..."
  node "${PROJECT_ROOT}/scripts/seed-data/update-liam-profile-with-expertise.js"
  echo "✅ Liam's profile updated successfully"
  
  echo "🔄 Verifying migration..."
  npx prisma db execute --file "${PROJECT_ROOT}/scripts/verify-profile-migration.sql" --schema "${PROJECT_ROOT}/prisma/schema.prisma"
  echo "✅ Verification completed successfully"
}

# Create verification SQL script
cat > "${PROJECT_ROOT}/scripts/verify-profile-migration.sql" << 'EOL'
-- Verification query to check if migration was successful
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'BuilderProfile'
AND column_name IN ('slug', 'tagline', 'displayName', 'expertiseAreas', 'featured', 'searchable', 'availability', 'topSkills', 'clerkUserId')
ORDER BY column_name;

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'BuilderProfile'
AND indexname IN ('BuilderProfile_featured_idx', 'BuilderProfile_searchable_idx', 'BuilderProfile_availability_idx', 'BuilderProfile_validationTier_idx')
ORDER BY indexname;

-- Check if Liam's profile was updated correctly
SELECT "id", "displayName", "slug", "adhd_focus", "featured", "validationTier", "expertiseAreas" IS NOT NULL as has_expertise_areas
FROM "BuilderProfile"
WHERE "userId" IN (
  SELECT "id" FROM "User" WHERE "email" LIKE '%liam%buildappswith%'
);
EOL

# Apply migration based on environment
if [ "$ENVIRONMENT" = "prod" ]; then
  # For production environment
  echo "⚠️ About to apply migration to PRODUCTION database"
  echo "Press CTRL+C to cancel or ENTER to continue"
  read -r
  
  apply_migration "${PROJECT_ROOT}/.env.production.vercel"
elif [ "$ENVIRONMENT" = "preview" ]; then
  # For preview environment
  apply_migration "${PROJECT_ROOT}/.env.preview.vercel"
else
  # For development environment
  apply_migration "${PROJECT_ROOT}/.env.development.vercel"
fi

echo "🎉 Migration and profile update completed successfully for ${ENVIRONMENT} environment"