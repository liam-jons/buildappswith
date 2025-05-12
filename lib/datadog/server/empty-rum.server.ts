/**
 * Empty RUM Implementation for Server
 * 
 * This provides an empty implementation of the RUM interface for the server.
 * Since RUM is a browser-only concept, this provides no-op implementations
 * to maintain API compatibility.
 */

import { RumInterface, RumConfig, RumUserInfo } from '../interfaces/rum';

/**
 * Server-side empty implementation of the RUM interface
 */
export const rum: RumInterface = {
  /**
   * No-op init for server-side compatibility
   */
  init(_config: RumConfig): boolean {
    return false;
  },

  /**
   * No-op implementation for server-side
   */
  setUser(_user: RumUserInfo | null): void {
    // No-op
  },

  /**
   * No-op implementation for server-side
   */
  setGlobalContext(_context: Record<string, any>): void {
    // No-op
  },

  /**
   * No-op implementation for server-side
   */
  addAction(_name: string, _context?: Record<string, any>): void {
    // No-op
  },

  /**
   * No-op implementation for server-side
   */
  addError(_error: Error | string, _context?: Record<string, any>): void {
    // No-op
  },

  /**
   * No-op implementation for server-side
   */
  startSession(): void {
    // No-op
  },

  /**
   * No-op implementation for server-side
   */
  stopSession(): void {
    // No-op
  },

  /**
   * Always returns null on server-side
   */
  getInstance(): any {
    return null;
  }
};