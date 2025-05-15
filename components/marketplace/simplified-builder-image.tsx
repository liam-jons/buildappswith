"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SimplifiedBuilderImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_AVATAR = '/images/default-avatar.svg';

/**
 * A simplified version of BuilderImage that handles image loading and fallbacks
 */
export function SimplifiedBuilderImage({
  src,
  alt,
  fallbackText,
  size = 'md',
  className = '',
}: SimplifiedBuilderImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Size classes mapping - ensuring perfect circles with aspect-square
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  // Use default avatar if no src or if there's an error
  const imageSrc = !src || imageError ? DEFAULT_AVATAR : src;

  // Fallback text (first letter of alt or fallbackText)
  const letter = fallbackText 
    ? fallbackText.charAt(0).toUpperCase() 
    : alt.charAt(0).toUpperCase();

  return (
    <div 
      className={cn(
        'relative aspect-square rounded-full border border-muted overflow-hidden bg-muted flex-shrink-0',
        sizeMap[size],
        className
      )}
    >
      {!imageError && (
        <img
          src={imageSrc}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      )}
      {imageError && (
        <div className="h-full w-full flex items-center justify-center">
          <span className="font-semibold text-lg">{letter}</span>
        </div>
      )}
    </div>
  );
}