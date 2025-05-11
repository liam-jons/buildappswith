-- Add new fields to the Booking model for Calendly-Stripe integration

-- Add additional payment related fields
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stripeRefundId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(10, 2);

-- Add cancellation related fields
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;

-- Add rescheduling fields
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "rescheduledFrom" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "rescheduledAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "rescheduledBy" TEXT;

-- Add state management fields
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "currentState" TEXT DEFAULT 'IDLE';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stateData" JSONB;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "lastTransition" TIMESTAMP;

-- Add recovery and error tracking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "recoveryToken" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "recoveryExpiresAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "lastErrorCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "lastErrorMessage" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "errorTimestamp" TIMESTAMP;

-- Update BookingStatus enum if needed
-- Note: We need to use a different approach to change enums in PostgreSQL
-- This is a simplified representation

-- Create a new temporary booking status type with additional values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingStatus_new') THEN
        CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED');
    END IF;
END
$$;

-- Create a new temporary payment status type with additional values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus_new') THEN
        CREATE TYPE "PaymentStatus_new" AS ENUM ('UNPAID', 'PAID', 'REFUNDED', 'FAILED', 'PENDING', 'PARTIALLY_REFUNDED');
    END IF;
END
$$;

-- Note: In a real migration, we would then:
-- 1. Create a new column with the new type
-- 2. Copy data from old column to new
-- 3. Drop the old column
-- 4. Rename the new column to the original name

-- For the purpose of this script, we'll just note that these steps would be needed
-- The actual implementation would depend on the database provider and migration strategy