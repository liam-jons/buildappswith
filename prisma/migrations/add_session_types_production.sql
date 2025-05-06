-- Add SessionType table if it doesn't exist
CREATE TABLE IF NOT EXISTS "SessionType" (
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
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "SessionType_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SessionType_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);