'use client';

import { ReactNode } from 'react';
import { BookingFlowProvider } from '@/lib/contexts/booking-flow-context';

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <BookingFlowProvider>
      <div className="booking-layout-container">
        {children}
      </div>
    </BookingFlowProvider>
  );
}
