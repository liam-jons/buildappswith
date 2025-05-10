"use client";

/**
 * Ultra-minimal marketplace page
 * 
 * This version contains no dynamic data or complex components
 * to verify if the issue is with specific components or the page structure.
 */

import React from "react";

export default function UltraMinimalMarketplace() {
  return (
    <div className="container py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">
        Ultra Minimal Marketplace
      </h1>
      <p className="text-muted-foreground mb-6">
        This is a static page with no data fetching or complex components.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xl font-semibold">B</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Builder {i + 1}</h3>
                <p className="text-sm text-muted-foreground">App Developer</p>
              </div>
            </div>
            <p className="text-sm mb-4">
              A professional developer specializing in AI applications.
            </p>
            <button 
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md"
              onClick={() => console.log(`Button clicked for builder ${i + 1}`)}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}