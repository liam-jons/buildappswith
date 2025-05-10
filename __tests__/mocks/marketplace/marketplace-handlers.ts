import { http, HttpResponse } from 'msw';
import { mockBuilders } from './mock-builders';

export const mockMarketplaceHandlers = [
  // Get all builders
  http.get('/api/marketplace/builders', () => {
    return HttpResponse.json(mockBuilders);
  }),

  // Get specific builder by ID
  http.get('/api/marketplace/builders/:builderId', ({ params }) => {
    const { builderId } = params;
    const builder = mockBuilders.find(b => b.id === builderId);

    if (!builder) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(builder);
  }),

  // Filter builders endpoint
  http.get('/api/marketplace/search', ({ request }) => {
    const url = new URL(request.url);
    const expertise = url.searchParams.get('expertise');

    let filteredBuilders = mockBuilders;

    if (expertise) {
      filteredBuilders = mockBuilders.filter(b => 
        b.expertise.some(skill => skill.toLowerCase().includes(expertise.toLowerCase()))
      );
    }

    return HttpResponse.json(filteredBuilders);
  }),
];