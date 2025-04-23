-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "builderTimezone" TEXT,
ADD COLUMN     "clientTimezone" TEXT,
ADD COLUMN     "sessionTypeId" TEXT;

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionType" ADD CONSTRAINT "SessionType_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
