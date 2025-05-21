import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { BookingFlow } from '@/components/scheduling';
import { BookingFlowProvider } from '@/lib/contexts/booking-flow-context';
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
    
    if (!builderProfile) {
      return null;
    }
    
    // Serialize Decimal types for client components
    const serializedProfile = {
      ...builderProfile,
      sessionTypes: builderProfile.sessionTypes.map(session => ({
        ...session,
        price: session.price.toNumber(), // Convert Decimal to number
      }))
    };
    
    // Log for debugging
    console.log('Builder profile session types:', {
      builderId,
      sessionCount: serializedProfile.sessionTypes.length,
      sessions: serializedProfile.sessionTypes.map(s => ({
        id: s.id,
        title: s.title,
        requiresAuth: s.requiresAuth,
        eventTypeCategory: s.eventTypeCategory,
        price: s.price,
        isActive: s.isActive,
        calendlyUri: s.calendlyEventTypeUri
      }))
    });
    
    return serializedProfile;
  } catch (error) {
    console.error('Error fetching builder profile:', error);
    return null;
  }
}

export default async function BookingPage({
  params,
  searchParams
}: {
  params: Promise<{ builderId: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { builderId } = await params;
  const resolvedSearchParams = await searchParams;
  const sessionTypeId = resolvedSearchParams.sessionTypeId as string | undefined;
  
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
  
  // Check if this is a dummy profile (no active session types)
  const isDummyProfile = !builderProfile.sessionTypes.length;
  
  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Book a Session with {builderProfile.user.name}
            </h1>
            <p className="text-gray-500 mt-2">
              {builderProfile.headline || builderProfile.tagline || ''}
            </p>
          </div>
          
          {builderProfile.user.imageUrl && (
            <div className="h-16 w-16 rounded-full overflow-hidden">
              <Image 
                src={builderProfile.user.imageUrl} 
                alt={builderProfile.user.name || 'Builder'}
                className="h-full w-full object-cover"
                width={64}
                height={64}
              />
            </div>
          )}
        </div>
      </div>
      
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
        <BookingFlowProvider>
          <BookingFlow
            builderId={builderId}
            sessionTypes={builderProfile.sessionTypes}
            preselectedSessionTypeId={sessionTypeId}
          />
        </BookingFlowProvider>
      )}
    </div>
  );
}