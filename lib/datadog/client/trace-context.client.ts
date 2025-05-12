/**
 * Trace Context Implementation for Client
 * 
 * Client-side implementation of trace context utilities.
 */

import { TraceContext, TraceContextInterface } from '../interfaces/trace-context';

/**
 * Client-side implementation of trace context utilities
 */
export const traceContext: TraceContextInterface = {
  /**
   * No-op implementation for client-side
   */
  extractTraceContext(): TraceContext | null {
    return null;
  },

  /**
   * No-op implementation for client-side
   * Returns the headers unchanged
   */
  injectTraceContextIntoHeaders(headers: Record<string, string>): Record<string, string> {
    return headers;
  },

  /**
   * No-op implementation for client-side
   */
  extractTraceContextFromHeaders(_headers: Record<string, string>, _spanName: string): any {
    return null;
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