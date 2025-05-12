/**
 * Client-side instrumentation
 * Temporarily disabled for troubleshooting build issues
 */

// import * as Sentry from "@sentry/nextjs";

export function register() {
  // Only run in browser
  if (typeof window === 'undefined') {
    console.debug('Client instrumentation skipped on server');
    return;
  }

  try {
    // Sentry is temporarily disabled to troubleshoot build issues

    // Datadog RUM is also temporarily disabled
    console.log('NOTE: Client monitoring is temporarily disabled to resolve build issues');

    /* Temporarily disabled
    setTimeout(() => {
      import('./lib/datadog/client')
        .then(({ initializeRum }) => {
          if (typeof initializeRum === 'function') {
            initializeRum();
          }
        })
        .catch(error => {
          console.warn('Failed to initialize RUM:', error);
        });
    }, 0);
    */
  } catch (error) {
    console.error('Error initializing client monitoring:', error);
  }
}

// Router transition hooks temporarily disabled
export const onRouterTransitionStart = (context) => {
  return undefined;
};

export const onRouterTransitionComplete = (context) => {
  return undefined;
};