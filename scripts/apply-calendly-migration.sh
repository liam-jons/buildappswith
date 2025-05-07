#!/bin/bash

# Script to apply the Calendly migration to different environments
# Usage: ./scripts/apply-calendly-migration.sh [dev|preview|prod]

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="${PROJECT_ROOT}/prisma/migrations/add_calendly_fields.sql"

echo "🔍 Environment: ${ENVIRONMENT}"
echo "📁 Project root: ${PROJECT_ROOT}"
echo "📄 Migration file: ${MIGRATION_FILE}"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: ${MIGRATION_FILE}"
  exit 1
fi

# Function to apply migration
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
  # For production migrations, consider creating a backup through your database provider's interface
  
  echo "🔄 Verifying current database state..."
  # First verify if the columns already exist
  local verification_script="${PROJECT_ROOT}/scripts/verify-calendly-columns.sql"
  
  cat > "$verification_script" << 'EOL'
-- Verification query to check if Calendly columns already exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'SessionType' 
AND column_name IN ('calendlyEventTypeId', 'calendlyEventTypeUri');

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Booking' 
AND column_name IN ('calendlyEventId', 'calendlyEventUri', 'calendlyInviteeUri');
EOL

  echo "Running verification..."
  COLUMNS=$(npx prisma db execute --file "$verification_script" --schema "${PROJECT_ROOT}/prisma/schema.prisma")
  
  # Count how many columns already exist
  COLUMN_COUNT=$(echo "$COLUMNS" | grep -v "column_name" | grep -v "^$" | wc -l | tr -d ' ')
  
  if [ "$COLUMN_COUNT" -eq 5 ]; then
    echo "✅ All Calendly columns (5/5) already exist in the database. No migration needed."
    return 0
  fi
  
  echo "Found $COLUMN_COUNT out of 5 required Calendly columns."
  echo "🔄 Applying migration..."
  npx prisma db execute --file "$MIGRATION_FILE" --schema "${PROJECT_ROOT}/prisma/schema.prisma"
  echo "✅ Migration applied successfully"
  
  echo "🔄 Verifying migration..."
  # Verify again after migration
  COLUMNS_AFTER=$(npx prisma db execute --file "$verification_script" --schema "${PROJECT_ROOT}/prisma/schema.prisma")
  
  # Count how many columns exist after migration
  COLUMN_COUNT_AFTER=$(echo "$COLUMNS_AFTER" | grep -v "column_name" | grep -v "^$" | wc -l | tr -d ' ')
  
  if [ "$COLUMN_COUNT_AFTER" -eq 5 ]; then
    echo "✅ Migration verification successful! All 5 Calendly columns are now present."
  else
    echo "❌ Migration verification failed! Found $COLUMN_COUNT_AFTER out of 5 expected columns."
    echo "Please check the database schema manually."
    exit 1
  fi
}

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

echo "🎉 Calendly migration completed successfully for ${ENVIRONMENT} environment"

# Clean up verification script
rm -f "${PROJECT_ROOT}/scripts/verify-calendly-columns.sql"