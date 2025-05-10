import * as Sentry from '@sentry/nextjs';

export async function register() {
  try {
    // Determine the runtime environment
    const isServer = typeof window === 'undefined';
    const isNodeRuntime = process.env.NEXT_RUNTIME === 'nodejs';
    const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
    
    // Only initialize server-side monitoring on the server
    if (isServer && isNodeRuntime) {
      console.log('Initializing server-side monitoring...');
      
      // Initialize Sentry Server
      await import('./sentry.server.config');
      
      // We defer Datadog initialization to reduce build complexity
      // If you need Datadog APM, enable this manually in your server code
    }
    
    // Initialize Edge monitoring
    if (isServer && isEdgeRuntime) {
      console.log('Initializing edge runtime monitoring...');
      await import('./sentry.edge.config');
    }
    
    // Client-side monitoring is handled separately by sentry.client.config.ts
  } catch (error) {
    console.error('Error initializing monitoring:', error);
  }
}

export const onRequestError = Sentry.captureRequestError;