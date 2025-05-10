/**
 * Unit tests for Calendly webhook security utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  verifyWebhookSignature,
  verifyWebhookRequest,
  WebhookSignatureError
} from '@/lib/scheduling/calendly/webhook-security';
import { createMockWebhookPayload } from '../../../../mocks/scheduling/mock-calendly-data';
import { generateMockSignature, MOCK_WEBHOOK_SECRET } from '../../../../mocks/scheduling/calendly-handlers';

// Mock environment variables
const originalEnv = process.env;

describe('Calendly Webhook Security', () => {
  beforeEach(() => {
    // Setup environment for testing
    vi.resetModules();
    process.env = { 
      ...originalEnv,
      NODE_ENV: 'production',
      CALENDLY_WEBHOOK_SIGNING_KEY: MOCK_WEBHOOK_SECRET
    };
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });
  
  describe('verifyWebhookSignature', () => {
    it('should verify a valid signature', () => {
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Generate a valid signature
      const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
      
      // Verify the signature
      const result = verifyWebhookSignature(body, signature);
      
      expect(result).toBe(true);
    });
    
    it('should reject an invalid signature', () => {
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Generate an invalid signature
      const signature = 'invalid_signature';
      
      // Verify the signature
      expect(() => verifyWebhookSignature(body, signature)).toThrow(WebhookSignatureError);
      expect(() => verifyWebhookSignature(body, signature)).toThrow('Invalid webhook signature');
      
      try {
        verifyWebhookSignature(body, signature);
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookSignatureError);
        expect((error as WebhookSignatureError).code).toBe('invalid_signature');
      }
    });
    
    it('should reject a missing signature', () => {
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Verify without a signature
      expect(() => verifyWebhookSignature(body, '')).toThrow(WebhookSignatureError);
      expect(() => verifyWebhookSignature(body, '')).toThrow('Missing Calendly webhook signature');
      
      try {
        verifyWebhookSignature(body, '');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookSignatureError);
        expect((error as WebhookSignatureError).code).toBe('missing_signature');
      }
    });
    
    it('should throw an error if the signing key is not configured', () => {
      // Remove the environment variable
      delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
      
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Generate a valid signature
      const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
      
      // Verify the signature
      expect(() => verifyWebhookSignature(body, signature)).toThrow(WebhookSignatureError);
      expect(() => verifyWebhookSignature(body, signature)).toThrow('Webhook signing key not configured');
      
      try {
        verifyWebhookSignature(body, signature);
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookSignatureError);
        expect((error as WebhookSignatureError).code).toBe('configuration_error');
      }
    });
    
    it('should skip verification in development if configured', () => {
      // Set environment to development
      process.env.NODE_ENV = 'development';
      delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
      
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Use an invalid signature
      const signature = 'invalid_signature';
      
      // Should pass in development
      const result = verifyWebhookSignature(body, signature, { skipVerificationInDev: true });
      
      expect(result).toBe(true);
    });
    
    it('should use secondary signing key if primary fails', () => {
      // Setup environment with both primary and secondary keys
      process.env.CALENDLY_WEBHOOK_SIGNING_KEY = 'wrong_key';
      process.env.CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY = MOCK_WEBHOOK_SECRET;
      
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Generate a signature with the secondary key
      const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
      
      // Verify the signature
      const result = verifyWebhookSignature(body, signature, {
        secondarySigningKeyEnvVar: 'CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY'
      });
      
      expect(result).toBe(true);
    });
  });
  
  describe('verifyWebhookRequest', () => {
    it('should verify a valid request with headers', () => {
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Generate a valid signature
      const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
      
      // Create headers
      const headers = {
        'calendly-webhook-signature': signature
      };
      
      // Verify the request
      const result = verifyWebhookRequest(headers, body);
      
      expect(result).toBe(true);
    });
    
    it('should verify a valid request with Headers object', () => {
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Generate a valid signature
      const signature = generateMockSignature(body, MOCK_WEBHOOK_SECRET);
      
      // Create Headers object
      const headers = new Headers({
        'calendly-webhook-signature': signature
      });
      
      // Verify the request
      const result = verifyWebhookRequest(headers, body);
      
      expect(result).toBe(true);
    });
    
    it('should throw an error if signature header is missing', () => {
      // Create a webhook payload
      const payload = createMockWebhookPayload('invitee.created');
      const body = JSON.stringify(payload);
      
      // Create headers without signature
      const headers = {};
      
      // Verify the request
      expect(() => verifyWebhookRequest(headers, body)).toThrow(WebhookSignatureError);
      expect(() => verifyWebhookRequest(headers, body)).toThrow('Missing Calendly webhook signature header');
    });
  });
});