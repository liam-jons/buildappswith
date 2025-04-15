'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderProfileForm } from '@/components/builders/form/builder-profile-form';
import { ValidationTier } from '@/types/builder';

export default function CreateBuilderProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real implementation, this would send the data to the API
      const response = await fetch('/api/builders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }
      
      const result = await response.json();
      
      // Redirect to the new profile page
      router.push(`/builders/${result.id}`);
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Builder Profile</h1>
          <p className="text-gray-400">
            Complete the form below to create your builder profile. This information will be visible to potential clients.
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-white">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <BuilderProfileForm 
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
        
        <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-md">
          <h2 className="text-lg font-semibold mb-2">About Validation Tiers</h2>
          <p className="mb-4 text-gray-300">
            All new profiles start at the Entry tier. As you complete projects and receive testimonials, 
            you can progress to higher tiers which increases your visibility and credibility.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-md border border-green-700/30">
              <h3 className="font-bold text-green-400 mb-1">Entry Tier</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                <li>Complete basic profile</li>
                <li>Add at least 3 skills</li>
                <li>Set up availability</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-md border border-blue-700/30">
              <h3 className="font-bold text-blue-400 mb-1">Established Tier</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                <li>At least 2 portfolio projects</li>
                <li>At least 1 client testimonial</li>
                <li>Client satisfaction score of 4.0+</li>
                <li>5+ skills and 1+ achievement badge</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-md border border-purple-700/30">
              <h3 className="font-bold text-purple-400 mb-1">Expert Tier</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                <li>5+ portfolio projects</li>
                <li>3+ client testimonials</li>
                <li>Client satisfaction score of 4.5+</li>
                <li>8+ skills and 3+ achievement badges</li>
                <li>Quick response time (< 8 hours)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
