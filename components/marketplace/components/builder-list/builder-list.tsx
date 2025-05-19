"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BuilderCard } from '@/components/marketplace/components/builder-card';
import { BuilderListSkeleton } from './builder-list-skeleton';
import { MarketplaceErrorBoundary } from '@/components/marketplace/components/error-boundaries';
import { BuilderProfileListing } from '@/lib/marketplace';

interface BuilderListProps {
  builders: BuilderProfileListing[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * BuilderList component
 * 
 * Displays a grid of builder cards with proper loading and empty states
 */
export function BuilderList({
  builders,
  isLoading = false,
  emptyMessage = "No builders found",
  className
}: BuilderListProps) {
  const hasBuilders = useMemo(() => !isLoading && builders && builders.length > 0, [isLoading, builders]);
  
  return (
    <MarketplaceErrorBoundary componentName="BuilderList">
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}>
        {isLoading ? (
          <BuilderListSkeleton count={6} />
        ) : hasBuilders ? (
          builders.map(builder => (
            <BuilderCard
              key={builder.id}
              builder={builder}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">{emptyMessage}</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </MarketplaceErrorBoundary>
  );
}