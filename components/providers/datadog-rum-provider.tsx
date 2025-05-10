"use client";

import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";
import { getRumConfiguration, validateRumEnvironmentVariables, sanitizeRumUserInfo } from "@/lib/datadog/rum-config";
import { useAuth } from "@clerk/nextjs";
import type { TraceContext } from "@/lib/datadog/context-propagation";

// Only import these functions on the client side
const serializeTraceContext = (context: TraceContext | null): string => {
  if (!context) return '';
  return JSON.stringify(context);
};

const deserializeTraceContext = (serializedContext: string): TraceContext | null => {
  try {
    if (!serializedContext) return null;
    return JSON.parse(serializedContext) as TraceContext;
  } catch (error) {
    console.error('Failed to deserialize trace context:', error);
    return null;
  }
};

// Add type definition for window to store initialization status
declare global {
  interface Window {
    __DD_RUM_INITIALIZED__?: boolean;
  }
}

export interface DatadogRumProviderProps {
  children: React.ReactNode;
  traceContext?: TraceContext | null;
}

/**
 * Datadog RUM Provider component
 * 
 * This provider initializes Datadog Real User Monitoring (RUM) on the client side
 * and manages user context for session tracking
 */
export function DatadogRumProvider({ children, traceContext }: DatadogRumProviderProps) {
  const { userId, user, isSignedIn } = useAuth();

  useEffect(() => {
    // Skip if already initialized or not in browser
    if (typeof window === "undefined" || window.__DD_RUM_INITIALIZED__) {
      return;
    }

    // Get configuration
    const config = getRumConfiguration();
    
    // Skip if disabled or missing environment variables
    if (!config.enabled || !validateRumEnvironmentVariables()) {
      return;
    }

    try {
      // Initialize RUM
      datadogRum.init({
        applicationId: config.applicationId,
        clientToken: config.clientToken,
        site: config.site,
        service: config.service,
        env: config.env,
        version: config.version,
        sessionSampleRate: config.sessionSampleRate,
        sessionReplaySampleRate: config.sessionReplaySampleRate,
        trackUserInteractions: config.trackInteractions,
        trackResources: config.trackResources,
        trackLongTasks: config.trackLongTasks,
        defaultPrivacyLevel: config.defaultPrivacyLevel,
        actionNameAttribute: config.actionNameAttribute,
        beforeSend: (event) => {
          // You can modify or filter events before they're sent to Datadog
          return event;
        },
      });

      // Initialize trace context for linking server and client traces if available
      if (traceContext) {
        datadogRum.setGlobalContext({
          traceId: traceContext.traceId,
          spanId: traceContext.spanId,
        });
      }

      // Set initialization flag
      window.__DD_RUM_INITIALIZED__ = true;
      
      console.log(`Datadog RUM initialized for ${config.env} environment`);
    } catch (error) {
      console.error("Failed to initialize Datadog RUM:", error);
    }
  }, []); // Initialize only once

  // Update user information when auth state changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.__DD_RUM_INITIALIZED__) {
      return;
    }

    try {
      if (isSignedIn && userId && user) {
        // Add user identification if available
        datadogRum.setUser(
          sanitizeRumUserInfo({
            id: userId,
            name: user.fullName || undefined,
            email: user.primaryEmailAddress?.emailAddress,
            role: user.publicMetadata?.role as string | undefined,
          })
        );
      } else {
        // Clear user data when signed out
        datadogRum.removeUser();
      }
    } catch (error) {
      console.error("Failed to update Datadog RUM user:", error);
    }
  }, [userId, user, isSignedIn]);

  return <>{children}</>;
}

/**
 * Utility to store trace context in localStorage for SPA navigation
 */
export function storeTraceContext(context: TraceContext | null): void {
  if (typeof window === "undefined") return;
  
  try {
    const serialized = serializeTraceContext(context);
    if (serialized) {
      localStorage.setItem("dd-trace-context", serialized);
    }
  } catch (error) {
    console.error("Failed to store trace context:", error);
  }
}

/**
 * Utility to retrieve trace context from localStorage
 */
export function retrieveTraceContext(): TraceContext | null {
  if (typeof window === "undefined") return null;
  
  try {
    const serialized = localStorage.getItem("dd-trace-context");
    return serialized ? deserializeTraceContext(serialized) : null;
  } catch (error) {
    console.error("Failed to retrieve trace context:", error);
    return null;
  }
}