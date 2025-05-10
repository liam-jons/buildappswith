"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FixedBuilderImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Fixed version of BuilderImage that avoids complex state management
 * and excessive useEffect calls that might cause Maximum update depth errors
 */
export function FixedBuilderImage({
  src,
  alt,
  fallbackText,
  size = 'md',
  className = '',
}: FixedBuilderImageProps) {
  // Size mappings (diameter in pixels)
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };
  
  // Get initials for fallback - calculated directly without state
  const initials = fallbackText ? 
    fallbackText.charAt(0).toUpperCase() : 
    alt.charAt(0).toUpperCase();
  
  // Simple boolean check for valid image src - no state or effects needed
  const hasValidImageSrc = Boolean(src) && 
    (src?.startsWith('/') || src?.startsWith('http'));
  
  return (
    <div className={cn(
      `relative ${sizeMap[size]} rounded-full border border-muted overflow-hidden bg-muted`,
      className
    )}>
      {hasValidImageSrc ? (
        // Image with fallback rendering
        <Image
          src={src as string}
          alt={alt}
          fill
          className="object-cover"
          onError={(e) => {
            // On error, hide the image element
            const imgElement = e.currentTarget as HTMLImageElement;
            imgElement.style.display = 'none';
            // Note: we don't update state here, just hide the element
          }}
          unoptimized={true}
        />
      ) : (
        // Render initials directly without conditional rendering that depends on state
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
          <span className="text-xl font-semibold text-primary">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}