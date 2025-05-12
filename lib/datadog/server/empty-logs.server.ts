/**
 * Empty Logs Implementation for Server
 * 
 * This provides an empty implementation of the Logs interface for the server.
 * Server-side logging is handled through the tracer with logInjection enabled.
 * This provides no-op implementations to maintain API compatibility.
 */

import { LogsInterface, LogsConfig } from '../interfaces/logs';

/**
 * Server-side empty implementation of the Logs interface
 */
export const logs: LogsInterface = {
  /**
   * No-op init for server-side compatibility
   */
  init(_config: LogsConfig): boolean {
    return false;
  },

  /**
   * Empty logger methods - Server logging is handled by console + tracer logInjection
   */
  logger: {
    log(_message: string, _context?: Record<string, any>): void {
      // No-op - use console.log which is picked up by dd-trace logInjection
    },

    debug(_message: string, _context?: Record<string, any>): void {
      // No-op - use console.debug which is picked up by dd-trace logInjection
    },

    info(_message: string, _context?: Record<string, any>): void {
      // No-op - use console.info which is picked up by dd-trace logInjection
    },

    warn(_message: string, _context?: Record<string, any>): void {
      // No-op - use console.warn which is picked up by dd-trace logInjection
    },

    error(_message: string, _context?: Record<string, any>): void {
      // No-op - use console.error which is picked up by dd-trace logInjection
    }
  },

  /**
   * No-op implementation for server-side
   */
  setGlobalContext(_context: Record<string, any>): void {
    // No-op
  },

  /**
   * Always returns null on server-side
   */
  getInstance(): any {
    return null;
  }
};