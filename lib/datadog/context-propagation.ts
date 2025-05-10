/**
 * Datadog Context Propagation
 *
 * Utilities for propagating trace context between client and server
 * 
 * NOTE: This module is designed to work in both client and server environments
 * by using feature detection to determine which functionality is available.
 */

import { getDatadogConfig } from './config';

/**
 * Represents the essential trace context information
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  service?: string;
  version?: string;
  env?: string;
}

/**
 * Extracts the current trace context for client propagation
 * This is used to continue traces across client/server boundaries
 * 
 * Note: This function only works on the server side
 */
export function extractTraceContext(): TraceContext | null {
  // Skip if in browser environment
  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    // Dynamically load server-only tracer
    const { extractServerTraceContext } = require('./server-tracer');
    return extractServerTraceContext();
  } catch (error) {
    console.error('Failed to extract trace context:', error);
    return null;
  }
}

/**
 * Injects trace context into HTTP headers for distributed tracing
 * 
 * Note: This function only works on the server side
 * 
 * @param headers Existing headers object to inject into
 * @returns Headers with trace context injected
 */
export function injectTraceContextIntoHeaders(
  headers: Record<string, string> = {}
): Record<string, string> {
  // Skip if in browser environment
  if (typeof window !== 'undefined') {
    return headers;
  }

  try {
    // Try to load the server-only module
    let tracer;
    try {
      tracer = require('./server-tracer').tracer;
    } catch (e) {
      return headers;
    }
    
    if (!tracer) return headers;
    
    const span = tracer.scope().active();
    if (!span) return headers;

    const newHeaders = { ...headers };
    tracer.inject(span.context(), 'http_headers', newHeaders);

    return newHeaders;
  } catch (error) {
    console.error('Failed to inject trace context into headers:', error);
    return headers;
  }
}

/**
 * Extracts trace context from headers and creates a child span
 * 
 * Note: This function only works on the server side
 * 
 * @param headers The headers containing trace context
 * @param spanName The name of the new span to create
 * @returns The created span or null if extraction failed
 */
export function extractTraceContextFromHeaders(
  headers: Record<string, string>,
  spanName: string
): any {
  // Skip if in browser environment
  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    const config = getDatadogConfig();
    if (!config.enabled) return null;

    // Try to load the server-only module
    let tracer;
    try {
      tracer = require('./server-tracer').tracer;
    } catch (e) {
      return null;
    }
    
    if (!tracer) return null;

    // Extract the trace context from headers
    const context = tracer.extract('http_headers', headers);
    if (!context) return null;

    // Create a new span as a child of the extracted context
    const span = tracer.startSpan(spanName, {
      childOf: context,
      tags: {
        service: config.service,
        version: config.version,
        env: config.env,
      },
    });

    return span;
  } catch (error) {
    console.error('Failed to extract trace context from headers:', error);
    return null;
  }
}

/**
 * Serializes trace context to a JSON string for client storage
 * @param context The trace context to serialize
 * @returns Serialized context as string
 */
export function serializeTraceContext(context: TraceContext | null): string {
  if (!context) return '';
  return JSON.stringify(context);
}

/**
 * Deserializes trace context from a JSON string
 * @param serializedContext The serialized context from client
 * @returns Parsed trace context or null if invalid
 */
export function deserializeTraceContext(serializedContext: string): TraceContext | null {
  try {
    if (!serializedContext) return null;
    return JSON.parse(serializedContext) as TraceContext;
  } catch (error) {
    console.error('Failed to deserialize trace context:', error);
    return null;
  }
}