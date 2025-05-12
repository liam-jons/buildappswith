/**
 * Datadog Tracer Interface
 * 
 * This file defines the interface for interacting with Datadog APM tracer
 * in a platform-agnostic way. Implementations for different environments
 * are provided separately.
 */

import { DatadogEnvironment } from '../config/base-config';
import { TraceContext } from './trace-context';

/**
 * Configuration for Datadog Tracer
 */
export interface TracerConfig {
  enabled: boolean;
  service: string;
  env: DatadogEnvironment;
  version: string;
  site: string;
  sampleRate: number;
  logInjection: boolean;
  profiling: boolean;
  debug: boolean;
}

/**
 * Basic span context interface
 */
export interface SpanContext {
  toTraceId(): string;
  toSpanId(): string;
}

/**
 * Basic span interface
 */
export interface Span {
  context(): SpanContext;
  finish(): void;
  addTags(tags: Record<string, any>): void;
}

/**
 * Interface for Datadog Tracer operations
 */
export interface TracerInterface {
  /**
   * Initialize the tracer
   * @param config Configuration for tracer
   * @returns The tracer instance or null if initialization fails
   */
  init(config: TracerConfig): any;

  /**
   * Get the tracer instance
   */
  getInstance(): any;

  /**
   * Get the active scope
   */
  scope(): {
    active(): Span | null;
  };

  /**
   * Start a new span
   * @param name Span name
   * @param options Span options
   * @returns The created span
   */
  startSpan(name: string, options?: any): Span;

  /**
   * Inject span context into a carrier for distributed tracing
   * @param spanContext Span context
   * @param format Format type (e.g., 'http_headers')
   * @param carrier Carrier object to inject into
   */
  inject(spanContext: any, format: string, carrier: any): void;

  /**
   * Extract span context from a carrier
   * @param format Format type (e.g., 'http_headers')
   * @param carrier Carrier object to extract from
   * @returns The extracted span context
   */
  extract(format: string, carrier: any): any;

  /**
   * Extract the current trace context
   * @returns Trace context information or null
   */
  extractTraceContext(): TraceContext | null;
}