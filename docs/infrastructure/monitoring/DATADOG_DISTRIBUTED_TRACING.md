# Distributed Tracing Approach for Critical User Flows

## 1. Overview

This document outlines the distributed tracing implementation approach for the Buildappswith platform using Datadog APM. The goal is to establish end-to-end visibility into critical user flows, spanning client-side interactions, API calls, server processing, database operations, and third-party service integrations. This comprehensive tracing system will enable better performance optimization, faster debugging, and improved understanding of user experience across the entire application stack.

## 2. Core Objectives

- Implement end-to-end distributed tracing for critical user flows
- Connect frontend interactions with backend processing
- Identify performance bottlenecks across the application stack
- Enable correlation between user actions and system behavior
- Provide business context to technical performance data
- Support cross-service and cross-environment tracing

## 3. Critical User Flows

The following user flows have been identified as critical for tracing:

### 3.1 Authentication Flow

- User signup process
- User login process
- Password reset flow
- Social auth integration
- Profile verification

### 3.2 Booking Flow

- Session type selection
- Builder/expert discovery
- Scheduling/calendar interaction
- Booking confirmation
- Payment processing
- Notification delivery

### 3.3 Marketplace Flow

- Builder search and discovery
- Filtering and search
- Builder profile viewing
- Contact/booking initiation
- Portfolio review

### 3.4 Profile Management Flow

- Profile creation/editing
- Portfolio upload
- Social links integration
- Session type configuration
- Schedule management

### 3.5 Payment Processing Flow

- Payment method selection
- Payment authorization
- Payment confirmation
- Receipt generation
- Subscription management

## 4. Distributed Tracing Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                       User Device                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐   ┌────────────────┐   ┌──────────────────┐   │
│  │ RUM Tracking   │   │ User Actions   │   │ Performance      │   │
│  │ (Browser)      │───┤ (Client)       │───┤ Metrics          │   │
│  └───────┬────────┘   └───────┬────────┘   └────────┬─────────┘   │
│          │                    │                     │             │
└──────────┼────────────────────┼─────────────────────┼─────────────┘
           │                    │                     │
           ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Context Propagation Layer                     │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    Server-Side Processing                              │
├────────────────┬───────────────────┬────────────────┬─────────────────┤
│ Next.js Edge   │ Next.js API       │ Server         │ Server          │
│ Middleware     │ Routes            │ Actions        │ Components       │
└────────┬───────┴────────┬──────────┴────────┬───────┴────────┬─────────┘
         │                │                   │                │
         ▼                ▼                   ▼                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Persistence & External Services                     │
├────────────────┬───────────────────┬────────────────┬──────────────────┤
│ Database       │ Cache             │ External APIs  │ Third-party      │
│ Operations     │ Operations        │ Calls          │ Services         │
└────────┬───────┴────────┬──────────┴────────┬───────┴────────┬─────────┘
         │                │                   │                │
         └────────────────┴───────────────────┴────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Datadog APM & Distributed Tracing                   │
├────────────────┬───────────────────┬────────────────┬──────────────────┤
│ Trace          │ Spans             │ Service Maps   │ Metrics &        │
│ Visualization  │ Analytics         │                │ Dashboards       │
└────────────────┴───────────────────┴────────────────┴──────────────────┘
```

## 5. Implementation Components

### 5.1 Trace Context Propagation

The foundation of effective distributed tracing is consistent context propagation across system boundaries:

```typescript
// lib/datadog/context-propagation.ts
import { tracer } from 'dd-trace';
import { datadogRum } from '@datadog/browser-rum';

/**
 * Interface for trace context information
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  service?: string;
  version?: string;
  env?: string;
}

/**
 * Extract trace context to be sent to client
 * Used in API responses and when sending data to client
 */
