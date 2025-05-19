import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import {
  useAuth,
  useUser,
  useHasRole,
  useIsAdmin,
  useIsBuilder,
  useIsClient,
  usePermission,
  useSignOut,
  useAuthStatus,
  ExpressAuthProvider,
  useAuthContext
} from '@/lib/auth/hooks';
import { UserRole } from '@/lib/auth/types';

// Mock Clerk client hooks
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

describe('Client-Side Authentication Hooks', () => {
  beforeEach(() => {
    // Setup default mocks
    const { useAuth: useClerkAuth, useUser: useClerkUser } = require('@clerk/nextjs');
    
    useClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      getToken: vi.fn().mockResolvedValue('header.eyJyb2xlcyI6WyJDTElFTlQiLCJCVUlMREVSIl19.signature'),
      signOut: vi.fn().mockResolvedValue({ ok: true }),
    });
    
    useClerkUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: 'test-user-id',
        fullName: 'Test User',
        primaryEmailAddress: {
          emailAddress: 'test@example.com',
          verification: {
            status: 'verified',
          },
        },
        imageUrl: 'https://example.com/avatar.jpg',
        publicMetadata: {
          roles: [UserRole.CLIENT, UserRole.BUILDER],
          stripeCustomerId: 'test-stripe-id',
        },
      },
    });
    
    // Mock global atob
    global.atob = vi.fn(str => Buffer.from(str, 'base64').toString('binary'));
    
    // Clear mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useAuth', () => {
    it('should return enhanced auth object with roles', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      expect(result.current).toMatchObject({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        user: expect.objectContaining({
          id: 'test-user-id',
          name: 'Test User',
        }),
        roles: [UserRole.CLIENT, UserRole.BUILDER],
        hasRole: expect.any(Function),
        hasPermission: expect.any(Function),
        isAdmin: false,
        isBuilder: true,
        isClient: true,
        signOut: expect.any(Function),
      });
    });
    
    it('should extract roles from JWT token', async () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        getToken: vi.fn().mockResolvedValue('header.eyJyb2xlcyI6WyJBRE1JTiJdfQ==.signature'),
      });
      
      const { result } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      expect(result.current.roles).toEqual([UserRole.ADMIN]);
      expect(result.current.isAdmin).toBe(true);
    });
    
    it('should handle JWT parsing errors gracefully', async () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        getToken: vi.fn().mockResolvedValue('invalid-token'),
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      // Should fall back to user metadata
      expect(result.current.roles).toEqual([UserRole.CLIENT, UserRole.BUILDER]);
      
      consoleSpy.mockRestore();
    });
    
    it('should handle empty roles list when not signed in', async () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      });
      
      const { result } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      expect(result.current.roles).toEqual([]);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isBuilder).toBe(false);
      expect(result.current.isClient).toBe(false);
    });
    
    it('should provide hasRole function that works correctly', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      expect(result.current.hasRole(UserRole.CLIENT)).toBe(true);
      expect(result.current.hasRole(UserRole.BUILDER)).toBe(true);
      expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
    });
    
    it('should provide hasPermission function that works correctly', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      // Client should have profile:view permission
      expect(result.current.hasPermission('profile:view')).toBe(true);
      
      // Builder should have profile:edit permission
      expect(result.current.hasPermission('profile:edit')).toBe(true);
      
      // Neither should have admin:access permission
      expect(result.current.hasPermission('admin:access')).toBe(false);
    });
    
    it('should provide signOut function that works correctly', async () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      const mockSignOut = vi.fn().mockResolvedValue({ ok: true });
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        getToken: vi.fn().mockResolvedValue('header.eyJyb2xlcyI6WyJDTElFTlQiXX0=.signature'),
        signOut: mockSignOut,
      });
      
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const originalWindowLocation: Location = window.location;
      // @ts-ignore TS2790: Read-only property 'window.location' cannot be overwritten in tests without this.
      window.location = { href: '', assign: vi.fn(), reload: vi.fn(), replace: vi.fn() } as unknown as Location;
      
      await authResult.current.signOut({ callbackUrl: '/login' });
      
      expect(mockSignOut).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
      
      // Restore original window.location
      // @ts-ignore TS2790: Read-only property 'window.location' cannot be overwritten in tests without this.
      window.location = originalWindowLocation;
    });
  });

  describe('useUser', () => {
    it('should transform Clerk user data into application format', () => {
      const { result } = renderHook(() => useUser());
      
      expect(result.current).toMatchObject({
        isLoaded: true,
        user: {
          id: 'test-user-id',
          clerkId: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.jpg',
          roles: [UserRole.CLIENT, UserRole.BUILDER],
          verified: true,
          stripeCustomerId: 'test-stripe-id',
        },
      });
    });
    
    it('should return null user when not signed in', () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      const { useUser: useClerkUser } = require('@clerk/nextjs');
      
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      });
      
      useClerkUser.mockReturnValue({
        isLoaded: true,
        user: null,
      });
      
      const { result } = renderHook(() => useUser());
      
      expect(result.current).toMatchObject({
        isLoaded: true,
        user: null,
      });
    });
    
    it('should handle missing optional fields gracefully', () => {
      const { useUser: useClerkUser } = require('@clerk/nextjs');
      
      useClerkUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'test-user-id',
          // Missing other fields
        },
      });
      
      const { result } = renderHook(() => useUser());
      
      expect(result.current.user).toMatchObject({
        id: 'test-user-id',
        clerkId: 'test-user-id',
        name: '',
        email: '',
        image: '',
        roles: [UserRole.CLIENT], // Default role
        verified: false,
      });
    });
  });

  describe('useHasRole and role-specific hooks', () => {
    it('useHasRole should check if user has a specific role', async () => {
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const { result: clientResult } = renderHook(() => useHasRole(UserRole.CLIENT));
      const { result: builderResult } = renderHook(() => useHasRole(UserRole.BUILDER));
      const { result: adminResult } = renderHook(() => useHasRole(UserRole.ADMIN));
      
      expect(clientResult.current).toBe(true);
      expect(builderResult.current).toBe(true);
      expect(adminResult.current).toBe(false);
    });
    
    it('useIsAdmin should check if user has ADMIN role', async () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      
      // User with ADMIN role
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        getToken: vi.fn().mockResolvedValue('header.eyJyb2xlcyI6WyJBRE1JTiJdfQ==.signature'),
      });
      
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const { result } = renderHook(() => useIsAdmin());
      
      expect(result.current).toBe(true);
    });
    
    it('useIsBuilder should check if user has BUILDER role', async () => {
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const { result } = renderHook(() => useIsBuilder());
      
      expect(result.current).toBe(true);
    });
    
    it('useIsClient should check if user has CLIENT role', async () => {
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const { result } = renderHook(() => useIsClient());
      
      expect(result.current).toBe(true);
    });
  });

  describe('usePermission', () => {
    it('should check if user has a specific permission', async () => {
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const { result: profileViewResult } = renderHook(() => usePermission('profile:view'));
      const { result: profileEditResult } = renderHook(() => usePermission('profile:edit'));
      const { result: adminAccessResult } = renderHook(() => usePermission('admin:access'));
      
      expect(profileViewResult.current).toBe(true); // Client can view profiles
      expect(profileEditResult.current).toBe(true); // Builder can edit profiles
      expect(adminAccessResult.current).toBe(false); // Neither can access admin
    });
  });

  describe('useSignOut', () => {
    it('should return a function that calls Clerk signOut', async () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      const mockSignOut = vi.fn().mockResolvedValue({ ok: true });
      
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        getToken: vi.fn().mockResolvedValue('header.eyJyb2xlcyI6WyJDTElFTlQiXX0=.signature'),
        signOut: mockSignOut,
      });
      
      const { result: authResult } = renderHook(() => useAuth());
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      const { result } = renderHook(() => useSignOut());
      
      await result.current();
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('useAuthStatus', () => {
    it('should return authentication status with loading state', () => {
      const { useAuth: useClerkAuth } = require('@clerk/nextjs');
      
      // User is authenticated and loaded
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      });
      
      const { result } = renderHook(() => useAuthStatus());
      
      expect(result.current).toEqual({
        isAuthenticated: true,
        isLoading: false,
      });
      
      // User is not authenticated but loaded
      useClerkAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      });
      
      const { result: result2 } = renderHook(() => useAuthStatus());
      
      expect(result2.current).toEqual({
        isAuthenticated: false,
        isLoading: false,
      });
      
      // User is still loading
      useClerkAuth.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
      });
      
      const { result: result3 } = renderHook(() => useAuthStatus());
      
      expect(result3.current).toEqual({
        isAuthenticated: false,
        isLoading: true,
      });
    });
  });

  describe('ExpressAuthProvider and useAuthContext', () => {
    const TestComponent = () => {
      const auth = useAuthContext();
      return (
        <div>
          <div data-testid="is-authenticated">{auth.isSignedIn ? 'true' : 'false'}</div>
          <div data-testid="user-id">{auth.user?.id || 'no-user'}</div>
          <div data-testid="roles">{auth.roles.join(',')}</div>
        </div>
      );
    };
    
    it('should provide auth context to children', async () => {
      // Render with provider
      render(
        <ExpressAuthProvider>
          <TestComponent />
        </ExpressAuthProvider>
      );
      
      // Wait for useEffect to resolve
      await vi.runAllTimersAsync();
      
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user-id').textContent).toBe('test-user-id');
      expect(screen.getByTestId('roles').textContent).toBe('CLIENT,BUILDER');
    });
    
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuthContext must be used within an ExpressAuthProvider');
      
      consoleSpy.mockRestore();
    });
  });
});