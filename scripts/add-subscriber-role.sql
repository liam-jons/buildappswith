-- Migration script to add SUBSCRIBER role and isDemo flag
-- This should be executed through Prisma migrations

-- Update the UserRole enum (safe transaction)
-- First create a backup of the existing enum
CREATE TYPE "UserRole_new" AS ENUM ('CLIENT', 'BUILDER', 'ADMIN', 'SUBSCRIBER');

-- Update existing tables to use the new enum
ALTER TABLE "User" 
  ALTER COLUMN "roles" TYPE "UserRole_new"[] 
  USING (ARRAY[roles::text]::"UserRole_new"[]);

-- Drop the old enum
DROP TYPE "UserRole";

-- Rename the new enum to the original name
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Add isDemo flag to User table if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- Create a Subscriber profile table
CREATE TABLE IF NOT EXISTS "SubscriberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interests" TEXT[],
    "newsletterFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "subscriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEmailSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriberProfile_pkey" PRIMARY KEY ("id")
);

-- Create a unique constraint on userId
CREATE UNIQUE INDEX IF NOT EXISTS "SubscriberProfile_userId_key" ON "SubscriberProfile"("userId");

-- Add foreign key constraint
ALTER TABLE "SubscriberProfile" 
  ADD CONSTRAINT "SubscriberProfile_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Prisma schema (this is just a comment reminder, needs to be done manually)
-- Don't forget to update prisma/schema.prisma with these changes and run prisma generate