"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState, useEffect } from "react";

// Internal utilities
import { cn } from "@/lib/utils";
import { useLearningState } from "@/hooks/learning/use-learning-state";

// Internal components using barrel exports
import { Button } from "@/components/ui";

// Types and interfaces
interface TimelineFilterProps {
  categories: string[];
  initialCategory?: string;
  onChange?: (category: string) => void;
  className?: string;
}

/**
 * Timeline Filter Component
 * 
 * An interactive filter for the AI capability timeline that allows
 * users to filter content by category, capability status, or time period.
 * 
 * @param categories - List of available categories to filter by
 * @param initialCategory - Optional initial selected category
 * @param onChange - Callback when the filter changes
 * @param className - Optional additional classes
 */
export function TimelineFilter({ 
  categories,
  initialCategory,
  onChange,
  className
}: TimelineFilterProps) {
  // State and hooks
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const { loading, error } = useLearningState();
  
  // Effect to notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(selectedCategory);
    }
  }, [selectedCategory, onChange]);
  
  // Event handlers
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className={cn("timeline-filter p-4 bg-gray-50 rounded-lg animate-pulse", className)}>
        <div className="h-8 bg-gray-200 rounded-md w-full mb-2"></div>
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-md w-24"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={cn("timeline-filter p-4 bg-red-50 rounded-lg", className)}>
        <p className="text-red-500 mb-2">Failed to load filter options</p>
        <Button variant="outline" size="sm">Retry</Button>
      </div>
    );
  }
  
  return (
    <div className={cn("timeline-filter p-4 bg-gray-50 rounded-lg", className)}>
      <h4 className="text-sm font-medium mb-2">Filter by Category</h4>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("all")}
        >
          All Categories
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
