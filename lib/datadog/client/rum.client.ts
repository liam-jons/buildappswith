/**
 * Datadog RUM Client Implementation
 * 
 * Client-side implementation of the RUM interface for browsers.
 */

import { RumInterface, RumConfig, RumUserInfo } from '../interfaces/rum';
import { validateRumEnvironmentVariables } from '../config/rum-config';

// Singleton state
let rumInitialized = false;
let datadogRum: any = null;

/**
 * Client-side implementation of the RUM interface
 */
export const rum: RumInterface = {
  /**
   * Initialize RUM for client-side monitoring
   */
  init(config: RumConfig): boolean {
    // Skip if already initialized
    if (rumInitialized) return false;

    try {
      // Validate EU region
      if (config.site !== 'datadoghq.eu') {
        console.warn('Warning: Datadog RUM not configured for EU region (datadoghq.eu)');
      }

      // Skip if disabled or missing required environment variables
      if (!config.enabled || !validateRumEnvironmentVariables()) {
        return false;
      }

      // Lazily import RUM SDK to avoid server-side inclusion
      import('@datadog/browser-rum').then(module => {
        datadogRum = module.datadogRum;
        
        try {
          // Initialize RUM
          datadogRum.init({
            applicationId: config.applicationId,
            clientToken: config.clientToken,
            site: config.site,
            service: config.service,
            env: config.env,
            version: config.version,
            sessionSampleRate: config.sessionSampleRate,
            sessionReplaySampleRate: config.sessionReplaySampleRate,
            trackUserInteractions: config.trackInteractions,
            trackResources: config.trackResources,
            trackLongTasks: config.trackLongTasks,
            defaultPrivacyLevel: config.defaultPrivacyLevel,
            actionNameAttribute: config.actionNameAttribute,
            beforeSend: (event: any) => {
              // Filter sensitive data if needed
              return event;
            },
          });

          // Set flag to prevent duplicate initialization
          rumInitialized = true;
          
          console.log(`Datadog RUM initialized for ${config.env} environment`);
        } catch (error) {
          console.error("Failed to initialize Datadog RUM:", error);
        }
      }).catch(err => {
        console.warn('Failed to import Datadog browser RUM:', err);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Datadog RUM:', error);
      return false;
    }
  },

  /**
   * Set user information for RUM tracking
   */
  setUser(user: RumUserInfo | null): void {
    if (!rumInitialized) return;
    
    try {
      if (datadogRum) {
        if (user) {
          datadogRum.setUser(user);
        } else {
          datadogRum.removeUser();
        }
      }
    } catch (error) {
      console.error('Failed to set RUM user:', error);
    }
  },

  /**
   * Set global context for RUM
   */
  setGlobalContext(context: Record<string, any>): void {
    if (!rumInitialized) return;
    
    try {
      if (datadogRum) {
        datadogRum.setGlobalContext(context);
      }
    } catch (error) {
      console.error('Failed to set RUM global context:', error);
    }
  },

  /**
   * Add a user action
   */
  addAction(name: string, context?: Record<string, any>): void {
    if (!rumInitialized) return;
    
    try {
      if (datadogRum) {
        datadogRum.addAction(name, context);
      }
    } catch (error) {
      console.error('Failed to add RUM action:', error);
    }
  },

  /**
   * Add an error to the current session
   */
  addError(error: Error | string, context?: Record<string, any>): void {
    if (!rumInitialized) return;
    
    try {
      if (datadogRum) {
        datadogRum.addError(error, context);
      }
    } catch (e) {
      console.error('Failed to add RUM error:', e);
    }
  },

  /**
   * Start tracking a user session
   */
  startSession(): void {
    if (!rumInitialized) return;
    
    try {
      if (datadogRum && typeof datadogRum.startSessionReplayRecording === 'function') {
        datadogRum.startSessionReplayRecording();
      }
    } catch (error) {
      console.error('Failed to start RUM session:', error);
    }
  },

  /**
   * Stop tracking the current user session
   */
  stopSession(): void {
    if (!rumInitialized) return;
    
    try {
      if (datadogRum && typeof datadogRum.stopSessionReplayRecording === 'function') {
        datadogRum.stopSessionReplayRecording();
      }
    } catch (error) {
      console.error('Failed to stop RUM session:', error);
    }
  },

  /**
   * Get the underlying RUM instance if available
   */
  getInstance(): any {
    return datadogRum;
  }
};