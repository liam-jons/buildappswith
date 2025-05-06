-- ConsolidatedProfileEnhancements
-- 
-- This migration consolidates existing manual migrations (add_expertise_fields.sql and marketplace_enhancements)
-- to ensure all necessary fields are present on the BuilderProfile model

-- Add expertise and marketplace fields to BuilderProfile
ALTER TABLE "BuilderProfile" 
  ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "tagline" TEXT,
  ADD COLUMN IF NOT EXISTS "displayName" TEXT,
  ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "expertiseAreas" JSONB,
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "availability" TEXT NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS "topSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT UNIQUE;

-- Create indexes for marketplace search
CREATE INDEX IF NOT EXISTS "BuilderProfile_featured_idx" ON "BuilderProfile"("featured");
CREATE INDEX IF NOT EXISTS "BuilderProfile_searchable_idx" ON "BuilderProfile"("searchable");
CREATE INDEX IF NOT EXISTS "BuilderProfile_availability_idx" ON "BuilderProfile"("availability");
CREATE INDEX IF NOT EXISTS "BuilderProfile_validationTier_idx" ON "BuilderProfile"("validationTier");