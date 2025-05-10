"use client";

import React, { useState, useEffect } from 'react';
import { FeatureFlag, getFeatureFlag } from '@/lib/feature-flags';

interface FeatureFlagWrapperProps {
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that renders its children only if the specified feature flag is enabled.
 * Otherwise, it renders the fallback component if provided.
 */
export function FeatureFlagWrapper({
  flag,
  children,
  fallback = null,
}: FeatureFlagWrapperProps) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check the feature flag
    const enabled = getFeatureFlag(flag);
    setIsEnabled(enabled);
    
    // Debug log
    console.debug(`Feature flag ${flag}: ${enabled ? 'enabled' : 'disabled'}`);
  }, [flag]);
  
  // During SSR or before the check completes, don't render anything
  if (isEnabled === null) {
    return null;
  }
  
  // Render children if flag is enabled, otherwise render fallback
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * A simple fallback for BuilderImage
 */
export function SimplifiedBuilderImage({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  // Size mappings
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };
  
  // Just render a simple div with the initial
  const initial = alt.charAt(0).toUpperCase();
  
  return (
    <div 
      className={`${sizeMap[size]} rounded-full bg-gray-200 flex items-center justify-center ${className}`}
      aria-label={alt}
    >
      <span className="text-gray-700 font-semibold text-lg">{initial}</span>
    </div>
  );
}

/**
 * A simplified preferences button that does nothing
 */
export function SimplifiedViewingPreferences({
  className = '',
  variant = 'default',
}: {
  className?: string;
  variant?: string;
}) {
  return (
    <button 
      className={`px-3 py-2 rounded-md border border-gray-200 text-sm ${className}`}
      aria-label="Viewing preferences (disabled)"
    >
      {variant === 'minimal' ? 'VP' : 'Viewing Preferences'}
    </button>
  );
}