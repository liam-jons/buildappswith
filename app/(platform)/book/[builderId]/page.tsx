import { auth } from '@clerk/nextjs/server';
import { SignInButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
// Using Calendly integration instead of BookingCalendar
import { CalendlyEmbed } from '@/components/scheduling/calendly';
import { createCalendlySchedulingLink } from '@/lib/scheduling/calendly/client-api';
import { Button } from "@/components/ui/core/button";
import { Alert, AlertDescription } from "@/components/ui/core/alert";
import { InfoIcon } from "lucide-react";


export const metadata = {
  title: 'Book a Session | Build Apps With',
  description: 'Book a session with a builder on Build Apps With',
};

async function getBuilderProfile(builderId: string) {
  try {
    const builderProfile = await db.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        user: true,
        sessionTypes: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        }
      },
    });
    
    return builderProfile;
  } catch (error) {
    console.error('Error fetching builder profile:', error);
    return null;
  }
}

async function getUser(userId: string | null) {
  if (!userId) return null;
  
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function BookingPage({
  params,
  searchParams
}: {
  params: { builderId: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { userId } = auth();
  const { builderId } = params;
  const sessionTypeId = searchParams.sessionTypeId as string | undefined;
  
  // Fetch current user data
  const currentUser = await getUser(userId);
  
  // Fetch builder profile with session types
  const builderProfile = await getBuilderProfile(builderId);
  
  if (!builderProfile) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Builder Not Found</h1>
          <p className="text-gray-500 mb-6">
            The builder you are looking for does not exist or has been removed.
          </p>
          <Button variant="default" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Find the selected session type or use the first available one
  const selectedSessionType = sessionTypeId 
    ? builderProfile.sessionTypes.find(st => st.id === sessionTypeId)
    : builderProfile.sessionTypes[0];
    
  // Check if this is a dummy profile (no Calendly URL)
  const isDummyProfile = !selectedSessionType?.calendlyEventTypeUri || !builderProfile.sessionTypes.length;
  
  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Book a Session with {builderProfile.user.firstName} {builderProfile.user.lastName}
            </h1>
            <p className="text-gray-500 mt-2">
              {builderProfile.title}
            </p>
          </div>
          
          {builderProfile.avatarUrl && (
            <div className="h-16 w-16 rounded-full overflow-hidden">
              <Image 
                src={builderProfile.avatarUrl} 
                alt={`${builderProfile.user.firstName} ${builderProfile.user.lastName}`}
                className="h-full w-full object-cover"
                width={64}
                height={64}
              />
            </div>
          )}
        </div>
      </div>
      
      {userId ? (
        <>
          {isDummyProfile ? (
            <Alert className="mb-8">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                This is a demonstration profile. Booking is not available for this builder at the moment.
                <br />
                <Link href="/marketplace" className="font-medium underline">
                  Browse other builders
                </Link> to find available consultations.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Session type selector if multiple types available */}
              {builderProfile.sessionTypes.length > 1 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">Select a Session Type:</h2>
                  <div className="grid gap-3">
                    {builderProfile.sessionTypes.map((sessionType) => (
                      <Link
                        key={sessionType.id}
                        href={`/book/${builderId}?sessionTypeId=${sessionType.id}`}
                        className={`p-4 border rounded-lg hover:border-primary transition-colors ${
                          selectedSessionType?.id === sessionType.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{sessionType.title}</h3>
                            <p className="text-sm text-gray-600">{sessionType.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {sessionType.durationMinutes} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${sessionType.price.toString()} {sessionType.currency}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Calendly embed */}
              {selectedSessionType && (
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <CalendlyEmbed
                    url={selectedSessionType.calendlyEventTypeUri}
                    prefill={{
                      name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
                      email: currentUser?.email || '',
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    }}
                    utm={{
                      utmSource: 'buildappswith',
                      utmMedium: 'website',
                      utmCampaign: 'booking',
                      utmContent: selectedSessionType.id
                    }}
                    className="h-[700px] w-full"
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign In to Book a Session</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to book a session with {builderProfile.user.firstName}.
          </p>
          <SignInButton mode="modal">
            <Button size="lg">
              Sign In to Continue
            </Button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}