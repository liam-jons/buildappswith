/**
 * Calendly Integration Configuration
 * Version: 1.0.0
 * 
 * Configuration helper for Calendly integration
 */

import { logger } from '@/lib/logger'

/**
 * Calendly configuration
 */
export interface CalendlyConfig {
  // API settings
  apiToken: string
  apiTokenSecondary?: string
  
  // Webhook settings
  webhookSigningKey?: string
  webhookSigningKeySecondary?: string
  webhookBaseUrl: string
  webhookEndpointPrefix: string
  webhookReplayProtectionWindow: number
  
  // Cache settings
  enableCaching: boolean
  cacheTtl: number
  cacheMaxEntries: number
  
  // Key management settings
  keyRotationMonitoring: boolean
  keyRotationCheckInterval: number
  maxUsagePerKey: number
  
  // Debug settings
  debugMode: boolean
}

/**
 * Load Calendly configuration from environment variables
 * 
 * @returns Calendly configuration
 */
export function loadCalendlyConfig(): CalendlyConfig {
  // Get required environment variables
  const apiToken = process.env.CALENDLY_API_TOKEN
  
  if (!apiToken) {
    logger.error('CALENDLY_API_TOKEN environment variable is required')
    throw new Error('CALENDLY_API_TOKEN environment variable is required')
  }
  
  // Get optional environment variables with defaults
  const config: CalendlyConfig = {
    // API settings
    apiToken,
    apiTokenSecondary: process.env.CALENDLY_API_TOKEN_SECONDARY,
    
    // Webhook settings
    webhookSigningKey: process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
    webhookSigningKeySecondary: process.env.CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY,
    webhookBaseUrl: process.env.CALENDLY_WEBHOOK_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
    webhookEndpointPrefix: process.env.CALENDLY_WEBHOOK_ENDPOINT_PREFIX || '/api/webhooks/calendly',
    webhookReplayProtectionWindow: parseInt(process.env.CALENDLY_WEBHOOK_REPLAY_PROTECTION_WINDOW || '300', 10),
    
    // Cache settings
    enableCaching: process.env.CALENDLY_ENABLE_CACHING === 'true',
    cacheTtl: parseInt(process.env.CALENDLY_CACHE_TTL || '300', 10),
    cacheMaxEntries: parseInt(process.env.CALENDLY_CACHE_MAX_ENTRIES || '1000', 10),
    
    // Key management settings
    keyRotationMonitoring: process.env.CALENDLY_KEY_ROTATION_MONITORING !== 'false',
    keyRotationCheckInterval: parseInt(process.env.CALENDLY_KEY_ROTATION_CHECK_INTERVAL || '3600000', 10),
    maxUsagePerKey: parseInt(process.env.CALENDLY_MAX_USAGE_PER_KEY || '10000', 10),
    
    // Debug settings
    debugMode: process.env.CALENDLY_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development'
  }
  
  // Validate configuration
  validateConfig(config)
  
  // Log configuration in debug mode
  if (config.debugMode) {
    const safeConfig = { 
      ...config,
      // Redact sensitive values
      apiToken: config.apiToken ? '********' : undefined,
      apiTokenSecondary: config.apiTokenSecondary ? '********' : undefined,
      webhookSigningKey: config.webhookSigningKey ? '********' : undefined,
      webhookSigningKeySecondary: config.webhookSigningKeySecondary ? '********' : undefined
    }
    
    logger.debug('Calendly configuration loaded', { config: safeConfig })
  }
  
  return config
}

/**
 * Validate Calendly configuration
 * 
 * @param config Configuration to validate
 * @throws Error if configuration is invalid
 */
function validateConfig(config: CalendlyConfig): void {
  // Webhook configuration
  if (process.env.NODE_ENV === 'production') {
    if (!config.webhookSigningKey) {
      logger.warn('CALENDLY_WEBHOOK_SIGNING_KEY not set in production environment')
    }
  }
  
  // Cache configuration
  if (config.cacheTtl <= 0) {
    logger.warn('CALENDLY_CACHE_TTL must be a positive number, using default of 300')
    config.cacheTtl = 300
  }
  
  if (config.cacheMaxEntries <= 0) {
    logger.warn('CALENDLY_CACHE_MAX_ENTRIES must be a positive number, using default of 1000')
    config.cacheMaxEntries = 1000
  }
  
  // Key management configuration
  if (config.keyRotationCheckInterval <= 0) {
    logger.warn('CALENDLY_KEY_ROTATION_CHECK_INTERVAL must be a positive number, using default of 3600000')
    config.keyRotationCheckInterval = 3600000
  }
  
  if (config.maxUsagePerKey <= 0) {
    logger.warn('CALENDLY_MAX_USAGE_PER_KEY must be a positive number, using default of 10000')
    config.maxUsagePerKey = 10000
  }
  
  // Webhook replay protection
  if (config.webhookReplayProtectionWindow <= 0) {
    logger.warn('CALENDLY_WEBHOOK_REPLAY_PROTECTION_WINDOW must be a positive number, using default of 300')
    config.webhookReplayProtectionWindow = 300
  }
}

// Singleton instance with lazy initialization
let configInstance: CalendlyConfig | null = null

/**
 * Get Calendly configuration
 * 
 * @returns Calendly configuration
 */
export function getCalendlyConfig(): CalendlyConfig {
  if (!configInstance) {
    configInstance = loadCalendlyConfig()
  }
  
  return configInstance
}