export function extractTraceContext(): TraceContext | null {
  try {
    // Get current active span
    const span = tracer.scope().active();
    if (!span) return null;
    
    // Extract context from the span
    const context = span.context();
    
    return {
      traceId: context.toTraceId(),
      spanId: context.toSpanId(),
      service: process.env.DATADOG_SERVICE_NAME || 'buildappswith-platform',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      env: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    console.error('Failed to extract trace context:', error);
    return null;
  }
}

/**
 * Inject trace context into HTTP headers
 * Used when making HTTP requests to propagate context
 */
export function injectTraceContextIntoHeaders(headers: Record<string, string> = {}): Record<string, string> {
  try {
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
 * Continue trace from client to server
 * Used in API routes to continue a trace started on the client
 */
export function continueTraceFromClient(
  headers: Record<string, string>,
  operationName: string
): void {
  try {
    const extractedContext = tracer.extract('http_headers', headers);
    if (extractedContext) {
      tracer.trace(operationName, {
        childOf: extractedContext,
      });
    }
  } catch (error) {
    console.error('Failed to continue trace from client:', error);
  }
}

/**
 * Send trace context to the client-side RUM
 * This connects server-side traces with client-side RUM sessions
 */
export function connectTraceWithRum(traceContext: TraceContext): void {
  if (typeof window === 'undefined' || !datadogRum) return;
  
  try {
    datadogRum.startSessionReplayRecording();
    
    // Connect current RUM session with the trace
    datadogRum.addRumGlobalContext('trace', {
      trace_id: traceContext.traceId,
      span_id: traceContext.spanId,
    });
  } catch (error) {
    console.error('Failed to connect trace with RUM:', error);
  }
}
```

### 5.2 Server-Side Tracing Implementation

Implement middleware and tracing hooks for server components:

```typescript
// lib/datadog/server-tracing.ts
import { tracer } from 'dd-trace';
import { NextRequest, NextResponse } from 'next/server';
import { extractTraceContext, continueTraceFromClient } from './context-propagation';

/**
 * Enum for different operation types in the system
 */
export enum OperationType {
  API_REQUEST = 'api.request',
  API_RESPONSE = 'api.response',
  SERVER_ACTION = 'server.action',
  DATABASE_QUERY = 'db.query',
  EXTERNAL_API = 'external.api',
  AUTHENTICATION = 'auth.operation',
  VALIDATION = 'validation',
  MIDDLEWARE = 'middleware',
  RENDERING = 'render',
}

/**
 * Start a new trace span for an operation
 * @param name Operation name
 * @param type Operation type
 * @param metadata Additional metadata for the span
 * @returns A span object that must be finished
 */
export function startOperation(
  name: string,
  type: OperationType | string,
  metadata: Record<string, any> = {}
) {
  return tracer.startSpan(`${type}.${name}`, {
    tags: {
      'operation.name': name,
      'operation.type': type,
      ...metadata,
    },
  });
}

/**
 * Wrap an async function with tracing
 * @param name Operation name
 * @param type Operation type
 * @param fn The async function to trace
 * @param metadata Additional metadata for the span
 */
export async function traceOperation<T>(
  name: string,
  type: OperationType | string,
  fn: () => Promise<T>,
  metadata: Record<string, any> = {}
): Promise<T> {
  const span = startOperation(name, type, metadata);
  
  try {
    const result = await fn();
    span.finish();
    return result;
  } catch (error) {
    // Tag span with error information
    span.setTag('error', true);
    span.setTag('error.type', error.name);
    span.setTag('error.msg', error.message);
    span.setTag('error.stack', error.stack);
    
    span.finish();
    throw error;
  }
}

/**
 * Middleware to trace API requests
 * This should be used with Next.js middleware
 */
export function traceApiMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>
) {
  // Extract path and method
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  // Continue trace if context exists in headers
  continueTraceFromClient(
    Object.fromEntries(req.headers.entries()),
    `${method} ${path}`
  );
  
  // Create a new span for the API request
  return traceOperation(
    path,
    OperationType.API_REQUEST,
    next,
    {
      'http.method': method,
      'http.url': path,
      'http.query': url.search,
    }
  );
}

/**
 * Middleware to trace server-side rendering
 */
export function traceRenderMiddleware(
  pathname: string,
  next: () => Promise<any>
) {
  return traceOperation(
    pathname,
    OperationType.RENDERING,
    next,
    {
      'page.path': pathname,
      'rendering.type': 'server',
    }
  );
}
```

### 5.3 API Route Tracing

Implement tracing for Next.js API routes:

```typescript
// lib/datadog/api-tracing.ts
import { tracer } from 'dd-trace';
import { NextRequest, NextResponse } from 'next/server';
import { OperationType, traceOperation } from './server-tracing';
import { extractTraceContext, continueTraceFromClient } from './context-propagation';

/**
 * Higher-order function to trace API routes
 * @param handler The API route handler
 * @param routeName Name for the route (used for tracing)
 */
export function withApiTracing(
  handler: (req: NextRequest) => Promise<NextResponse>,
  routeName?: string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const url = new URL(req.url);
    const path = routeName || url.pathname;
    const method = req.method;
    
    // Continue trace if context exists in headers
    continueTraceFromClient(
      Object.fromEntries(req.headers.entries()),
      `${method} ${path}`
    );
    
    return traceOperation(
      path,
      OperationType.API_REQUEST,
      async () => {
        // Process the request and get response
        const response = await handler(req);
        
        // Add trace context to response headers for client continuation
        const traceContext = extractTraceContext();
        if (traceContext) {
          response.headers.set('x-datadog-trace-id', traceContext.traceId);
          response.headers.set('x-datadog-parent-id', traceContext.spanId);
        }
        
        return response;
      },
      {
        'http.method': method,
        'http.url': path,
        'http.query': url.search,
      }
    );
  };
}

/**
 * Example usage for an API route:
 * 
 * export const GET = withApiTracing(async (req) => {
 *   // API implementation
 *   return NextResponse.json({ data: 'example' });
 * }, 'api.example.get');
 */
```

### 5.4 Server Action Tracing

Implement tracing for Next.js server actions:

```typescript
// lib/datadog/server-action-tracing.ts
import { tracer } from 'dd-trace';
import { OperationType, traceOperation } from './server-tracing';
import { extractTraceContext } from './context-propagation';

/**
 * Higher-order function to trace server actions
 * @param actionName Name of the server action
 * @param actionFn The server action function
 * @param metadata Additional metadata for the trace
 */
export function traceServerAction<Args extends any[], Return>(
  actionName: string,
  actionFn: (...args: Args) => Promise<Return>,
  metadata: Record<string, any> = {}
): (...args: Args) => Promise<Return> {
  return async (...args: Args): Promise<Return> => {
    return traceOperation(
      actionName,
      OperationType.SERVER_ACTION,
      async () => {
        // Add args length as metadata to help with debugging
        const spanMetadata = {
          ...metadata,
          'args.count': args.length,
        };
        
        // Execute the action
        const result = await actionFn(...args);
        
        // Extract trace context to return to client
        const traceContext = extractTraceContext();
        
        // If result is an object, attach trace context
        if (result && typeof result === 'object') {
          Object.defineProperty(result, '__traceContext', {
            value: traceContext,
            enumerable: false,
          });
        }
        
        return result;
      },
      metadata
    );
  };
}

/**
 * Example usage:
 * 
 * export const createBooking = traceServerAction(
 *   'booking.create',
 *   async (bookingData) => {
 *     // Implementation
 *     return { id: 'new-booking-id' };
 *   },
 *   { domain: 'booking' }
 * );
 */
```

### 5.5 Database Operation Tracing

Implement tracing for database operations:

```typescript
// lib/datadog/db-tracing.ts
import { tracer } from 'dd-trace';
import { PrismaClient } from '@prisma/client';
import { OperationType, traceOperation } from './server-tracing';

// Extend PrismaClient to include tracing
export function createTracedPrismaClient(): PrismaClient {
  const prisma = new PrismaClient();
  
  // Auto-instrument with Datadog APM
  // NOTE: dd-trace automatically instruments Prisma
  // This adds additional context and metadata to the traces
  
  // Add custom tracing helper
  const tracedPrisma = prisma.$extends({
    name: 'DatadogTracingExtension',
    query: {
      async $allOperations({ operation, model, args, query }) {
        const operationName = `${model}.${operation}`;
        
        return traceOperation(
          operationName,
          OperationType.DATABASE_QUERY,
          () => query(args),
          {
            'db.model': model,
            'db.operation': operation,
            'db.args': JSON.stringify(sanitizeDbArgs(args)).substring(0, 1024),
          }
        );
      },
    },
  });
  
  return tracedPrisma;
}

/**
 * Sanitize database arguments to remove sensitive information
 * and limit payload size
 */
function sanitizeDbArgs(args: any): any {
  if (!args) return args;
  
  // Create a clone to avoid modifying the original object
  const sanitized = { ...args };
  
  // Sanitize known sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'credentials', 'credit_card'];
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeDbArgs(sanitized[key]);
    } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Usage example:
 * 
 * const prisma = createTracedPrismaClient();
 * const user = await prisma.user.findUnique({ where: { id: userId } });
 */
```

### 5.6 External API Call Tracing

Implement tracing for external API calls:

```typescript
// lib/datadog/external-api-tracing.ts
import { tracer } from 'dd-trace';
import { OperationType, traceOperation } from './server-tracing';
import { injectTraceContextIntoHeaders } from './context-propagation';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Traced fetch function for external API calls
 * This propagates the trace context to external services
 * that support Datadog distributed tracing
 */
export async function tracedFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const urlObj = new URL(url);
  const serviceName = urlObj.hostname;
  const path = urlObj.pathname;
  const method = options.method || 'GET';
  
  // Add trace context to headers
  const headers = injectTraceContextIntoHeaders(
    options.headers as Record<string, string> || {}
  );
  
  // Add timeout if specified
  const controller = options.timeout
    ? new AbortController()
    : undefined;
  
  if (controller) {
    options.signal = controller.signal;
    setTimeout(() => controller.abort(), options.timeout);
  }
  
  return traceOperation(
    `${method} ${path}`,
    OperationType.EXTERNAL_API,
    async () => {
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Add response information to span
        const span = tracer.scope().active();
        if (span) {
          span.setTag('http.status_code', response.status);
          span.setTag('http.response_time', duration);
        }
        
        return response;
      } catch (error) {
        const span = tracer.scope().active();
        if (span) {
          span.setTag('error', true);
          span.setTag('error.type', error.name);
          span.setTag('error.msg', error.message);
        }
        
        throw error;
      }
    },
    {
      'http.method': method,
      'http.url': url,
      'external.service': serviceName,
    }
  );
}

