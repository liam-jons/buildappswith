import { Suspense } from 'react';
import ManageScheduleClient from './client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Server component that receives the params as a Promise
export default async function ManageSchedulePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params to get the id
  const { id } = await params;
  
  return (
    <Suspense fallback={<LoadingSpinner message="Loading scheduling settings..." />}>
      <ManageScheduleClient builderId={id} />
    </Suspense>
  );
}