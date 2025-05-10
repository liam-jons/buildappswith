/**
 * @test-category user-context
 * @environment client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { configureSentryUserContext, useSentryUser, configureSentryUserContextFromRequest } from '@/lib/sentry';
import { headers, cookies } from 'next/headers';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map([
    ['user-agent', 'Mozilla/5.0'],
    ['accept-language', 'en-US'],
    ['referer', 'https://example.com/previous-page'],
    ['authorization', 'Bearer mock-token'],
  ])),
  cookies: vi.fn(() => ({
    get: (name) => {
      if (name === '__clerk_session') return { value: 'mock-clerk-session' };
      if (name === '__session') return { value: 'mock-session-id' };
      return undefined;
    },
  })),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  configureScope: vi.fn((callback) => {
    const mockScope = {
      setUser: vi.fn(),
      setTag: vi.fn(),
      setContext: vi.fn(),
    };
    callback(mockScope);
    return mockScope;
  }),
}));

describe('User Context Enrichment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('configureSentryUserContext', () => {
    it('should set anonymous user when not signed in', () => {
      const mockAuth = {
        isSignedIn: false,
      };
      
      configureSentryUserContext(mockAuth);
      
      expect(Sentry.configureScope).toHaveBeenCalled();
      
      // Get the scope from the callback
      const scopeCallback = Sentry.configureScope.mock.calls[0][0];
      const mockScope = { setUser: vi.fn() };
      scopeCallback(mockScope);
      
      // Check anonymous user was set
      expect(mockScope.setUser).toHaveBeenCalledWith({ id: 'anonymous' });
    });
    
    it('should set authenticated user data when signed in', () => {
      const mockAuth = {
        isSignedIn: true,
        userId: 'user-123',
        user: {
          primaryEmailAddress: { emailAddress: 'user@example.com' },
          username: 'testuser',
          createdAt: '2023-01-01T00:00:00Z',
          lastSignInAt: '2023-05-01T00:00:00Z',
          emailAddresses: [{
            verification: { status: 'verified' },
          }],
        },
        sessionId: 'session-123',
        session: {
          lastActiveAt: '2023-05-01T10:00:00Z',
          expireAt: '2023-05-02T10:00:00Z',
        },
        sessionClaims: {
          public_metadata: {
            roles: ['builder', 'client'],
            features: {
              premium: true,
            },
          },
        },
      };
      
      configureSentryUserContext(mockAuth);
      
      expect(Sentry.configureScope).toHaveBeenCalled();
      
      // Get the scope from the callback
      const scopeCallback = Sentry.configureScope.mock.calls[0][0];
      const mockScope = { 
        setUser: vi.fn(),
        setTag: vi.fn(),
        setContext: vi.fn(),
      };
      scopeCallback(mockScope);
      
      // Check user data was set correctly
      expect(mockScope.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'user@example.com',
        username: 'testuser',
      });
      
      // Check roles were set as tags
      expect(mockScope.setTag).toHaveBeenCalledWith('user.role', 'builder,client');
      expect(mockScope.setTag).toHaveBeenCalledWith('user.isBuilder', true);
      expect(mockScope.setTag).toHaveBeenCalledWith('user.isClient', true);
      
      // Check contexts were set
      expect(mockScope.setContext).toHaveBeenCalledWith('account', {
        createdAt: '2023-01-01T00:00:00Z',
        lastSignInAt: '2023-05-01T00:00:00Z',
        verificationStatus: 'verified',
      });
      
      expect(mockScope.setContext).toHaveBeenCalledWith('session', {
        id: 'session-123',
        lastActiveAt: '2023-05-01T10:00:00Z',
        expireAt: '2023-05-02T10:00:00Z',
      });
      
      expect(mockScope.setContext).toHaveBeenCalledWith('features', {
        premium: true,
      });
    });
  });

  describe('useSentryUser', () => {
    it('should call configureSentryUserContext with auth data', () => {
      // Mock window to simulate client-side
      global.window = {} as any;
      
      const mockAuth = {
        isSignedIn: true,
        userId: 'user-123',
      };
      
      // Spy on configureSentryUserContext
      const spy = vi.spyOn(require('@/lib/sentry'), 'configureSentryUserContext');
      
      useSentryUser(mockAuth);
      
      expect(spy).toHaveBeenCalledWith(mockAuth);
    });
  });

  describe('configureSentryUserContextFromRequest', () => {
    it('should extract user context from request headers and cookies', () => {
      configureSentryUserContextFromRequest();
      
      expect(headers).toHaveBeenCalled();
      expect(cookies).toHaveBeenCalled();
      expect(Sentry.configureScope).toHaveBeenCalled();
      
      // Get the scope from the callback
      const scopeCallback = Sentry.configureScope.mock.calls[0][0];
      const mockScope = { 
        setUser: vi.fn(),
        setContext: vi.fn(),
      };
      scopeCallback(mockScope);
      
      // Check user ID was extracted from cookies
      expect(mockScope.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
        })
      );
      
      // Check session context was set
      expect(mockScope.setContext).toHaveBeenCalledWith(
        'session',
        expect.objectContaining({
          id: 'mock-session-id',
          userAgent: 'Mozilla/5.0',
        })
      );
      
      // Check request context was set
      expect(mockScope.setContext).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({
          url: 'https://example.com/previous-page',
          headers: expect.objectContaining({
            'user-agent': 'Mozilla/5.0',
            'accept-language': 'en-US',
          }),
        })
      );
    });
    
    it('should handle direct request object if provided', () => {
      const mockRequest = {
        url: 'https://example.com/test',
        method: 'POST',
        headers: new Headers({
          'user-agent': 'Custom Agent',
          'accept-language': 'fr-FR',
          'cookie': '__clerk_session=direct-session; __session=direct-session-id',
        }),
      };
      
      configureSentryUserContextFromRequest(mockRequest);
      
      expect(Sentry.configureScope).toHaveBeenCalled();
      
      // Get the scope from the callback
      const scopeCallback = Sentry.configureScope.mock.calls[0][0];
      const mockScope = { 
        setUser: vi.fn(),
        setContext: vi.fn(),
      };
      scopeCallback(mockScope);
      
      // Check request context was set with direct request values
      expect(mockScope.setContext).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({
          url: 'https://example.com/test',
          method: 'POST',
          headers: expect.objectContaining({
            'user-agent': 'Custom Agent',
          }),
        })
      );
    });
    
    it('should set anonymous user when no user ID can be extracted', () => {
      // Mock headers and cookies to return no auth info
      headers.mockReturnValueOnce(new Map([
        ['user-agent', 'Mozilla/5.0'],
      ]));
      cookies.mockReturnValueOnce({
        get: () => undefined,
      });
      
      configureSentryUserContextFromRequest();
      
      // Get the scope from the callback
      const scopeCallback = Sentry.configureScope.mock.calls[0][0];
      const mockScope = { 
        setUser: vi.fn(),
      };
      scopeCallback(mockScope);
      
      // Check anonymous user was set
      expect(mockScope.setUser).toHaveBeenCalledWith({ id: 'anonymous' });
    });
  });
});