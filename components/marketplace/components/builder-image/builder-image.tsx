"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageFallback } from './fallback';

interface BuilderImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * BuilderImage component
 * 
 * A unified component for displaying builder profile images with proper
 * fallback handling and error states. This component replaces the previous
 * variants (BuilderImage, FixedBuilderImage, SimplifiedBuilderImage).
 * 
 * - Simple, stateless implementation to avoid render loops
 * - Proper image fallback with initials
 * - Consistent sizing across the application
 * - Error handling for invalid or missing images
 */
export function BuilderImage({
  src,
  alt,
  size = 'md',
  className = '',
}: BuilderImageProps) {
  // Size class mapping
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  // Simple validation of image source - no state or effects needed
  const hasValidImageSrc = Boolean(src) &&
    (src?.startsWith('/') || src?.startsWith('http'));

  return (
    <div className={cn(
      `relative ${sizeClasses[size]} rounded-full border border-muted overflow-hidden bg-muted`,
      className
    )}>
      {hasValidImageSrc ? (
        // Image with fallback handling
        <Image
          src={src as string}
          alt={alt}
          fill
          className="object-cover"
          onError={(e) => {
            // On error, hide the image element
            const imgElement = e.currentTarget as HTMLImageElement;
            imgElement.style.display = 'none';
          }}
          unoptimized={true}
        />
      ) : (
        // Fallback component
        <ImageFallback text={alt} size={size} />
      )}
    </div>
  );
}