// This file configures the initialization of monitoring tools on the server.
// Temporarily disabled for troubleshooting build issues

// import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Guard clause: This should only run on the server
  if (typeof window !== 'undefined') return;

  try {
    // Sentry is temporarily disabled to troubleshoot build issues

    // NOTE: Datadog APM initialization is also temporarily disabled

    // Log that monitoring is disabled
    console.log('NOTE: Monitoring is temporarily disabled to resolve build issues');
  } catch (error) {
    console.error('Error initializing server monitoring:', error);
  }
}

// Disabled for now to resolve build issues
export const onRequestError = (error) => {
  // Error handling disabled
};