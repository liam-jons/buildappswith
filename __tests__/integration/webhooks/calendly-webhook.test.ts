/**
 * Integration tests for Calendly webhook handling
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockWebhookPayload } from '../../mocks/scheduling/mock-calendly-data';
import { generateMockSignature, MOCK_WEBHOOK_SECRET } from '../../mocks/scheduling/calendly-handlers';
import { mockServer } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { testApiHandler } from '../../utils/api-test-utils';

// Mock environment variables
const originalEnv = process.env;

// Mock the POST handler
async function handleWebhook(req: Request): Promise<Response> {
  // Dynamic import of webhook handler to ensure it picks up our mocked environment
  const { POST } = await import('@/app/api/webhooks/calendly/route');
  return POST(req);
}

describe('Calendly Webhook Integration', () => {
  beforeEach(() => {
    // Reset handlers
    mockServer.resetHandlers();
    
    // Setup environment for testing
    vi.resetModules();
    process.env = { 
      ...originalEnv,
      NODE_ENV: 'production',
      CALENDLY_WEBHOOK_SIGNING_KEY: MOCK_WEBHOOK_SECRET
    };
  });
  
  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });
  
  it('should process a valid invitee.created webhook', async () => {
    // Create webhook payload
    const eventId = 'evt-' + Math.random().toString(36).substring(2, 10);
    const inviteeId = 'inv-' + Math.random().toString(36).substring(2, 10);
    
    const webhookPayload = createMockWebhookPayload('invitee.created', eventId, inviteeId, {
      payload: {
        invitee: {
          tracking: {
            utm_source: 'buildappswith',
            utm_medium: 'scheduling',
            utm_campaign: 'booking',
            utm_content: 'session_type_id=session-1&client_id=client-1'
          }
        },
        questions_and_answers: [
          {
            question: 'session_type_id',
            answer: 'session-1'
          },
          {
            question: 'client_id',
            answer: 'client-1'
          }
        ]
      }
    });
    
    // Generate valid signature
    const body = JSON.stringify(webhookPayload);
    const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
    
    // Mock the Prisma client behavior
    mockServer.use(
      http.get('*', async ({ request }) => {
        // Let other handlers process the request
        return HttpResponse.json({
          message: 'Mocked response'
        });
      })
    );
    
    // Send request to webhook endpoint
    const response = await testApiHandler(handleWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Calendly-Webhook-Signature': signature
      },
      body: webhookPayload
    });
    
    // Verify response
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      message: expect.stringContaining('processed successfully'),
      event: 'invitee.created'
    });
  });
  
  it('should reject webhooks with invalid signatures', async () => {
    // Create webhook payload
    const webhookPayload = createMockWebhookPayload('invitee.created');
    
    // Use invalid signature
    const signature = 'invalid_signature';
    
    // Send request to webhook endpoint
    const response = await testApiHandler(handleWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Calendly-Webhook-Signature': signature
      },
      body: webhookPayload
    });
    
    // Verify response
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data).toMatchObject({
      error: expect.stringContaining('signature'),
      code: 'invalid_signature'
    });
  });
  
  it('should reject webhooks with missing signatures', async () => {
    // Create webhook payload
    const webhookPayload = createMockWebhookPayload('invitee.created');
    
    // Send request without signature header
    const response = await testApiHandler(handleWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: webhookPayload
    });
    
    // Verify response
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data).toMatchObject({
      error: expect.stringContaining('Missing'),
      code: 'missing_signature'
    });
  });
  
  it('should process a cancellation webhook', async () => {
    // Create webhook payload for cancellation
    const eventId = 'evt-' + Math.random().toString(36).substring(2, 10);
    const inviteeId = 'inv-' + Math.random().toString(36).substring(2, 10);
    
    const webhookPayload = createMockWebhookPayload('invitee.canceled', eventId, inviteeId);
    
    // Generate valid signature
    const body = JSON.stringify(webhookPayload);
    const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
    
    // Send request to webhook endpoint
    const response = await testApiHandler(handleWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Calendly-Webhook-Signature': signature
      },
      body: webhookPayload
    });
    
    // Verify response
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      message: expect.stringContaining('processed successfully'),
      event: 'invitee.canceled'
    });
  });
  
  it('should validate webhook payload format', async () => {
    // Create invalid webhook payload missing required fields
    const invalidPayload = {
      event: 'invitee.created',
      // Missing 'payload' field
    };
    
    // Generate valid signature for invalid payload
    const body = JSON.stringify(invalidPayload);
    const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
    
    // Send request to webhook endpoint
    const response = await testApiHandler(handleWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Calendly-Webhook-Signature': signature
      },
      body: invalidPayload
    });
    
    // Verify response
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toMatchObject({
      error: expect.stringContaining('Invalid webhook payload')
    });
  });
});