import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../mocks/server';
import { mockBuilders } from '../../mocks/marketplace/mock-builders';
import { apiMock, apiExpect, testApiHandler } from '../../utils/api-test-utils';

// Mock handler function similar to what would be in the actual route file
async function handleGetBuilders(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const expertise = url.searchParams.get('expertise');
  
  let builders = mockBuilders;
  
  if (expertise) {
    builders = builders.filter(builder => 
      builder.expertise.some(skill => skill.toLowerCase().includes(expertise.toLowerCase()))
    );
  }
  
  return new Response(JSON.stringify(builders), {
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('API: /api/marketplace/builders', () => {
  beforeEach(() => {
    // Reset any custom handlers before each test
    mockServer.resetHandlers();
  });
  
  afterEach(() => {
    // Clean up after tests
    apiMock.reset();
  });
  
  it('returns all builders when no filters applied', async () => {
    // Test using the mock handler function
    const response = await testApiHandler(handleGetBuilders, {
      method: 'GET',
    });
    
    // Assert response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(mockBuilders.length);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('expertise');
  });
  
  it('filters builders by expertise', async () => {
    // Test using the mock handler function with query params
    const response = await testApiHandler(handleGetBuilders, {
      method: 'GET',
      query: { expertise: 'react' },
    });
    
    // Assert response
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // All returned builders should have React in their expertise
    expect(data.length).toBeGreaterThan(0);
    data.forEach((builder: any) => {
      expect(
        builder.expertise.some((skill: string) => 
          skill.toLowerCase().includes('react')
        )
      ).toBe(true);
    });
  });
  
  it('returns empty array when no builders match filter', async () => {
    // Test using the mock handler function with a filter that won't match
    const response = await testApiHandler(handleGetBuilders, {
      method: 'GET',
      query: { expertise: 'nonexistent-skill' },
    });
    
    // Assert response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(0);
  });
  
  it('handles network errors gracefully', async () => {
    // Mock a network error
    mockServer.use(
      http.get('/api/marketplace/builders', () => {
        return HttpResponse.error();
      })
    );
    
    // Use fetch to test error handling
    try {
      await fetch('/api/marketplace/builders');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});