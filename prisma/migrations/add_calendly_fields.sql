-- Add Calendly fields to SessionType table
ALTER TABLE "SessionType" ADD COLUMN "calendlyEventTypeId" TEXT;
ALTER TABLE "SessionType" ADD COLUMN "calendlyEventTypeUri" TEXT;

-- Add Calendly fields to Booking table
ALTER TABLE "Booking" ADD COLUMN "calendlyEventId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "calendlyEventUri" TEXT;
ALTER TABLE "Booking" ADD COLUMN "calendlyInviteeUri" TEXT;