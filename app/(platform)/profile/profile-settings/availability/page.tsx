'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import AvailabilityManagement from '@/components/scheduling/builder/availability/availability-management';
import { UserRole } from '@/lib/auth/types';
import { LoadingSpinner } from '@/components/ui';

export default function AvailabilityPage() {
  const { user, isLoaded } = useUser();
  const [builderId, setBuilderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        redirect('/auth/sign-in');
      }

      // Check if user has the BUILDER role
      const isBuilder = user.publicMetadata.roles?.includes(UserRole.BUILDER);
      if (!isBuilder) {
        redirect('/profile-settings');
      }

      // Fetch the builder profile ID
      const fetchBuilderId = async () => {
        try {
          // In a real implementation, this would hit an API endpoint
          // For now, we'll assume the builder ID is the same as the user ID
          setBuilderId(user.id);
        } catch (error) {
          console.error('Error fetching builder profile:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBuilderId();
    }
  }, [user, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!builderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Unable to find your builder profile. Please contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AvailabilityManagement builderId={builderId} />
    </div>
  );
}
