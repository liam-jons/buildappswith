"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SimplifiedBuilderImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A simplified version of BuilderImage without complex state management
 * This is a temporary replacement to diagnose rendering issues
 */
export function SimplifiedBuilderImage({
  src,
  alt,
  fallbackText,
  size = 'md',
  className = '',
}: SimplifiedBuilderImageProps) {
  // Size classes mapping
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  // Fallback text (first letter of alt or fallbackText)
  const letter = fallbackText 
    ? fallbackText.charAt(0).toUpperCase() 
    : alt.charAt(0).toUpperCase();

  return (
    <div 
      className={cn(
        `relative ${sizeMap[size]} rounded-full border border-muted overflow-hidden bg-muted flex items-center justify-center`,
        className
      )}
    >
      <span className="font-semibold text-lg">{letter}</span>
    </div>
  );
}