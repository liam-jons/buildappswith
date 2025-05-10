"use client";

import React from 'react';
import { SimpleMarketplaceErrorBoundary } from './components/marketplace/components/error-boundaries/simple-marketplace-error-boundary';

export default function TestPage() {
  return (
    <SimpleMarketplaceErrorBoundary>
      <div>Test content</div>
    </SimpleMarketplaceErrorBoundary>
  );
}