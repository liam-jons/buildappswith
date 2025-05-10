import { http, HttpResponse } from 'msw';
import { mockAuthHandlers } from './auth/auth-handlers';
import { mockMarketplaceHandlers } from './marketplace/marketplace-handlers';
import { mockProfileHandlers } from './profile/profile-handlers';
import { mockSchedulingHandlers } from './scheduling/scheduling-handlers';
import { mockCalendlyHandlers } from './scheduling/calendly-handlers';

// Combine all domain-specific handlers
export const handlers = [
  // Default fallback handler for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
  http.post('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),

  // Include domain-specific handlers
  ...mockAuthHandlers,
  ...mockMarketplaceHandlers,
  ...mockProfileHandlers,
  ...mockSchedulingHandlers,
  ...mockCalendlyHandlers,
];