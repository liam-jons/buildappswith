-- AlterTable: Update User model to support multiple roles and founder status
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" ADD COLUMN "roles" "UserRole"[] DEFAULT ARRAY['CLIENT']::"UserRole"[];
ALTER TABLE "User" ADD COLUMN "isFounder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add ADHD focus flag to BuilderProfile
ALTER TABLE "BuilderProfile" ADD COLUMN "adhd_focus" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum: Create AppStatus enum
CREATE TYPE "AppStatus" AS ENUM ('LIVE', 'DEMO', 'CONCEPT');

-- CreateTable: Create App model for showcase
CREATE TABLE "App" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "technologies" TEXT[],
  "status" "AppStatus" NOT NULL DEFAULT 'CONCEPT',
  "appUrl" TEXT,
  "builderId" TEXT NOT NULL,
  "adhd_focused" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Link App to BuilderProfile
ALTER TABLE "App" ADD CONSTRAINT "App_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
