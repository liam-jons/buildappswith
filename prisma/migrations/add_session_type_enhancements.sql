-- Migration to enhance SessionType with authentication requirements and categorization

-- Add authentication requirement flag
ALTER TABLE "SessionType" 
ADD COLUMN IF NOT EXISTS "requiresAuth" BOOLEAN DEFAULT true;

-- Add display order for custom sorting
ALTER TABLE "SessionType" 
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER DEFAULT 999;

-- Add event type category
ALTER TABLE "SessionType" 
ADD COLUMN IF NOT EXISTS "eventTypeCategory" TEXT;

-- Add index for category queries
CREATE INDEX IF NOT EXISTS "SessionType_eventTypeCategory_idx" ON "SessionType" ("eventTypeCategory");
CREATE INDEX IF NOT EXISTS "SessionType_requiresAuth_idx" ON "SessionType" ("requiresAuth");

-- Update existing session types to set requiresAuth based on price (free sessions don't require auth)
UPDATE "SessionType" 
SET "requiresAuth" = CASE 
    WHEN price = 0 THEN false 
    ELSE true 
END 
WHERE "requiresAuth" IS NULL;

-- Set event type categories for existing sessions
UPDATE "SessionType" 
SET "eventTypeCategory" = CASE 
    WHEN price = 0 THEN 'free'
    WHEN title LIKE '%Initial Consultation%' THEN 'free'
    WHEN title LIKE '%Getting Started%' THEN 'free'
    WHEN title LIKE '%Back to Work%' THEN 'free'
    ELSE 'pathway'
END 
WHERE "eventTypeCategory" IS NULL;

-- Comments for documentation
COMMENT ON COLUMN "SessionType"."requiresAuth" IS 'Whether this session type requires user authentication';
COMMENT ON COLUMN "SessionType"."displayOrder" IS 'Custom display order for session types (lower numbers appear first)';
COMMENT ON COLUMN "SessionType"."eventTypeCategory" IS 'Category of event type: free, pathway, or specialized';