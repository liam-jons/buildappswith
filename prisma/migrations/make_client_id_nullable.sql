-- Make clientId nullable to support anonymous bookings
ALTER TABLE "Booking" 
ALTER COLUMN "clientId" DROP NOT NULL;