/**
 * Usage example:
 * 
 * const response = await tracedFetch('https://api.example.com/data', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ key: 'value' }),
 *   timeout: 5000, // 5 seconds
 * });
 */
```

### 5.7 Client-Side Tracing Integration

Implement client-side tracing that connects with server traces:

```typescript
// lib/datadog/client-tracing.ts
'use client';

import { datadogRum } from '@datadog/browser-rum';

interface TraceContext {
  traceId: string;
  spanId: string;
  service?: string;
  version?: string;
  env?: string;
}

/**
 * Connect client-side RUM to server trace context
 * Call this when receiving data from the server that includes trace context
 */
export function connectToServerTrace(traceContext: TraceContext): void {
  if (!datadogRum || !traceContext) return;
  
  try {
    // Add trace context to current RUM session
    datadogRum.addRumGlobalContext('trace', {
      trace_id: traceContext.traceId,
      span_id: traceContext.spanId,
      service: traceContext.service,
    });
  } catch (error) {
    console.error('Failed to connect to server trace:', error);
  }
}

/**
 * Start a user action trace that will connect with server-side traces
 * This creates a span in the RUM system that can be connected with APM
 */
export function traceUserAction(
  actionName: string,
  category: string,
  metadata: Record<string, any> = {}
): void {
  if (!datadogRum) return;
  
  try {
    datadogRum.addAction(actionName, {
      category,
      ...metadata,
    });
  } catch (error) {
    console.error('Failed to trace user action:', error);
  }
}

