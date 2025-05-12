/**
 * Server-only implementation of Datadog tracer
 * This file should only be imported on the server side
 *
 * NOTE: Do not use 'use server' directive here as this is not a React Server Action
 *
 * @version 2.0.0 - Using centralized initialization pattern
 */

import { getServerTracer, initializeServerTracer, isServer } from './init';

// Map to track auth spans
let authSpans = new Map();

// Initialize server tracer on module load
if (isServer) {
  initializeServerTracer();
}

/**
 * Simplified function to extract trace context
 */
export function extractServerTraceContext() {
  if (!isServer) {
    return null;
  }

  try {
    const tracer = getServerTracer();
    if (!tracer) return null;

    const span = tracer.scope().active();
    if (!span) return null;

    const context = span.context();
    return {
      traceId: context.toTraceId(),
      spanId: context.toSpanId(),
      service: 'buildappswith-platform',
      env: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    console.error('Failed to extract trace context:', error);
    return null;
  }
}

/**
 * Start a new auth span for tracking authentication performance
 *
 * @param path The request path
 * @param method The HTTP method
 * @param type The auth type (e.g., 'basic', 'role', 'permission')
 * @param userId Optional user ID
 * @returns A unique ID for the span
 */
export function startAuthSpan(path: string, method: string, type: string, userId?: string) {
  if (!isServer) {
    return null;
  }

  try {
    const tracer = getServerTracer();
    if (!tracer) return null;

    // Generate a unique ID for this span
    const spanId = `${method}-${path}-${Date.now()}`;

    // Start a new span
    const span = tracer.startSpan('auth.verify', {
      tags: {
        'resource.name': `${method} ${path}`,
        'span.type': 'web',
        'auth.type': type,
        ...(userId && { 'user.id': userId }),
      },
    });

    // Store the span
    authSpans.set(spanId, {
      span,
      startTime: performance.now(),
      path,
      method,
      type,
      userId,
    });

    return spanId;
  } catch (error) {
    console.error('Failed to start auth span:', error);
    return null;
  }
}

/**
 * Finish an auth span and record performance metrics
 *
 * @param spanId The ID returned from startAuthSpan
 * @param success Whether authentication was successful
 * @param error Optional error message
 */
export function finishAuthSpan(spanId: string, success: boolean, error?: string) {
  if (!isServer || !spanId) {
    return;
  }

  try {
    // Retrieve the span
    const spanData = authSpans.get(spanId);
    if (!spanData) {
      return;
    }

    const { span, startTime, path, method, type, userId } = spanData;

    // Calculate duration
    const duration = performance.now() - startTime;

    // Add completion tags
    span.addTags({
      'auth.duration': duration.toFixed(2),
      'auth.success': success,
      ...(error && { 'error.msg': error, 'error': true }),
      ...(userId && { 'user.id': userId }),
    });

    // Finish the span
    span.finish();

    // Remove the span from the map
    authSpans.delete(spanId);
  } catch (error) {
    console.error('Failed to finish auth span:', error);
  }
}

/**
 * Export the tracer - uses the singleton from init.ts
 */
export const tracer = isServer ? getServerTracer() : null;