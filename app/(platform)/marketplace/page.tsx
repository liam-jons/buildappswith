"use client";

import React, { useState, useEffect } from 'react';
import { 
  BuilderList, 
  FilterPanel, 
  MarketplaceErrorBoundary,
  useBuilderSearch
} from '@/components/marketplace';
import { Pagination } from '@/components/ui/core/pagination';

/**
 * Marketplace Page
 * 
 * Main page for the marketplace, displays a list of builders with filtering and search
 * Uses the consolidated marketplace components with proper error boundaries
 */
export default function MarketplacePage() {
  // Initialize the builder search hook
  const {
    builders,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalBuilders,
    changePage
  } = useBuilderSearch({
    initialFilters: { sortBy: 'featured' },
    pageSize: 9
  });

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Application Builders</h1>
        <p className="text-muted-foreground max-w-3xl">
          Find skilled builders to help bring your AI application ideas to life. Browse profiles, 
          check ratings, and connect with the perfect builder for your project.
        </p>
      </div>
      
      {/* Main content layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="md:col-span-1">
          <MarketplaceErrorBoundary componentName="MarketplaceFilters">
            <FilterPanel className="sticky top-24" />
          </MarketplaceErrorBoundary>
        </div>
        
        {/* Builders listing */}
        <div className="md:col-span-3 space-y-6">
          <MarketplaceErrorBoundary componentName="MarketplaceResults">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading builders..."
                ) : (
                  `Showing ${builders.length} of ${totalBuilders} builders`
                )}
              </p>
            </div>
            
            {/* Builder list grid */}
            <BuilderList 
              builders={builders} 
              isLoading={isLoading}
              emptyMessage={
                error 
                  ? "There was an error loading builders. Please try again."
                  : "No builders match your criteria. Try adjusting your filters."
              }
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              </div>
            )}
          </MarketplaceErrorBoundary>
        </div>
      </div>
    </div>
  );
}