/**
 * Add trace context to fetch request to propagate to server
 */
export function addTraceContextToFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): [RequestInfo | URL, RequestInit] {
  if (!datadogRum) return [input, init || {}];
  
  try {
    // Get current RUM context
    const rumContext = datadogRum.getInternalContext();
    if (!rumContext || !rumContext.application_id) {
      return [input, init || {}];
    }
    
    // Create new headers with trace context
    const headers = new Headers(init?.headers || {});
    headers.set('x-datadog-origin', 'rum');
    headers.set('x-datadog-sampling-priority', '1');
    
    if (rumContext.session_id) {
      headers.set('x-datadog-session-id', rumContext.session_id);
    }
    
    if (rumContext.application_id) {
      headers.set('x-datadog-application-id', rumContext.application_id);
    }
    
    // Return updated request
    return [
      input,
      {
        ...init,
        headers,
      },
    ];
  } catch (error) {
    console.error('Failed to add trace context to fetch:', error);
    return [input, init || {}];
  }
}

/**
 * Custom fetch that propagates RUM trace context to server
 */
export async function tracedClientFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const [tracedInput, tracedInit] = addTraceContextToFetch(input, init);
  
  // Track the start time
  const startTime = performance.now();
  
  try {
    // Perform the fetch
    const response = await fetch(tracedInput, tracedInit);
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Record custom timing
    datadogRum?.addTiming('fetch_duration', duration, {
      url: typeof tracedInput === 'string' ? tracedInput : tracedInput.toString(),
      status: response.status,
    });
    
    // Extract trace context from response headers
    const traceId = response.headers.get('x-datadog-trace-id');
    const spanId = response.headers.get('x-datadog-parent-id');
    
    if (traceId && spanId) {
      // Connect RUM to trace
      connectToServerTrace({
        traceId,
        spanId,
      });
    }
    
    return response;
  } catch (error) {
    // Record error in RUM
    datadogRum?.addError(error, {
      url: typeof tracedInput === 'string' ? tracedInput : tracedInput.toString(),
    });
    
    throw error;
  }
}
```

### 5.8 User Flow Tracing Hooks

Create React hooks for tracing user flows:

```typescript
// hooks/use-traced-flow.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { datadogRum } from '@datadog/browser-rum';
import { traceUserAction, connectToServerTrace } from '@/lib/datadog/client-tracing';

export enum UserFlow {
  AUTH_SIGNUP = 'auth.signup',
  AUTH_LOGIN = 'auth.login',
  BOOKING_CREATE = 'booking.create',
  BOOKING_CONFIRM = 'booking.confirm',
  PAYMENT_PROCESS = 'payment.process',
  MARKETPLACE_SEARCH = 'marketplace.search',
  PROFILE_UPDATE = 'profile.update',
}

interface FlowOptions {
  initialStep?: string;
  metadata?: Record<string, any>;
  trackStepTimings?: boolean;
}

