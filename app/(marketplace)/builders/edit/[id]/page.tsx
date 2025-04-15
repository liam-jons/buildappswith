'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderProfileForm } from '@/components/builders/form/builder-profile-form';
import { ValidationTier } from '@/types/builder';

interface EditBuilderProfilePageProps {
  params: {
    id: string;
  };
}

export default function EditBuilderProfilePage({ params }: EditBuilderProfilePageProps) {
  const { id } = params;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/builders/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real implementation, this would send the data to the API
      const response = await fetch(`/api/builders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      // Redirect to the profile page
      router.push(`/builders/${id}`);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto text-center py-12">
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-md text-white">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => router.push('/builders')}
              className="mt-4 px-4 py-2 bg-white text-red-900 rounded-md hover:bg-gray-100 transition-colors"
            >
              Back to Builders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Your Builder Profile</h1>
          <p className="text-gray-400">
            Update your profile information below. These changes will be visible to potential clients.
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-white">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {profile && (
          <BuilderProfileForm 
            defaultValues={profile}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}
        
        <div className="mt-8 p-4 bg-indigo-900/20 border border-indigo-700/30 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Current Validation Tier: {profile?.validationTier.charAt(0).toUpperCase() + profile?.validationTier.slice(1)}</h2>
          <p className="text-gray-300">
            Your validation tier is determined automatically based on your profile completeness, 
            portfolio projects, testimonials, and other factors. Continue to build your profile 
            to advance to higher tiers.
          </p>
        </div>
      </div>
    </div>
  );
}
