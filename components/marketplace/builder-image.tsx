"use client";

import React, { useState, useEffect } from 'react';
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
  // Component states
  const [shouldShowImage, setShouldShowImage] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>('/images/default-avatar.svg');
  
  // Size mappings (diameter in pixels)
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };
  
  // Get initials for fallback
  const getInitials = () => {
    const text = fallbackText || alt;
    return text.charAt(0).toUpperCase();
  };
  
  // Handle image loading errors
  const handleImageError = () => {
    console.warn(`Failed to load builder image: ${src}`);
    setShouldShowImage(false);
  };

  // Determine image source once on mount or when src changes
  useEffect(() => {
    // Default to showing the initials fallback
    setShouldShowImage(false);
    
    // If no source, use default avatar
    if (!src) {
      setImageSrc('/images/default-avatar.svg');
      return;
    }
    
    // Handle local paths
    if (src.startsWith('/')) {
      setImageSrc(src);
      setShouldShowImage(true);
      return;
    }
    
    // Validate URL format for external images
    try {
      new URL(src);
      setImageSrc(src);
      setShouldShowImage(true);
    } catch (error) {
      // Invalid URL, use default avatar
      console.warn(`Invalid builder image URL format: ${src}`);
      setImageSrc('/images/default-avatar.svg');
      setShouldShowImage(true);
    }
  }, [src]);

  // Render initial fallback
  const renderInitials = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
      <span className="text-xl font-semibold text-primary">
        {getInitials()}
      </span>
    </div>
  );

  return (
    <div className={`relative ${sizeMap[size]} rounded-full border border-muted overflow-hidden bg-muted ${className}`}>
      {shouldShowImage ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          onError={handleImageError}
          unoptimized={true}
        />
      ) : (
        renderInitials()
      )}
    </div>
  );
}