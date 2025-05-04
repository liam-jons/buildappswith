/**
 * FilterPanel - Client Component
 * 
 * Provides filtering controls for the marketplace builder listing.
 * This is a client component using React hooks for state management.
 */

"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Internal utilities
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/marketplace/use-debounce";

// Internal components using barrel exports
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui/core";
import { Input } from "@/components/ui";

// Types and interfaces
interface FilterPanelProps {
  categories: {
    id: string;
    name: string;
    count: number;
  }[];
  className?: string;
}

/**
 * Marketplace Filter Panel
 * 
 * Provides filtering controls for the marketplace listing, including
 * category selection, search, and other filters.
 * 
 * @param categories - Available categories for filtering
 * @param className - Optional CSS class for styling
 */
export function FilterPanel({ 
  categories, 
  className 
}: FilterPanelProps) {
  // Get router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse current filters from URL
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";
  
  // Local state
  const [search, setSearch] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);
  const [isOpen, setIsOpen] = useState(false);
  
  // Debounce search to prevent excessive URL updates
  const debouncedSearch = useDebounce(search, 500);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    router.push(`?${params.toString()}`);
  }, [debouncedSearch, category, router, searchParams]);
  
  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setCategory(categoryId === category ? "" : categoryId);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  // Handle mobile filter toggle
  const toggleFilters = () => {
    setIsOpen(prev => !prev);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setCategory("");
  };
  
  // Main render
  return (
    <div className={cn("bg-card rounded-lg p-4 border", className)}>
      {/* Mobile filter toggle */}
      <div className="flex justify-between items-center lg:hidden mb-4">
        <Button variant="outline" onClick={toggleFilters}>
          {isOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        {(search || category) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        )}
      </div>
      
      {/* Filter content - responsive visibility */}
      <div className={cn(
        "space-y-4",
        isOpen ? "block" : "hidden lg:block"
      )}>
        {/* Search input */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Search</h3>
          <Input
            placeholder="Search builders..."
            value={search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        {/* Category selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={cat.id === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name} ({cat.count})
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Reset button - desktop */}
        <div className="hidden lg:block">
          {(search || category) && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
