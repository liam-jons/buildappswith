"use client";

import React from 'react';
import { CardSkeleton } from '@/components/marketplace/components/builder-card';

interface BuilderListSkeletonProps {
  count?: number;
}

/**
 * Skeleton loader for the builder list grid
 */
export function BuilderListSkeleton({ count = 6 }: BuilderListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  );
}