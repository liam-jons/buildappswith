'use client';

import { Suspense } from 'react';
import { SearchParamsFallback } from '@/components/search-params-fallback';
import PaymentSuccessContent from './payment-success-content';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<SearchParamsFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
