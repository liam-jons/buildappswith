-- AlterTable: Add clerkId field to User model
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;

-- CreateIndex: Create unique index on clerkId
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