interface StepTimings {
  [step: string]: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

/**
 * Hook for tracking a multi-step user flow
 * Integrates with Datadog RUM and connects with server-side traces
 */
export function useTracedFlow(
  flowType: UserFlow,
  flowName: string,
  options: FlowOptions = {}
) {
  const [currentStep, setCurrentStep] = useState<string>(options.initialStep || '');
  const [flowId] = useState<string>(`flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const stepTimings = useRef<StepTimings>({});
  
  // Initialize flow when component mounts
  useEffect(() => {
    // Start flow in RUM
    datadogRum?.addAction('flow_start', {
      flow_type: flowType,
      flow_name: flowName,
      flow_id: flowId,
      ...options.metadata,
    });
    
    // Add flow context to RUM
    datadogRum?.addRumGlobalContext('active_flow', {
      type: flowType,
      name: flowName,
      id: flowId,
      started_at: new Date().toISOString(),
    });
    
    // Initialize first step if provided
    if (options.initialStep) {
      recordStepStart(options.initialStep);
    }
    
    // Cleanup when component unmounts
    return () => {
      // If flow wasn't completed, mark it as abandoned
      datadogRum?.removeRumGlobalContext('active_flow');
    };
  }, [flowType, flowName, flowId, options.initialStep]);
  
  // Record start time for a step
  const recordStepStart = useCallback((stepName: string) => {
    if (options.trackStepTimings) {
      stepTimings.current[stepName] = {
        startTime: performance.now(),
      };
    }
  }, [options.trackStepTimings]);
  
  // Record end time for a step
  const recordStepEnd = useCallback((stepName: string) => {
    if (options.trackStepTimings && stepTimings.current[stepName]) {
      const endTime = performance.now();
      stepTimings.current[stepName].endTime = endTime;
      stepTimings.current[stepName].duration = 
        endTime - stepTimings.current[stepName].startTime;
      
      // Track timing in RUM
      datadogRum?.addTiming(`flow_step_${stepName}`, stepTimings.current[stepName].duration, {
        flow_type: flowType,
        flow_name: flowName,
        flow_id: flowId,
        step_name: stepName,
      });
    }
  }, [flowType, flowName, flowId, options.trackStepTimings]);
  
  // Advance to next step
  const nextStep = useCallback((nextStepName: string, stepMetadata: Record<string, any> = {}) => {
    // End current step if there is one
    if (currentStep) {
      recordStepEnd(currentStep);
    }
    
    // Track step transition in RUM
    traceUserAction('flow_step', flowType, {
      flow_id: flowId,
      flow_name: flowName,
      from_step: currentStep,
      to_step: nextStepName,
      ...stepMetadata,
    });
    
    // Start new step
    recordStepStart(nextStepName);
    setCurrentStep(nextStepName);
  }, [currentStep, flowId, flowName, flowType, recordStepEnd, recordStepStart]);
  
  // Connect with a server trace
  const connectWithServerTrace = useCallback((traceContext: any) => {
    connectToServerTrace(traceContext);
  }, []);
  
  // Complete the flow
  const completeFlow = useCallback((finalMetadata: Record<string, any> = {}) => {
    // End current step if there is one
    if (currentStep) {
      recordStepEnd(currentStep);
    }
    
    // Calculate total flow duration
    const totalDuration = options.trackStepTimings 
      ? Object.values(stepTimings.current).reduce((total, timing) => {
          return total + (timing.duration || 0);
        }, 0)
      : undefined;
    
    // Record flow completion in RUM
    datadogRum?.addAction('flow_complete', {
      flow_type: flowType,
      flow_name: flowName,
      flow_id: flowId,
      steps_completed: Object.keys(stepTimings.current).length,
      total_duration: totalDuration,
      final_step: currentStep,
      ...finalMetadata,
    });
    
    // Remove flow context
    datadogRum?.removeRumGlobalContext('active_flow');
  }, [currentStep, flowId, flowName, flowType, options.trackStepTimings, recordStepEnd]);
  
  // Abandon the flow
  const abandonFlow = useCallback((reason: string, metadata: Record<string, any> = {}) => {
    // End current step if there is one
    if (currentStep) {
      recordStepEnd(currentStep);
    }
    
    // Record flow abandonment in RUM
    datadogRum?.addAction('flow_abandon', {
      flow_type: flowType,
      flow_name: flowName,
      flow_id: flowId,
      abandon_reason: reason,
      abandon_step: currentStep,
      ...metadata,
    });
    
    // Remove flow context
    datadogRum?.removeRumGlobalContext('active_flow');
  }, [currentStep, flowId, flowName, flowType, recordStepEnd]);
  
  return {
    currentStep,
    nextStep,
    completeFlow,
    abandonFlow,
    connectWithServerTrace,
    flowId,
  };
}
```

## 6. Implementation for Critical User Flows

### 6.1 Authentication Flow Implementation

```typescript
// Example implementation of authentication flow tracing

// Server-side (app/api/auth/login/route.ts)
import { withApiTracing } from '@/lib/datadog/api-tracing';
import { extractTraceContext } from '@/lib/datadog/context-propagation';

export const POST = withApiTracing(async (req) => {
  const body = await req.json();
  
  // Perform authentication logic
  const user = await authenticateUser(body.email, body.password);
  
  // Extract trace context for client
  const traceContext = extractTraceContext();
  
  // Return user data with trace context
  return NextResponse.json({
    user,
    _traceContext: traceContext,
  });
}, 'auth.login');

// Client-side (app/(auth)/login/page.tsx)
'use client';
import { useState } from 'react';
import { useTracedFlow, UserFlow } from '@/hooks/use-traced-flow';
import { tracedClientFetch } from '@/lib/datadog/client-tracing';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { 
    nextStep, 
    completeFlow, 
    abandonFlow,
    connectWithServerTrace,
  } = useTracedFlow(UserFlow.AUTH_LOGIN, 'User login', {
    initialStep: 'form_view',
    trackStepTimings: true,
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark validation step
    nextStep('form_submit', { email_domain: email.split('@')[1] });
    
    try {
      // Make API call with traced fetch
      const response = await tracedClientFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      // Connect client flow with server trace
      if (data._traceContext) {
        connectWithServerTrace(data._traceContext);
      }
      
      // Process successful login
      nextStep('login_success');
      
      // Wait for redirect
      setTimeout(() => {
        completeFlow({ user_id: data.user.id });
      }, 500);
    } catch (error) {
      // Handle error
      nextStep('login_error', { error_message: error.message });
      
      // Eventually abandon flow if user doesn't retry
      setTimeout(() => {
        abandonFlow('login_error', { error_message: error.message });
      }, 10000);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
}
```

### 6.2 Booking Flow Implementation

```typescript
// Server-side booking action
// lib/booking/actions.ts
import { traceServerAction } from '@/lib/datadog/server-action-tracing';
import { createTracedPrismaClient } from '@/lib/datadog/db-tracing';

const prisma = createTracedPrismaClient();

export const createBooking = traceServerAction(
  'booking.create',
  async (bookingData) => {
    // Create booking record in database
    const booking = await prisma.booking.create({
      data: {
        userId: bookingData.userId,
        builderId: bookingData.builderId,
        sessionTypeId: bookingData.sessionTypeId,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        status: 'pending',
      },
    });
    
    // Process payment if needed
    let paymentStatus = null;
    if (bookingData.paymentMethodId) {
      paymentStatus = await processPayment(
        bookingData.userId,
        booking.id,
        bookingData.paymentMethodId,
        bookingData.amount
      );
    }
    
    // Send notifications
    await sendBookingNotification(booking.id);
    
    return {
      booking,
      paymentStatus,
    };
  },
  { domain: 'booking' }
);

// Client-side booking flow
// app/(platform)/booking/page.tsx
'use client';
import { useState } from 'react';
import { useTracedFlow, UserFlow } from '@/hooks/use-traced-flow';
import { createBooking } from '@/lib/booking/actions';

export default function BookingPage() {
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const { 
    currentStep,
    nextStep, 
    completeFlow, 
    connectWithServerTrace,
  } = useTracedFlow(UserFlow.BOOKING_CREATE, 'Session booking', {
    initialStep: 'builder_selection',
    trackStepTimings: true,
    metadata: {
      from_marketplace: true,
    },
  });
  
  const handleBuilderSelect = (builder) => {
    setSelectedBuilder(builder);
    nextStep('session_type_selection', { builder_id: builder.id });
  };
  
  const handleSessionTypeSelect = (sessionType) => {
    setSelectedSessionType(sessionType);
    nextStep('time_selection', { session_type_id: sessionType.id });
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    nextStep('confirmation', { selected_time: time.toISOString() });
  };
  
  const handleConfirmBooking = async () => {
    nextStep('processing', { payment_required: sessionType.price > 0 });
    
    try {
      // Call server action
      const result = await createBooking({
        userId: currentUser.id,
        builderId: selectedBuilder.id,
        sessionTypeId: selectedSessionType.id,
        startTime: selectedTime.toISOString(),
        endTime: addMinutes(selectedTime, selectedSessionType.durationMinutes).toISOString(),
        paymentMethodId: selectedPaymentMethod?.id,
        amount: selectedSessionType.price,
      });
      
      // Connect with server trace
      if (result.__traceContext) {
        connectWithServerTrace(result.__traceContext);
      }
      
      nextStep('success', { booking_id: result.booking.id });
      
      // Complete the flow
      completeFlow({
        booking_id: result.booking.id,
        payment_status: result.paymentStatus?.status,
      });
    } catch (error) {
      nextStep('error', { error_message: error.message });
    }
  };
  
  // Render different UI based on currentStep
  switch (currentStep) {
    case 'builder_selection':
      return <BuilderSelectionStep onSelect={handleBuilderSelect} />;
    case 'session_type_selection':
      return <SessionTypeStep onSelect={handleSessionTypeSelect} builder={selectedBuilder} />;
    case 'time_selection':
      return <TimeSelectionStep onSelect={handleTimeSelect} sessionType={selectedSessionType} />;
    case 'confirmation':
      return (
        <ConfirmationStep 
          builder={selectedBuilder}
          sessionType={selectedSessionType}
          time={selectedTime}
          onConfirm={handleConfirmBooking}
        />
      );
    case 'processing':
      return <ProcessingStep />;
    case 'success':
      return <SuccessStep />;
    case 'error':
      return <ErrorStep onRetry={() => nextStep('confirmation')} />;
    default:
      return null;
  }
}
```

### 6.3 Marketplace Search Flow

```typescript
// Server-side API route
// app/api/marketplace/search/route.ts
import { withApiTracing } from '@/lib/datadog/api-tracing';
import { extractTraceContext } from '@/lib/datadog/context-propagation';
import { createTracedPrismaClient } from '@/lib/datadog/db-tracing';

const prisma = createTracedPrismaClient();

export const GET = withApiTracing(async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('q') || '';
  const skill = url.searchParams.get('skill');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  // Perform database query
  const builders = await prisma.builder.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
      ...(skill ? {
        skills: {
          some: {
            name: skill,
          },
        },
      } : {}),
    },
    include: {
      user: true,
      skills: true,
      reviewsReceived: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  // Count total results
  const totalCount = await prisma.builder.count({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
      ...(skill ? {
        skills: {
          some: {
            name: skill,
          },
        },
      } : {}),
    },
  });
  
  // Calculate average rating
  const buildersWithRating = builders.map(builder => ({
    ...builder,
    averageRating: builder.reviewsReceived.length > 0
      ? builder.reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / builder.reviewsReceived.length
      : null,
  }));
  
  // Extract trace context for client
  const traceContext = extractTraceContext();
  
  // Return search results with trace context
  return NextResponse.json({
    results: buildersWithRating,
    total: totalCount,
    page,
    limit,
    _traceContext: traceContext,
  });
}, 'marketplace.search');

// Client-side marketplace search
// app/(platform)/marketplace/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTracedFlow, UserFlow } from '@/hooks/use-traced-flow';
import { tracedClientFetch } from '@/lib/datadog/client-tracing';
import { trackPerformanceMetric, PerformanceMetricType } from '@/lib/datadog/performance-tracking';

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const query = searchParams.get('q') || '';
  const skill = searchParams.get('skill') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const { 
    nextStep, 
    completeFlow, 
    abandonFlow,
    connectWithServerTrace,
  } = useTracedFlow(UserFlow.MARKETPLACE_SEARCH, 'Marketplace search', {
    initialStep: 'search_init',
    trackStepTimings: true,
    metadata: {
      from_homepage: !query && !skill,
    },
  });
  
  // Track search
  useEffect(() => {
    if (query || skill) {
      nextStep('search_query', { 
        query,
        skill,
        page,
      });
      
      fetchResults();
    }
  }, [query, skill, page]);
  
  const fetchResults = async () => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      // Construct search URL
      const url = new URL('/api/marketplace/search', window.location.origin);
      if (query) url.searchParams.set('q', query);
      if (skill) url.searchParams.set('skill', skill);
      url.searchParams.set('page', page.toString());
      
      // Fetch results with traced fetch
      const response = await tracedClientFetch(url.toString());
      const data = await response.json();
      
      // Connect with server trace
      if (data._traceContext) {
        connectWithServerTrace(data._traceContext);
      }
      
      // Update state
      setResults(data.results);
      setLoading(false);
      
      // Track performance
      const duration = performance.now() - startTime;
      trackPerformanceMetric(PerformanceMetricType.DATA_LOAD, duration, {
        result_count: data.results.length,
        total_results: data.total,
      });
      
      // Track search results
      nextStep('search_results', {
        result_count: data.results.length,
        total_results: data.total,
        query_time_ms: duration,
      });
      
      // Complete flow if user gets results
      if (data.results.length > 0) {
        completeFlow({
          result_count: data.results.length,
          total_results: data.total,
        });
      } else {
        // Mark as no results
        nextStep('search_no_results', {
          query,
          skill,
        });
      }
    } catch (error) {
      setError(error);
      setLoading(false);
      
      // Track error
      nextStep('search_error', {
        error_message: error.message,
      });
      
      // Abandon flow after error
      abandonFlow('search_error', {
        error_message: error.message,
      });
    }
  };
  
  const handleBuilderClick = (builder) => {
    // Track builder selection
    nextStep('builder_selected', {
      builder_id: builder.id,
      position_in_results: results.findIndex(r => r.id === builder.id) + 1,
    });
    
    // Navigate to builder profile
    router.push(`/marketplace/builder/${builder.id}`);
    
    // Complete the flow
    completeFlow({
      selected_builder_id: builder.id,
      result_count: results.length,
    });
  };
  
  // Render search interface and results
  return (
    <div className="marketplace">
      <SearchForm initialQuery={query} initialSkill={skill} />
      
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchResults} />
      ) : (
        <SearchResults
          results={results}
          onBuilderClick={handleBuilderClick}
        />
      )}
    </div>
  );
}
```

## 7. Trace Sampling Strategy

Configure appropriate sampling rates to balance data volume with visibility:

```typescript
// lib/datadog/sampling.ts
import { UserFlow } from '@/lib/datadog/user-journey';
import { OperationType } from '@/lib/datadog/server-tracing';

// Critical operations that should always be traced
const CRITICAL_OPERATIONS = [
  // Authentication flows
  'auth.login',
  'auth.signup',
  'auth.reset-password',
  
  // Payment flows
  'payment.process',
  'payment.refund',
  'payment.subscribe',
  
  // Booking flows
  'booking.create',
  'booking.reschedule',
  'booking.cancel',
  
  // Critical API operations
  'api.auth.login',
  'api.auth.signup',
  'api.payment.process',
  'api.booking.create',
];

/**
 * Determine if an operation should be sampled
 * @param name Operation name
 * @param type Operation type
 */
export function shouldSampleOperation(name: string, type: string): boolean {
  // Critical operations are always sampled
  if (CRITICAL_OPERATIONS.includes(name)) {
    return true;
  }
  
  // Get environment-specific sample rate
  const baseRate = getEnvironmentSampleRate();
  
  // Adjust based on operation type
  let adjustedRate = baseRate;
  
  switch (type) {
    case OperationType.API_REQUEST:
      adjustedRate = baseRate * 2; // Double sampling for API requests
      break;
    case OperationType.DATABASE_QUERY:
      adjustedRate = baseRate * 0.5; // Half sampling for DB queries (high volume)
      break;
    case OperationType.EXTERNAL_API:
      adjustedRate = baseRate * 1.5; // 1.5x sampling for external APIs
      break;
    default:
      adjustedRate = baseRate;
  }
  
  // Apply sampling decision
  return Math.random() < adjustedRate;
}

/**
 * Get environment-specific base sample rate
 */
function getEnvironmentSampleRate(): number {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 1.0; // 100% sampling in development
    case 'test':
      return 0.0; // No sampling in test
    case 'staging':
      return 0.5; // 50% sampling in staging
    case 'production':
      return 0.1; // 10% sampling in production
    default:
      return 0.1;
  }
}

/**
 * Configure dd-trace with appropriate sampling
 */
export function configureSampling(tracer) {
  tracer.init({
    // Other configuration...
    
    // Configure dynamic sampling
    tracesSampler: (samplingContext) => {
      // Get operation name from context
      const spanContext = samplingContext.context;
      const name = spanContext?.resource || '';
      const type = spanContext?.type || '';
      
      // Critical operations always sampled
      if (CRITICAL_OPERATIONS.includes(name)) {
        return 1.0;
      }
      
      // Use standard sampling for other operations
      return getEnvironmentSampleRate();
    },
  });
}
```

## 8. Dashboard and Visualization Strategy

### 8.1 User Flow Performance Dashboard

Create a dashboard focused on critical user flows:

- Funnel visualization for each flow
- Step-by-step timing breakdown
- Error rates at each step
- Success/abandonment rates
- Correlation with business metrics

### 8.2 Service Performance Dashboard

Monitor overall service performance:

- API response times by endpoint
- Database query performance
- External API call latencies
- Error rates by service
- Resource utilization

### 8.3 Business Impact Dashboard

Connect technical performance to business metrics:

- Conversion rates by performance segment
- Revenue impact of performance issues
- User experience correlation with transactions
- Regional performance differences
- Device/platform impact on completion rates

## 9. Implementation Plan

### 9.1 Phase 1: Core Tracing Infrastructure (Week 1)
- Implement trace context propagation
- Configure server-side tracing
- Set up tracing for API routes
- Test basic tracing functionality

### 9.2 Phase 2: Database and External Service Tracing (Week 2)
- Implement database operation tracing
- Set up external API call tracing
- Connect server components with tracing
- Create initial service dashboards

### 9.3 Phase 3: Client-Side Integration (Week 3)
- Implement client-to-server trace connection
- Create traced user flow components
- Set up RUM integration with traces
- Test end-to-end tracing

### 9.4 Phase 4: Critical Flow Implementation (Week 4)
- Implement tracing for authentication flow
- Implement tracing for booking flow
- Implement tracing for marketplace flow
- Create user flow dashboards

## 10. Conclusion

This distributed tracing implementation provides comprehensive visibility into critical user flows across the Buildappswith platform. By integrating client and server-side tracing, we can track the full user journey from browser interactions through API calls, server processing, database operations, and external service integration.

The approach balances the need for detailed performance insights with appropriate sampling strategies to manage data volume and costs. The implementation is designed to be scalable, maintainable, and focused on the most critical aspects of the platform.

By connecting technical performance metrics with business outcomes, this tracing system will enable both developers and stakeholders to understand the impact of performance on user experience and business goals. The implementation will support ongoing optimization efforts, faster issue resolution, and data-driven decision-making across the platform.