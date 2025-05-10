"use client";

/**
 * Extremely minimal test page for marketplace to diagnose rendering issues
 */

import React from 'react';

export default function TestMarketplacePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Test Marketplace Page</h1>
      <p>This is a static test page with no data fetching or complex components.</p>
    </div>
  );
}