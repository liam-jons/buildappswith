/**
 * Empty Tracer Implementation for Client
 * 
 * This provides an empty implementation of the tracer interface for the browser.
 * Since APM tracing is a server-side concept, this provides no-op implementations
 * to maintain API compatibility.
 * 
 * This enhanced version also provides a default export to completely stub
 * the dd-trace module to prevent any Node.js code from being bundled.
 */

import { TracerInterface, TracerConfig, Span, SpanContext } from '../interfaces/tracer';
import { TraceContext } from '../interfaces/trace-context';

// Dummy span context implementation
const dummySpanContext: SpanContext = {
  toTraceId: () => '0000000000000000',
  toSpanId: () => '0000000000000000'
};

// Dummy span implementation
const dummySpan: Span = {
  context: () => dummySpanContext,
  finish: () => {},
  addTags: () => {}
};

/**
 * Client-side empty implementation of the Tracer interface
 */
export const tracer: TracerInterface = {
  /**
   * No-op init for client-side compatibility
   */
  init(_config: TracerConfig): any {
    return null;
  },

  /**
   * Always returns null on client
   */
  getInstance(): any {
    return null;
  },

  /**
   * Returns empty scope with no active span
   */
  scope() {
    return {
      active: () => null
    };
  },

  /**
   * Returns a dummy span that does nothing
   */
  startSpan(_name: string, _options?: any): Span {
    return dummySpan;
  },

  /**
   * No-op implementation for client-side
   */
  inject(_spanContext: any, _format: string, _carrier: any): void {
    // No-op
  },

  /**
   * No-op implementation for client-side
   */
  extract(_format: string, _carrier: any): any {
    return null;
  },

  /**
   * Always returns null on client-side
   */
  extractTraceContext(): TraceContext | null {
    return null;
  }
};

/**
 * Complete mock of dd-trace module for client-side use
 * 
 * This default export effectively stubs the entire dd-trace module
 * ensuring that no Node.js specific code is bundled for the client.
 * Any direct imports of dd-trace will use this mock implementation.
 */
const ddTraceMock = {
  init: () => null,
  use: () => null,
  tracer: () => tracer,
  scope: () => ({
    active: () => null,
    bind: (fn: any) => fn,
    activate: (span: any, fn: any) => fn()
  }),
  startSpan: () => dummySpan,
  extract: () => null,
  inject: () => null,
  // Additional methods commonly used from dd-trace
  wrap: (fn: any) => fn,
  trace: (_name: string, fn: any) => fn,
  setUrl: () => null,
  // Runtime metrics
  runtimeMetrics: {
    enable: () => null,
    start: () => null,
    stop: () => null
  },
  // Additional compatibility with the dd-trace API
  version: '0.0.0-stub',
  confg: {},
  appsec: {
    enable: () => null,
    disable: () => null
  },
  dogstatsd: {
    socket: null
  }
};

// Export the mock as default for direct imports
export default ddTraceMock;