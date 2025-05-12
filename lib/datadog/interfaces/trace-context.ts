/**
 * Datadog Trace Context Interface
 * 
 * Defines the trace context structure for distributed tracing
 * between client and server environments.
 */

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
 * Interface for trace context utilities
 */
export interface TraceContextInterface {
  /**
   * Extracts the current trace context
   * @returns Trace context information or null
   */
  extractTraceContext(): TraceContext | null;

  /**
   * Injects trace context into HTTP headers for distributed tracing
   * @param headers Existing headers object to inject into
   * @returns Headers with trace context injected
   */
  injectTraceContextIntoHeaders(headers: Record<string, string>): Record<string, string>;

  /**
   * Extracts trace context from headers and creates a child span
   * @param headers The headers containing trace context
   * @param spanName The name of the new span to create
   * @returns The created span or null if extraction failed
   */
  extractTraceContextFromHeaders(headers: Record<string, string>, spanName: string): any;

  /**
   * Serializes trace context to a JSON string for client storage
   * @param context The trace context to serialize
   * @returns Serialized context as string
   */
  serializeTraceContext(context: TraceContext | null): string;

  /**
   * Deserializes trace context from a JSON string
   * @param serializedContext The serialized context from client
   * @returns Parsed trace context or null if invalid
   */
  deserializeTraceContext(serializedContext: string): TraceContext | null;
}