import { auth } from '@clerk/nextjs/server';
import { SignInButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import BookingCalendar from '@/components/scheduling/client/booking-calendar';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Book a Session | Buildappswith',
  description: 'Book a session with a builder on Buildappswith',
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
  params 
}: { 
  params: { builderId: string } 
}) {
  const { userId } = auth();
  const { builderId } = params;
  
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
          <Button href="/" variant="default">
            Return to Home
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
              <img 
                src={builderProfile.avatarUrl} 
                alt={`${builderProfile.user.firstName} ${builderProfile.user.lastName}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      
      {userId ? (
        <BookingCalendar builderId={builderId} />
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