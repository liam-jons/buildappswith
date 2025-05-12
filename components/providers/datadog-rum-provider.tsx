"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// NOTE: Datadog monitoring is temporarily disabled to resolve build issues
// This provider is kept in place but will not initialize any RUM functionality

/**
 * Basic trace context interface for type checking
 */
interface TraceContext {
  traceId: string;
  spanId: string;
  service?: string;
  env?: string;
}

/**
 * Datadog RUM Provider component
 * 
 * NOTE: This is a placeholder version with Datadog functionality disabled
 * to resolve build issues. The full implementation will be restored later.
 */
export function DatadogRumProvider({ 
  children, 
  traceContext: initialTraceContext 
}: { 
  children: React.ReactNode; 
  traceContext?: TraceContext | null;
}) {
  const { userId, user, isSignedIn } = useAuth();

  // Add a console message showing that monitoring is disabled
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('NOTE: Datadog RUM monitoring is temporarily disabled to resolve build issues');
    }
  }, []);

  // Just render children without any RUM initialization
  return <>{children}</>;
}

/**
 * Utility to store trace context - temporarily disabled
 */
export function storeTraceContext(context: TraceContext | null): void {
  // Functionality temporarily disabled
}

/**
 * Utility to retrieve trace context - temporarily disabled
 */
export function retrieveTraceContext(): TraceContext | null {
  return null;
}