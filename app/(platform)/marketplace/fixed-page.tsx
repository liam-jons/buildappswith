"use client";

/**
 * Fixed Marketplace Page
 * 
 * This version has been rebuilt to resolve the "Maximum update depth exceeded" error.
 * It uses:
 * 1. Link components instead of window.location redirects
 * 2. Static initial values for state to prevent dependency loops
 * 3. Simplified rendering with proper error boundaries
 * 4. No image state management complexity
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";

// Simple placeholder interface to avoid importing potentially problematic types
interface BuilderListing {
  id: string;
  name: string;
  bio?: string;
  headline?: string;
  tagline?: string;
  hourlyRate?: number;
}

export default function FixedMarketplacePage() {
  // Basic state with defaults to prevent loops
  const [isLoading, setIsLoading] = useState(true);
  const [builders, setBuilders] = useState<BuilderListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Function to fetch data separated from effect for clarity
    async function fetchBuilders() {
      try {
        console.log("Fetching builders data...");
        const response = await fetch('/api/marketplace/builders?sortBy=featured');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Map only necessary fields to prevent rendering issues
        const simplifiedData = result.data.map((builder: any) => ({
          id: builder.id,
          name: builder.name || "Unknown",
          bio: builder.bio,
          headline: builder.headline,
          tagline: builder.tagline,
          hourlyRate: builder.hourlyRate
        }));
        
        setBuilders(simplifiedData);
      } catch (err) {
        console.error("Error loading builders:", err);
        setError(`Failed to load builders: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBuilders();
  }, []); // Empty dependency array to run only once
  
  // Helper to format display subtitle
  const getSubtitle = (builder: BuilderListing) => {
    return builder.headline || builder.tagline || (builder.hourlyRate ? `$${builder.hourlyRate}/hr` : '');
  };
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Application Builders</h1>
        <p className="text-muted-foreground mb-4">
          Find skilled builders to help bring your AI application ideas to life
        </p>
      </div>
      
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-lg">Loading builders...</p>
        </div>
      )}
      
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && !error && builders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg">No builders found</p>
        </div>
      )}
      
      {!isLoading && !error && builders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builders.map(builder => (
            <Card key={builder.id} className="overflow-hidden h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  {/* Simple static avatar circle with initial to avoid image loading issues */}
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {builder.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{builder.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getSubtitle(builder)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm line-clamp-3 mb-4">
                  {builder.bio || "This builder hasn't added a bio yet."}
                </p>
                
                <Link href={`/marketplace/builders/${builder.id}`} passHref>
                  <Button variant="default" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}