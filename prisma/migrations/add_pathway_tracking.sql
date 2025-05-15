-- Migration to add pathway tracking to ClientProfile
-- This adds the ability to track which pathways users are on

-- Add pathways column to ClientProfile
ALTER TABLE "ClientProfile" 
ADD COLUMN IF NOT EXISTS "pathways" JSONB DEFAULT '[]';

-- Add index for better query performance on pathways
CREATE INDEX IF NOT EXISTS "ClientProfile_pathways_idx" ON "ClientProfile" USING GIN ("pathways");

-- Comments for documentation
COMMENT ON COLUMN "ClientProfile"."pathways" IS 'JSON array tracking user pathways. Structure: [{ name: string, startDate: timestamp, status: active|paused|completed, builderId?: string, progress: { tier1: [], tier2: [], tier3: [] } }]';