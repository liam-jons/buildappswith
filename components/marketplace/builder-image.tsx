"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface BuilderImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A production-ready builder profile image component
 * - Handles loading errors gracefully
 * - Provides consistent fallback for missing images
 * - Supports different size variants
 * - Future-ready for local image hosting
 */
export function BuilderImage({
  src,
  alt,
  fallbackText,
  size = 'md',
  className = '',
}: BuilderImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Size mappings (diameter in pixels)
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };
  
  // Get initials for fallback
  const getInitials = () => {
    // Use fallbackText if provided, otherwise extract from alt
    const text = fallbackText || alt;
    return text.charAt(0).toUpperCase();
  };
  
  // Determine if we should use a local image
  /* 
    TODO: In production, implement image mapping to local files:
    
    const getLocalImagePath = (externalUrl: string) => {
      // Map external URLs to local assets
      const urlMap: Record<string, string> = {
        'https://randomuser.me/api/portraits/men/22.jpg': '/images/builders/liam-jones.jpg',
        // Add more mappings as needed
      };
      
      return urlMap[externalUrl] || null;
    };
    
    const localSrc = src ? getLocalImagePath(src) : null;
  */
  
  // For now, we'll just use the external URL but handle errors properly
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className={`relative ${sizeMap[size]} rounded-full border border-muted overflow-hidden bg-muted ${className}`}>
      {(src && !imageError) ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={handleImageError}
          unoptimized={false} // Set to true as fallback if remotePatterns doesn't work
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
          <span className="text-xl font-semibold text-primary">
            {getInitials()}
          </span>
        </div>
      )}
    </div>
  );
}
