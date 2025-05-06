-- Add clerkId to User table if it doesn't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT UNIQUE;

-- Add expertise fields to BuilderProfile
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
  ADD COLUMN IF NOT EXISTS "topSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create indexes for marketplace search
CREATE INDEX IF NOT EXISTS "BuilderProfile_featured_idx" ON "BuilderProfile"("featured");
CREATE INDEX IF NOT EXISTS "BuilderProfile_searchable_idx" ON "BuilderProfile"("searchable");
CREATE INDEX IF NOT EXISTS "BuilderProfile_availability_idx" ON "BuilderProfile"("availability");
CREATE INDEX IF NOT EXISTS "BuilderProfile_validationTier_idx" ON "BuilderProfile"("validationTier");