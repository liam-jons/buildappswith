"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React from "react";
import { ProgressiveLoadingState } from "./progressive-loading-state";

export interface OptimizedAuthLoadingStateProps {
  children: React.ReactNode;
  maxWaitTime?: number;
}

// Public routes that don't need auth loading state
const publicPaths = [
  "/",
  "/marketplace",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/toolkit",
  "/how-it-works",
];

/**
 * Optimized authentication loading state component
 * Only shows loading state on protected routes
 */
export function OptimizedAuthLoadingState({
  children,
  maxWaitTime = 3000 // Reduced from 8000 for public pages
}: OptimizedAuthLoadingStateProps) {
  const { isLoaded } = useAuth();
  const pathname = usePathname();
  const [forceRender, setForceRender] = React.useState(false);
  
  // Check if we're on a public path
  const isPublicPath = React.useMemo(() => {
    // Handle null pathname safely
    if (!pathname) return true; // Treat null pathname as public for safety
    
    return publicPaths.some(path => 
      pathname === path || 
      pathname.startsWith(`${path}/`) ||
      pathname.startsWith("/marketplace/") ||
      pathname.startsWith("/api/marketplace/") ||
      pathname.match(/^\/images\//) ||
      pathname.match(/^\/fonts\//) ||
      pathname.match(/^\/static\//)
    );
  }, [pathname]);

  React.useEffect(() => {
    // For public paths, force render immediately
    if (isPublicPath) {
      setForceRender(true);
      return;
    }

    // For protected paths, use a timeout
    const timer = setTimeout(() => {
      setForceRender(true);
    }, maxWaitTime);

    return () => clearTimeout(timer);
  }, [isPublicPath, maxWaitTime]);

  // On public paths or when forced, render immediately
  if (isPublicPath || forceRender || isLoaded) {
    return <>{children}</>;
  }

  // Show loading state only on protected routes
  return <ProgressiveLoadingState state="connecting" />;
}