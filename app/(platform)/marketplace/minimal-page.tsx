"use client";

/**
 * Minimal Marketplace Page
 * 
 * This is a minimal version of the marketplace page to fix the "Maximum update depth exceeded" error.
 * Access this page at: /marketplace/minimal-page
 */

import React, { useState, useEffect } from "react";
import { BuilderProfileListing } from "@/lib/marketplace/types";
import { Card, CardContent, CardHeader } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";

export default function MinimalMarketplacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [builders, setBuilders] = useState<BuilderProfileListing[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simple fetch with no dependencies on complex components
  useEffect(() => {
    const fetchBuilders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/marketplace/builders?sortBy=featured');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data fetched successfully:', data);
        setBuilders(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error loading builders:", err);
        setError(`Failed to load builders: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilders();
  }, []);

  return (
    <div className="container py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">
        Minimal Marketplace
      </h1>
      
      {isLoading && (
        <div className="p-8 text-center">
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
      
      {!isLoading && !error && (
        <>
          <p className="mb-6 text-muted-foreground">
            Found {builders.length} builders
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builders.map(builder => (
              <Card key={builder.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    {/* Simple avatar circle with initial */}
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {builder.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">{builder.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {builder.headline || builder.tagline || (builder.hourlyRate ? `$${builder.hourlyRate}/hr` : '')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3 mb-3">
                    {builder.bio || "This builder hasn't added a bio yet."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}