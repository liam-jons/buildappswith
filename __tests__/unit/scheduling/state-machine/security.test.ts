import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encryptSensitiveData,
  decryptSensitiveData,
  sanitizeForLogging,
  generateStateToken,
  verifyStateToken
} from '@/lib/scheduling/state-machine';
import { BookingStateData } from '@/lib/scheduling/state-machine/types';

// Set environment variables directly for testing
beforeEach(() => {
  // Set encryption key directly
  process.env.STATE_MACHINE_ENCRYPTION_KEY = 'test-encryption-key-32chars-long-x';
  process.env.NODE_ENV = 'test';
});

// Mock dependencies
// Mock Datadog config
vi.mock('@/lib/datadog/config', () => ({
  getDatadogConfig: vi.fn().mockReturnValue({
    enabled: false,
    service: 'test-service',
    env: 'test',
    version: '1.0.0',
    site: 'us1.datadoghq.com',
    logSampleRate: 1.0
  })
}));

// Mock Datadog
vi.mock('dd-trace', () => ({
  tracer: {
    scope: () => ({
      active: () => ({
        context: () => ({
          toTraceId: () => 'test-trace-id',
          toSpanId: () => 'test-span-id'
        })
      })
    })
  }
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn(),
    setExtra: vi.fn(),
    setLevel: vi.fn()
  }))
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    booking: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback({
        booking: {
          update: vi.fn(),
          create: vi.fn(),
        },
        stateTransitionLog: {
          create: vi.fn(),
        }
      });
    }),
  },
  prisma: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  },
  // For backward compatibility
  enhancedLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  },
  createDomainLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}));

describe('State Machine Security Features', () => {
  let testStateData: BookingStateData;
  
  beforeEach(() => {
    // Reset test data before each test
    testStateData = {
      bookingId: 'test-booking-id',
      builderId: 'test-builder-id',
      clientId: 'test-client-id',
      sessionTypeId: 'test-session-type-id',
      startTime: '2023-05-01T10:00:00Z',
      endTime: '2023-05-01T11:00:00Z',
      stripeSessionId: 'test-stripe-session-id',
      stripePaymentIntentId: 'test-payment-intent-id',
      timestamp: new Date().toISOString()
    };
  });
  
  describe('Data encryption and decryption', () => {
    it('should encrypt sensitive fields in state data', () => {
      const encryptedData = encryptSensitiveData(testStateData);
      
      // Non-sensitive fields should remain unchanged
      expect(encryptedData.bookingId).toBe(testStateData.bookingId);
      expect(encryptedData.builderId).toBe(testStateData.builderId);
      expect(encryptedData.sessionTypeId).toBe(testStateData.sessionTypeId);
      
      // Sensitive fields should be encrypted
      expect(encryptedData.stripeSessionId).not.toBe(testStateData.stripeSessionId);
      expect(encryptedData.stripePaymentIntentId).not.toBe(testStateData.stripePaymentIntentId);
      
      // Encrypted fields should have the expected format (v1:iv:encryptedData)
      expect(encryptedData.stripeSessionId?.startsWith('v1:')).toBe(true);
      expect(encryptedData.stripePaymentIntentId?.startsWith('v1:')).toBe(true);
    });
    
    it('should decrypt sensitive fields', () => {
      const encryptedData = encryptSensitiveData(testStateData);
      const decryptedData = decryptSensitiveData(encryptedData);
      
      // All fields should be restored to original values
      expect(decryptedData.bookingId).toBe(testStateData.bookingId);
      expect(decryptedData.builderId).toBe(testStateData.builderId);
      expect(decryptedData.sessionTypeId).toBe(testStateData.sessionTypeId);
      expect(decryptedData.stripeSessionId).toBe(testStateData.stripeSessionId);
      expect(decryptedData.stripePaymentIntentId).toBe(testStateData.stripePaymentIntentId);
    });
    
    it('should handle mixed encrypted and unencrypted data', () => {
      // Create a mixed state with some encrypted fields and some not
      const mixedState = {
        ...testStateData,
        stripeSessionId: encryptSensitiveData(testStateData).stripeSessionId,
        // Leave stripePaymentIntentId unencrypted
      };
      
      const decryptedData = decryptSensitiveData(mixedState);
      
      // All fields should be correctly processed
      expect(decryptedData.stripeSessionId).toBe(testStateData.stripeSessionId);
      expect(decryptedData.stripePaymentIntentId).toBe(testStateData.stripePaymentIntentId);
    });
  });
  
  describe('Data sanitization for logging', () => {
    it('should sanitize sensitive fields for logging', () => {
      const sanitizedData = sanitizeForLogging(testStateData);
      
      // Check that non-sensitive fields are preserved
      expect(sanitizedData.bookingId).toBe(testStateData.bookingId);
      expect(sanitizedData.builderId).toBe(testStateData.builderId);
      expect(sanitizedData.sessionTypeId).toBe(testStateData.sessionTypeId);
      
      // Check that sensitive fields are masked
      expect(sanitizedData.stripeSessionId).not.toBe(testStateData.stripeSessionId);
      expect(sanitizedData.stripePaymentIntentId).not.toBe(testStateData.stripePaymentIntentId);
      
      // Check masking format for sensitive data 
      // (should show first 4 and last 4 chars with **** in between)
      const maskedSessionId = sanitizedData.stripeSessionId;
      expect(maskedSessionId).toBeDefined();
      expect(maskedSessionId?.includes('****')).toBe(true);
      
      // Original sensitive data should not be present in sanitized output
      const sanitizedJSON = JSON.stringify(sanitizedData);
      expect(sanitizedJSON.includes(testStateData.stripeSessionId || '')).toBe(false);
      expect(sanitizedJSON.includes(testStateData.stripePaymentIntentId || '')).toBe(false);
    });
  });
  
  describe('State token generation and verification', () => {
    it('should generate a valid state token', () => {
      const token = generateStateToken('test-booking-id', 'TEST_STATE');
      
      // Token should be a non-empty string
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      
      // Token should be base64 encoded
      expect(() => Buffer.from(token, 'base64')).not.toThrow();
    });
    
    it('should verify a valid token', () => {
      const bookingId = 'test-booking-id';
      const state = 'TEST_STATE';
      
      const token = generateStateToken(bookingId, state);
      const verification = verifyStateToken(token);
      
      // Verification should succeed
      expect(verification.isValid).toBe(true);
      expect(verification.bookingId).toBe(bookingId);
      expect(verification.state).toBe(state);
      expect(verification.timestamp).toBeDefined();
    });
    
    it('should reject an invalid token', () => {
      const invalidToken = 'invalid-token';
      const verification = verifyStateToken(invalidToken);
      
      // Verification should fail
      expect(verification.isValid).toBe(false);
      expect(verification.bookingId).toBeUndefined();
      expect(verification.state).toBeUndefined();
    });
    
    it('should reject a tampered token', () => {
      const token = generateStateToken('test-booking-id', 'TEST_STATE');
      
      // Decode the token
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split(':');
      
      // Tamper with the booking ID
      parts[0] = 'tampered-booking-id';
      
      // Re-encode
      const tamperedToken = Buffer.from(parts.join(':')).toString('base64');
      
      // Verify should fail
      const verification = verifyStateToken(tamperedToken);
      expect(verification.isValid).toBe(false);
    });
  });
});