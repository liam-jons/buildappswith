/**
 * Trace Context Implementation for Server
 * 
 * Server-side implementation of trace context utilities.
 */

import { TraceContext, TraceContextInterface } from '../interfaces/trace-context';
import { tracer } from './tracer.server';
import { getDatadogConfig } from '../config/base-config';

/**
 * Server-side implementation of trace context utilities
 */
export const traceContext: TraceContextInterface = {
  /**
   * Extract trace context from the current active span
   */
  extractTraceContext(): TraceContext | null {
    return tracer.extractTraceContext();
  },

  /**
   * Injects trace context into HTTP headers for distributed tracing
   */
  injectTraceContextIntoHeaders(headers: Record<string, string> = {}): Record<string, string> {
    // Skip if tracer not available or no active span
    const span = tracer.scope().active();
    if (!span) return headers;

    const newHeaders = { ...headers };
    try {
      tracer.inject(span.context(), 'http_headers', newHeaders);
    } catch (error) {
      console.error('Failed to inject trace context into headers:', error);
    }
    
    return newHeaders;
  },

  /**
   * Extracts trace context from headers and creates a child span
   */
  extractTraceContextFromHeaders(headers: Record<string, string>, spanName: string): any {
    try {
      const config = getDatadogConfig();
      if (!config.enabled) return null;

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
  },

  /**
   * Serializes trace context to a JSON string for client storage
   */
  serializeTraceContext(context: TraceContext | null): string {
    if (!context) return '';
    return JSON.stringify(context);
  },

  /**
   * Deserializes trace context from a JSON string
   */
  deserializeTraceContext(serializedContext: string): TraceContext | null {
    try {
      if (!serializedContext) return null;
      return JSON.parse(serializedContext) as TraceContext;
    } catch (error) {
      console.error('Failed to deserialize trace context:', error);
      return null;
    }
  }
};