import { http, HttpResponse } from 'msw';
import { mockProfiles } from './mock-profiles';

export const mockProfileHandlers = [
  // Get profile by ID
  http.get('/api/profiles/:profileId', ({ params }) => {
    const { profileId } = params;
    const profile = mockProfiles.find(p => p.id === profileId);

    if (!profile) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(profile);
  }),

  // Update profile
  http.put('/api/profiles/:profileId', async ({ request, params }) => {
    const { profileId } = params;
    const profileIndex = mockProfiles.findIndex(p => p.id === profileId);

    if (profileIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedData = await request.json();
    
    // In a real implementation we would update the profile here
    // For testing, we just return success
    return HttpResponse.json({ success: true });
  }),

  // Add project to profile
  http.post('/api/profiles/:profileId/projects', async ({ params }) => {
    const { profileId } = params;
    const profileIndex = mockProfiles.findIndex(p => p.id === profileId);

    if (profileIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // In a real implementation we would add the project here
    // For testing, we just return success with a mock project ID
    return HttpResponse.json({ 
      success: true, 
      projectId: 'project-' + Math.floor(Math.random() * 1000) 
    });
  }),
];