-- AddMarketplaceFields
-- 

-- Add new fields to BuilderProfile
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "tagline" TEXT;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "expertiseAreas" JSONB;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "availability" TEXT NOT NULL DEFAULT 'available';
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "topSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create indexes for marketplace search
CREATE INDEX IF NOT EXISTS "BuilderProfile_featured_idx" ON "BuilderProfile"("featured");
CREATE INDEX IF NOT EXISTS "BuilderProfile_searchable_idx" ON "BuilderProfile"("searchable");
CREATE INDEX IF NOT EXISTS "BuilderProfile_availability_idx" ON "BuilderProfile"("availability");
CREATE INDEX IF NOT EXISTS "BuilderProfile_validationTier_idx" ON "BuilderProfile"("validationTier");