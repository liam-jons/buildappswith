/**
 * BuilderList - Server Component
 * 
 * Displays a list of builders with filtering and sorting capabilities.
 * This is a server component that fetches data server-side for improved performance.
 */

import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { getBuilders } from "@/lib/marketplace/actions";
import { BuilderCard } from "@/components/marketplace";

// Types and interfaces
interface BuilderListProps {
  categoryId?: string;
  searchQuery?: string;
  sortBy?: string;
  className?: string;
}

/**
 * Builder List Component
 * 
 * Displays a list of builders with filtering and sorting options.
 * Fetches data server-side for improved performance and SEO.
 * 
 * @param categoryId - Optional category filter ID
 * @param searchQuery - Optional search query for filtering
 * @param sortBy - Optional sorting parameter
 * @param className - Optional CSS class for styling
 */
export async function BuilderList({ 
  categoryId, 
  searchQuery, 
  sortBy = "recommended",
  className 
}: BuilderListProps) {
  // Server-side data fetching
  const builders = await getBuilders({ categoryId, searchQuery, sortBy });
  
  // Error handling
  if (!builders || builders.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No builders found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }
  
  // Render the builder list with proper loading fallback
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      <Suspense fallback={<BuilderListSkeleton count={builders.length} />}>
        {builders.map((builder) => (
          <BuilderCard 
            key={builder.id} 
            builder={builder} 
          />
        ))}
      </Suspense>
    </div>
  );
}

// Skeleton loader for the builder list
function BuilderListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
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
    </>
  );
}
