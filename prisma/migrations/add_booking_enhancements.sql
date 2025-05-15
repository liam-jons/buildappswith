-- Migration to enhance the Booking table with pathway and custom question tracking

-- Add pathway field to track which pathway a booking relates to
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS "pathway" TEXT;

-- Add custom question response storage
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS "customQuestionResponse" JSONB;

-- Add index for pathway queries
CREATE INDEX IF NOT EXISTS "Booking_pathway_idx" ON "Booking" ("pathway");

-- Comments for documentation
COMMENT ON COLUMN "Booking"."pathway" IS 'The pathway (Accelerate, Pivot, Play) this booking relates to';
COMMENT ON COLUMN "Booking"."customQuestionResponse" IS 'JSON object storing custom question responses from Calendly. Structure: { question: string, answer: string, metadata?: any }';