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
      },
    });
    
    return builderProfile;
  } catch (error) {
    console.error('Error fetching builder profile:', error);
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
  const calendlyEventTypeId = searchParams.calendlyEventTypeId as string | undefined;
  
  // Fetch builder profile
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
        <div className="rounded-lg overflow-hidden shadow-lg">
          <CalendlyEmbed
            url={
              calendlyEventTypeId
                ? `https://calendly.com/buildappswith/${calendlyEventTypeId}`
                : `https://calendly.com/buildappswith/${builderId}`
            }
            prefill={{
              name: userId,
              email: userId, // The Clerk user ID as a placeholder
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }}
            utm={{
              utmSource: 'buildappswith',
              utmMedium: 'website',
              utmCampaign: 'booking',
              utmContent: sessionTypeId || 'direct'
            }}
            className="h-[700px] w-full"
          />
        </div>
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