// This file configures the initialization of monitoring tools on the server.
// Using dynamic imports to avoid build issues with Next.js App Router

export async function register() {
  // Guard clause: This should only run on the server
  if (typeof window !== 'undefined') return;

  try {
    // Dynamic import Sentry only in production with DSN
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs');

      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 0.1,
        debug: false,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
        // Add proper client/server component handling
        integrations: []
      });

      console.log('Sentry server monitoring initialized');
    } else {
      console.log('Sentry disabled: Running in development or missing DSN');
    }

    // Datadog APM can also be initialized here with dynamic imports
    // Similar pattern to Sentry for proper isolation
  } catch (error) {
    console.error('Error initializing server monitoring:', error);
  }
}

// Re-implemented with dynamic import pattern
export const onRequestError = async (error: any) => {
  // Only capture errors in production with Sentry DSN configured
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production' || !process.env.SENTRY_DSN) {
    console.error('Request error:', error);
    return;
  }

  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(error, {
      tags: { source: 'server-request' },
      level: 'error'
    });
  } catch (sentryError) {
    // Fallback error logging if Sentry fails to load
    console.error('Failed to report error to Sentry:', sentryError);
    console.error('Original error:', error);
  }
};