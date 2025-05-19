"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageFallbackProps } from '../types';

/**
 * Image fallback component that displays a placeholder with the first letter of text
 * Used when an image fails to load or is not provided
 */
export function ImageFallback({
  text,
  size = 'md',
  className,
}: ImageFallbackProps) {
  // Get first letter of text for display
  const letter = text.charAt(0).toUpperCase();
  
  // Size class mapping for text
  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-primary/10",
        className
      )}
    >
      <span className={`${textSizeClasses[size]} font-semibold text-primary`}>
        {letter}
      </span>
    </div>
  );
}