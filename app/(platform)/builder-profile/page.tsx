import React from 'react';

export default function BuilderProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Builder Profile</h1>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200">
          You&apos;re at the Entry level of builder validation. This level confirms your identity and basic competencies.
        </p>
      </div>
      {/* Additional profile content can be added here */}
    </div>
  );
}
