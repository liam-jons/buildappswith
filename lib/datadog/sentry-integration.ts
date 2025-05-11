/**
 * Datadog-Sentry Integration
 *
 * Provides bidirectional integration between Datadog and Sentry
 * SERVER-ONLY MODULE
 *
 * Note: This file should only be imported on the server side.
 */

import * as Sentry from '@sentry/nextjs';
import { getDatadogConfig } from './config';

// Ensure this code only runs on the server side
const isServer = typeof window === 'undefined';

// This file is server-only - safely import server dependencies
let tracer = null;
if (isServer) {
  try {
    // Safely import dd-trace only on server side
    // Using dynamic import to prevent client-side bundling
    const ddTrace = require('dd-trace');
    tracer = ddTrace.tracer;
  } catch (error) {
    console.warn('Failed to import dd-trace for Sentry integration - continuing without tracing');
  }
}

/**
 * Creates a URL to view a trace in the Datadog UI
 */
export function createDatadogTraceUrl(traceId: string, env = 'production'): string {
  const site = process.env.DATADOG_SITE || 'datadoghq.com';
  return `https://app.${site}/apm/trace/${traceId}?env=${env}`;
}

/**
 * Creates context data for Sentry based on the current Datadog trace
 * @returns Context data object or null if no active trace
 */
export function createDatadogTraceContext(): Record<string, any> | null {
  // Skip if not server side or tracer not available
  if (!isServer || !tracer) return null;

  try {
    const span = tracer.scope().active();
    if (!span) return null;

    const context = span.context();
    const traceId = context.toTraceId();
    const spanId = context.toSpanId();

    if (!traceId || !spanId) return null;

    const config = getDatadogConfig();
    const datadogUrl = createDatadogTraceUrl(traceId, config.env);

    return {
      datadog: {
        trace_id: traceId,
        span_id: spanId,
        trace_url: datadogUrl,
        service: config.service,
        env: config.env,
      },
    };
  } catch (error) {
    console.error('Failed to create Datadog trace context:', error);
    return null;
  }
}

/**
 * Sentry integration for Datadog
 * Adds hooks to automatically link errors to Datadog traces
 */
export class DatadogSentryIntegration implements Sentry.Integration {
  public static id: string = 'DatadogSentryIntegration';
  public name: string = DatadogSentryIntegration.id;

  constructor(private readonly options: {
    alwaysLinkTraces?: boolean;
  } = {}) {}

  setupOnce(
    addGlobalEventProcessor: (callback: Sentry.EventProcessor) => void,
  ): void {
    // Skip if not server side or tracer not available
    if (!isServer || !tracer) return;

    addGlobalEventProcessor((event: Sentry.Event) => {
      try {
        // Skip if no exception or already has Datadog context
        if (!event.exception || event.contexts?.datadog) {
          return event;
        }

        const span = tracer.scope().active();
        if (!span) return event;

        const context = span.context();
        const traceId = context.toTraceId();
        const spanId = context.toSpanId();

        if (!traceId || !spanId) return event;

        const config = getDatadogConfig();
        const datadogUrl = createDatadogTraceUrl(traceId, config.env);

        // Add Datadog context to event
        return {
          ...event,
          tags: {
            ...event.tags,
            'datadog.trace_id': traceId,
            'datadog.span_id': spanId,
            'datadog.service': config.service,
            'datadog.env': config.env,
          },
          contexts: {
            ...event.contexts,
            datadog: {
              trace_id: traceId,
              span_id: spanId,
              trace_url: datadogUrl,
              service: config.service,
              env: config.env,
            },
          },
        };
      } catch (error) {
        console.error('Error in DatadogSentryIntegration:', error);
        return event;
      }
    });
  }
}