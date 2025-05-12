/**
 * Datadog Module - Shared Definitions
 *
 * This file only exports shared types, interfaces, and environment detection
 * that are safe to use in both client and server environments.
 * 
 * IMPORTANT: Do not import any Node.js modules or browser-specific APIs here.
 * This file must be safe to import in any environment.
 */

// Export shared interfaces and types
export * from './interfaces';

// Basic environment detection for use in both environments
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// NOTICE:
// For client-side code, import from '@/lib/datadog/client'
// For server-side code, import from '@/lib/datadog/server'
// 
// DO NOT import directly from '@/lib/datadog' in code that needs
// environment-specific functionality.