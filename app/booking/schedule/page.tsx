'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingFlow } from '@/components/scheduling';
import { BookingFlowProvider } from '@/lib/contexts/booking-flow-context';
import { fetchSessionTypes } from '@/lib/scheduling/api';
import { SessionType } from '@/lib/scheduling/types';
import { logger } from '@/lib/logger';

export default function BookingSchedulePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);

  // Get query parameters
  const builderId = searchParams?.get('builderId') || '';
  const sessionTypeId = searchParams?.get('sessionTypeId') || '';

  // Fetch session types
  useEffect(() => {
    async function loadSessionTypes() {
      if (!builderId) {
        setError('Builder ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const types = await fetchSessionTypes(builderId);
        setSessionTypes(types);
        setError(null);
      } catch (err) {
        logger.error('Error fetching session types', {
          error: err instanceof Error ? err.message : String(err),
          builderId
        });
        setError('Failed to load session types');
      } finally {
        setLoading(false);
      }
    }

    loadSessionTypes();
  }, [builderId]);
  
  if (loading) {
    return (
      <div className="booking-page-loading flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-page-error p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="booking-page-container p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Book a Session</h1>
      
      <BookingFlowProvider
        initialState={{
          builderId: builderId || undefined,
          sessionTypeId: sessionTypeId || undefined
        }}
      >
        <BookingFlow
          builderId={builderId}
          sessionTypes={sessionTypes || []}
          preselectedSessionTypeId={sessionTypeId}
        />
      </BookingFlowProvider>
    </div>
  );
}
