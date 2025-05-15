-- Migration to create UserSkillProgress table for tracking user progress through skills

-- Create UserSkillProgress table
CREATE TABLE IF NOT EXISTS "UserSkillProgress" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" TEXT DEFAULT 'not_started' CHECK ("status" IN ('not_started', 'in_progress', 'completed')),
    "completedAt" TIMESTAMP,
    "completedVia" TEXT CHECK ("completedVia" IN ('assessment', 'builder_validation', 'auto', 'manual') OR "completedVia" IS NULL),
    "validatedBy" TEXT, -- User ID of validator (typically a builder)
    "pathway" TEXT,
    "notes" JSONB,
    "attempts" INTEGER DEFAULT 0,
    "lastAttemptAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "UserSkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "UserSkillProgress_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate entries
    CONSTRAINT "UserSkillProgress_userId_skillId_unique" UNIQUE ("userId", "skillId", "pathway")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "UserSkillProgress_userId_idx" ON "UserSkillProgress" ("userId");
CREATE INDEX IF NOT EXISTS "UserSkillProgress_skillId_idx" ON "UserSkillProgress" ("skillId");
CREATE INDEX IF NOT EXISTS "UserSkillProgress_status_idx" ON "UserSkillProgress" ("status");
CREATE INDEX IF NOT EXISTS "UserSkillProgress_pathway_idx" ON "UserSkillProgress" ("pathway");
CREATE INDEX IF NOT EXISTS "UserSkillProgress_completedAt_idx" ON "UserSkillProgress" ("completedAt");

-- Add trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_skill_progress_updated_at BEFORE UPDATE ON "UserSkillProgress"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE "UserSkillProgress" IS 'Tracks user progress through skills in various pathways';
COMMENT ON COLUMN "UserSkillProgress"."status" IS 'Current status of the skill: not_started, in_progress, or completed';
COMMENT ON COLUMN "UserSkillProgress"."completedVia" IS 'How the skill was completed: assessment, builder_validation, auto, or manual';
COMMENT ON COLUMN "UserSkillProgress"."validatedBy" IS 'User ID of the person who validated the completion (typically a builder)';
COMMENT ON COLUMN "UserSkillProgress"."pathway" IS 'The pathway context in which this skill progress is tracked';
COMMENT ON COLUMN "UserSkillProgress"."notes" IS 'JSON object for storing additional notes or metadata about the progress';
COMMENT ON COLUMN "UserSkillProgress"."attempts" IS 'Number of attempts made to complete this skill';
COMMENT ON COLUMN "UserSkillProgress"."lastAttemptAt" IS 'Timestamp of the last attempt to complete this skill';