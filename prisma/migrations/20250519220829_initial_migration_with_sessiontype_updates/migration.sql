/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CompletionMethod" AS ENUM ('ASSESSMENT', 'BUILDER_VALIDATION', 'AUTO', 'MANUAL');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUBSCRIBER';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "builderTimezone" TEXT,
ADD COLUMN     "calendlyEventId" TEXT,
ADD COLUMN     "calendlyEventUri" TEXT,
ADD COLUMN     "calendlyInviteeUri" TEXT,
ADD COLUMN     "clientTimezone" TEXT,
ADD COLUMN     "customQuestionResponse" JSONB,
ADD COLUMN     "pathway" TEXT,
ADD COLUMN     "sessionTypeId" TEXT,
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BuilderProfile" ADD COLUMN     "schedulingSettings" JSONB,
ADD COLUMN     "socialLinks" JSONB;

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "pathways" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "isFundamental" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pathways" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "clerkId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SubscriberProfile" (
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

-- CreateTable
CREATE TABLE "SessionType" (
    "id" TEXT NOT NULL,
    "builderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "maxParticipants" INTEGER,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 999,
    "eventTypeCategory" TEXT,
    "timeZone" TEXT,
    "isRecurring" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "calendlyEventTypeId" TEXT,
    "calendlyEventTypeUri" TEXT,

    CONSTRAINT "SessionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityRule" (
    "id" TEXT NOT NULL,
    "builderId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isRecurring" BOOLEAN DEFAULT true,
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL,
    "builderId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "slots" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "completedVia" "CompletionMethod",
    "validatedBy" TEXT,
    "pathway" TEXT,
    "notes" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriberProfile_userId_key" ON "SubscriberProfile"("userId");

-- CreateIndex
CREATE INDEX "AvailabilityRule_builderId_dayOfWeek_idx" ON "AvailabilityRule"("builderId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "AvailabilityException_builderId_date_idx" ON "AvailabilityException"("builderId", "date");

-- CreateIndex
CREATE INDEX "UserSkillProgress_userId_idx" ON "UserSkillProgress"("userId");

-- CreateIndex
CREATE INDEX "UserSkillProgress_skillId_idx" ON "UserSkillProgress"("skillId");

-- CreateIndex
CREATE INDEX "UserSkillProgress_status_idx" ON "UserSkillProgress"("status");

-- CreateIndex
CREATE INDEX "UserSkillProgress_pathway_idx" ON "UserSkillProgress"("pathway");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillProgress_userId_skillId_pathway_key" ON "UserSkillProgress"("userId", "skillId", "pathway");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "SubscriberProfile" ADD CONSTRAINT "SubscriberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionType" ADD CONSTRAINT "SessionType_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillProgress" ADD CONSTRAINT "UserSkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillProgress" ADD CONSTRAINT "UserSkillProgress_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
