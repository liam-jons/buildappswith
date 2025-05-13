
CREATE TABLE IF NOT EXISTS "SubscriberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interests" TEXT[],
    "newsletterFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "subscriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEmailSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriberProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubscriberProfile_userId_key" ON "SubscriberProfile"("userId");

ALTER TABLE "SubscriberProfile" 
  ADD CONSTRAINT "SubscriberProfile_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

