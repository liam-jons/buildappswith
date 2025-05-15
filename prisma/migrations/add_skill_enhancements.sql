-- Migration to enhance Skill model with fundamental flag and pathway associations

-- Add fundamental flag to identify skills that appear across multiple pathways
ALTER TABLE "Skill" 
ADD COLUMN IF NOT EXISTS "isFundamental" BOOLEAN DEFAULT false;

-- Add pathways array to track which pathways include this skill
ALTER TABLE "Skill" 
ADD COLUMN IF NOT EXISTS "pathways" TEXT[] DEFAULT '{}';

-- Add index for pathway queries
CREATE INDEX IF NOT EXISTS "Skill_pathways_idx" ON "Skill" USING GIN ("pathways");
CREATE INDEX IF NOT EXISTS "Skill_isFundamental_idx" ON "Skill" ("isFundamental");

-- Comments for documentation
COMMENT ON COLUMN "Skill"."isFundamental" IS 'Whether this skill is fundamental and appears across multiple pathways';
COMMENT ON COLUMN "Skill"."pathways" IS 'Array of pathway names that include this skill';