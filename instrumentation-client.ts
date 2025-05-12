/**
 * Client-side instrumentation with dynamic imports
 * Designed to avoid build issues with Next.js App Router and catch-all routes
 */

export function register() {
  // Only run in browser
  if (typeof window === 'undefined') {
    console.debug('Client instrumentation skipped on server');
    return;
  }

  // Initialize with dynamic import off the critical path
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Use setTimeout to move initialization off the critical path
    // This ensures the main JS bundle loads and hydrates first
    setTimeout(() => {
      initializeSentry();
      initializeDatadog();
    }, 0);
  } else {
    console.debug('Client monitoring disabled in development');
  }
}

// Dynamically load and initialize Sentry
async function initializeSentry() {
  try {
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
      integrations: [],
      // Optimizations to avoid issues in client components
      beforeSend(event) {
        // Filter out certain errors common in client components
        if (event.exception?.values?.some(e =>
            e.value?.includes('hydration') ||
            e.value?.includes('Minified React error'))) {
          return null;
        }
        return event;
      }
    });

    // Dynamically add integrations after initialization
    try {
      // Load browser tracing integration separately
      const SentryIntegrations = await import('@sentry/nextjs');
      if (SentryIntegrations.BrowserTracing) {
        Sentry.addIntegration(new SentryIntegrations.BrowserTracing());
      }
    } catch (err) {
      console.warn('Failed to add Sentry integrations:', err);
    }

    console.debug('Sentry client monitoring initialized');
  } catch (err) {
    console.warn('Failed to initialize Sentry client:', err);
  }
}

// Dynamically load and initialize Datadog RUM
async function initializeDatadog() {
  try {
    const { initializeRum } = await import('./lib/datadog/client');
    if (typeof initializeRum === 'function') {
      initializeRum();
      console.debug('Datadog RUM initialized');
    }
  } catch (err) {
    console.warn('Failed to initialize Datadog RUM:', err);
  }
}

// Router transition handlers with dynamic imports
export const onRouterTransitionStart = async (context) => {
  if (typeof window === 'undefined' ||
      process.env.NODE_ENV !== 'production' ||
      !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return undefined;
  }

  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.startTransaction({
      name: `Route Navigation: ${context.pathname}`,
      op: 'navigation',
      data: {
        from: context.previousPathname,
        to: context.pathname
      }
    });
  } catch (err) {
    // Silent failure - just return undefined
  }

  return undefined;
};

export const onRouterTransitionComplete = async (context) => {
  if (typeof window === 'undefined' ||
      process.env.NODE_ENV !== 'production' ||
      !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return undefined;
  }

  try {
    const Sentry = await import('@sentry/nextjs');
    const activeTransaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    if (activeTransaction) {
      activeTransaction.finish();
    }
  } catch (err) {
    // Silent failure - just return undefined
  }

  return undefined;
};