"use client";

import { cn } from "@/lib/utils";
import { BuilderProfileListing } from "@/lib/marketplace/types";
import { BuilderCard } from "@/components/marketplace";

// Types and interfaces
interface BuilderListClientProps {
  builders: BuilderProfileListing[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Builder List Client Component
 * 
 * Client-side component that displays a grid of builder cards
 * Receives data from parent component
 */
export function BuilderListClient({ 
  builders,
  isLoading = false,
  emptyMessage = "No builders found",
  className 
}: BuilderListClientProps) {
  // Handle empty state or loading
  if ((!builders || builders.length === 0) && !isLoading) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No builders found</h3>
        <p className="text-muted-foreground mt-2">
          {emptyMessage}
        </p>
      </div>
    );
  }
  
  // Loading skeleton
  if (isLoading) {
    return <BuilderListSkeleton count={6} />;
  }
  
  // Render the builder list
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {builders.map((builder) => (
        <BuilderCard 
          key={builder.id} 
          builder={builder} 
        />
      ))}
    </div>
  );
}

// Skeleton loader for the builder list
function BuilderListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse"
        >
          <div className="h-48 bg-muted rounded-t-lg" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}