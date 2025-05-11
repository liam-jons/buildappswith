/**
 * Token Management Hooks
 * Version: 2.0.0
 * 
 * This file provides specialized token management hooks for
 * caching and refreshing authentication tokens.
 */

"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";

// Token request queue for concurrent requests
const authRequestQueue = {
  tokenPromise: null as Promise<string> | null,
  
  async getToken(getTokenFn: () => Promise<string>): Promise<string> {
    if (!this.tokenPromise) {
      this.tokenPromise = getTokenFn().finally(() => {
        // Clear the promise after resolution with slight delay
        setTimeout(() => {
          this.tokenPromise = null;
        }, 100);
      });
    }
    return this.tokenPromise;
  }
};

/**
 * Hook for managing authentication tokens with caching and auto-refresh
 * @returns Token management utilities
 */
export function useAuthToken() {
  const { isSignedIn, getToken: clerkGetToken } = useClerkAuth();
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  
  // Function to extract expiry from token
  const extractTokenExpiry = useCallback((token: string): Date | null => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length >= 2) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp) {
          return new Date(payload.exp * 1000);
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing token expiry:', error);
      return null;
    }
  }, []);
  
  // Refresh token and update state
  const refreshToken = useCallback(async () => {
    if (!isSignedIn) return null;
    
    try {
      const newToken = await authRequestQueue.getToken(() => clerkGetToken());
      const expiry = extractTokenExpiry(newToken);
      
      setToken(newToken);
      setTokenExpiry(expiry);
      
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }, [isSignedIn, clerkGetToken, extractTokenExpiry]);
  
  // Setup token refresh timer
  useEffect(() => {
    if (!isSignedIn) {
      setToken(null);
      setTokenExpiry(null);
      return;
    }
    
    let refreshTimer: NodeJS.Timeout;
    
    // Initial token fetch
    refreshToken();
    
    // Schedule refresh if token has expiry
    if (tokenExpiry) {
      const refreshTime = tokenExpiry.getTime() - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry
      if (refreshTime > 0) {
        refreshTimer = setTimeout(refreshToken, refreshTime);
      } else {
        // If token is already near expiry, refresh immediately
        refreshToken();
      }
    }
    
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [isSignedIn, tokenExpiry, refreshToken]);
  
  // Get token function (from cache or fetch new)
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!isSignedIn) return null;
    
    // Use cached token if not expired
    if (token && tokenExpiry && tokenExpiry.getTime() > Date.now() + 30000) { // 30 seconds buffer
      return token;
    }
    
    // Otherwise, refresh the token
    return refreshToken();
  }, [isSignedIn, token, tokenExpiry, refreshToken]);
  
  return {
    token,
    tokenExpiry,
    getToken,
    refreshToken,
    isTokenExpired: tokenExpiry ? tokenExpiry.getTime() <= Date.now() : false
  };
}

/**
 * Hook for making authenticated API requests with token handling
 * @returns Function for making authenticated requests
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuthToken();
  
  return useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    return fetch(url, {
      ...options,
      headers
    });
  }, [getToken]);
}