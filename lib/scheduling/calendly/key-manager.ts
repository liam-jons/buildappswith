/**
 * Calendly API Key Manager
 * Version: 1.0.0
 * 
 * Secure management of Calendly API keys with rotation support
 */

import { logger } from '@/lib/logger'

// Token status enum
export enum TokenStatus {
  ACTIVE = 'active',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  INVALID = 'invalid',
  UNKNOWN = 'unknown'
}

// Token info interface
export interface TokenInfo {
  key: string
  status: TokenStatus
  usageCount: number
  lastUsed: Date
  expiresAt?: Date
  createdAt: Date
}

// Key manager options
export interface KeyManagerOptions {
  primaryKeyEnvVar: string
  secondaryKeyEnvVar?: string
  monitoringEnabled?: boolean
  rotationCheckIntervalMs?: number
  maxUsagePerKey?: number
}

/**
 * Calendly API Key Manager
 * 
 * Manages secure access to Calendly API keys with support for:
 * - Key rotation
 * - Usage monitoring
 * - Automatic fallback to secondary key
 * - Key status tracking
 */
export class CalendlyKeyManager {
  private primaryKeyName: string
  private secondaryKeyName?: string
  private tokens: Map<string, TokenInfo> = new Map()
  private monitoringEnabled: boolean
  private rotationCheckIntervalMs: number
  private maxUsagePerKey: number
  private rotationCheckInterval?: NodeJS.Timeout

  /**
   * Create a new Calendly key manager
   * 
   * @param options Key manager options
   */
  constructor(options: KeyManagerOptions) {
    this.primaryKeyName = options.primaryKeyEnvVar
    this.secondaryKeyName = options.secondaryKeyEnvVar
    this.monitoringEnabled = options.monitoringEnabled ?? true
    this.rotationCheckIntervalMs = options.rotationCheckIntervalMs ?? 3600000 // 1 hour default
    this.maxUsagePerKey = options.maxUsagePerKey ?? 10000 // Default max usage before recommending rotation
    
    // Initialize the token store
    this.initializeTokens()
    
    // Start monitoring if enabled
    if (this.monitoringEnabled) {
      this.startMonitoring()
    }
  }

  /**
   * Initialize the token store with environment variables
   */
  private initializeTokens() {
    try {
      // Initialize primary token
      const primaryToken = process.env[this.primaryKeyName]
      if (primaryToken) {
        this.tokens.set(this.primaryKeyName, {
          key: primaryToken,
          status: TokenStatus.ACTIVE,
          usageCount: 0,
          lastUsed: new Date(0), // Never used yet
          createdAt: new Date()
        })
      } else {
        logger.error(`Primary Calendly API token (${this.primaryKeyName}) not found in environment variables`)
      }
      
      // Initialize secondary token if configured
      if (this.secondaryKeyName) {
        const secondaryToken = process.env[this.secondaryKeyName]
        if (secondaryToken) {
          this.tokens.set(this.secondaryKeyName, {
            key: secondaryToken,
            status: TokenStatus.ACTIVE,
            usageCount: 0,
            lastUsed: new Date(0), // Never used yet
            createdAt: new Date()
          })
        } else {
          logger.warn(`Secondary Calendly API token (${this.secondaryKeyName}) not found in environment variables`)
        }
      }
    } catch (error) {
      logger.error('Error initializing Calendly API tokens', { error })
      throw new Error('Failed to initialize Calendly API tokens')
    }
  }

  /**
   * Start monitoring token usage and status
   */
  private startMonitoring() {
    // Clear any existing interval
    if (this.rotationCheckInterval) {
      clearInterval(this.rotationCheckInterval)
    }
    
    // Set up regular check for token rotation
    this.rotationCheckInterval = setInterval(() => {
      this.checkTokenRotation()
    }, this.rotationCheckIntervalMs)
    
    // Ensure interval doesn't prevent Node from exiting
    if (this.rotationCheckInterval.unref) {
      this.rotationCheckInterval.unref()
    }
    
    logger.info('Started Calendly API token monitoring', {
      interval: `${this.rotationCheckIntervalMs / 1000} seconds`,
      monitoredTokens: Array.from(this.tokens.keys())
    })
  }

  /**
   * Stop monitoring token usage and status
   */
  public stopMonitoring() {
    if (this.rotationCheckInterval) {
      clearInterval(this.rotationCheckInterval)
      this.rotationCheckInterval = undefined
      logger.info('Stopped Calendly API token monitoring')
    }
  }

  /**
   * Check if tokens need rotation based on usage patterns
   */
  private checkTokenRotation() {
    try {
      for (const [name, info] of this.tokens.entries()) {
        // Skip already expired or revoked tokens
        if ([TokenStatus.EXPIRED, TokenStatus.REVOKED, TokenStatus.INVALID].includes(info.status)) {
          continue
        }
        
        // Check if token is approaching usage limit
        if (info.usageCount > this.maxUsagePerKey * 0.8) {
          // Mark as expiring if approaching limit
          if (info.status !== TokenStatus.EXPIRING) {
            logger.warn(`Calendly API token (${name}) is approaching usage limit`, {
              usageCount: info.usageCount,
              limit: this.maxUsagePerKey
            })
            
            this.tokens.set(name, {
              ...info,
              status: TokenStatus.EXPIRING
            })
          }
        }
        
        // Log current token status
        logger.debug(`Calendly API token (${name}) status`, {
          status: info.status,
          usageCount: info.usageCount,
          lastUsed: info.lastUsed.toISOString()
        })
      }
    } catch (error) {
      logger.error('Error checking Calendly API token rotation', { error })
    }
  }

  /**
   * Get the best available token for API requests
   * 
   * @returns Best available token
   * @throws Error if no valid token is available
   */
  public getToken(): string {
    // Try to use primary token first
    const primaryInfo = this.tokens.get(this.primaryKeyName)
    if (primaryInfo && [TokenStatus.ACTIVE, TokenStatus.EXPIRING].includes(primaryInfo.status)) {
      // Update usage metrics
      this.tokens.set(this.primaryKeyName, {
        ...primaryInfo,
        usageCount: primaryInfo.usageCount + 1,
        lastUsed: new Date()
      })
      
      // Log token usage if nearing limits
      if (primaryInfo.usageCount % 1000 === 0) {
        logger.info(`Calendly API primary token usage milestone`, {
          usageCount: primaryInfo.usageCount,
          limit: this.maxUsagePerKey
        })
      }
      
      return primaryInfo.key
    }
    
    // If primary token is unavailable and secondary token exists, try it
    if (this.secondaryKeyName) {
      const secondaryInfo = this.tokens.get(this.secondaryKeyName)
      if (secondaryInfo && [TokenStatus.ACTIVE, TokenStatus.EXPIRING].includes(secondaryInfo.status)) {
        // Log fallback to secondary token
        logger.warn('Falling back to secondary Calendly API token', {
          reason: primaryInfo ? `Primary token status: ${primaryInfo.status}` : 'Primary token not found'
        })
        
        // Update usage metrics
        this.tokens.set(this.secondaryKeyName, {
          ...secondaryInfo,
          usageCount: secondaryInfo.usageCount + 1,
          lastUsed: new Date()
        })
        
        return secondaryInfo.key
      }
    }
    
    // No valid token available
    logger.error('No valid Calendly API token available', {
      primaryStatus: primaryInfo?.status || 'not_found',
      secondaryStatus: this.secondaryKeyName 
        ? this.tokens.get(this.secondaryKeyName)?.status || 'not_found'
        : 'not_configured'
    })
    
    throw new Error('No valid Calendly API token available')
  }

  /**
   * Mark a token as having failed (e.g., API returned authentication error)
   * 
   * @param tokenName Name of the token that failed
   * @param status New status for the token
   */
  public markTokenFailed(tokenName: string, status: TokenStatus = TokenStatus.INVALID) {
    const info = this.tokens.get(tokenName)
    if (info) {
      logger.error(`Marking Calendly API token (${tokenName}) as ${status}`, {
        previousStatus: info.status,
        usageCount: info.usageCount
      })
      
      this.tokens.set(tokenName, {
        ...info,
        status
      })
    }
  }

  /**
   * Get the status of all managed tokens
   * 
   * @returns Token status information
   */
  public getTokensStatus(): Record<string, Omit<TokenInfo, 'key'>> {
    const result: Record<string, Omit<TokenInfo, 'key'>> = {}
    
    for (const [name, info] of this.tokens.entries()) {
      const { key, ...rest } = info
      result[name] = rest
    }
    
    return result
  }

  /**
   * Reset token usage counters (e.g., after confirming a token is valid)
   * 
   * @param tokenName Name of the token to reset
   */
  public resetTokenUsage(tokenName: string) {
    const info = this.tokens.get(tokenName)
    if (info) {
      this.tokens.set(tokenName, {
        ...info,
        usageCount: 0,
        lastUsed: new Date()
      })
      
      logger.info(`Reset usage counter for Calendly API token (${tokenName})`)
    }
  }

  /**
   * Update token status (e.g., after verification)
   * 
   * @param tokenName Name of the token to update
   * @param status New status
   */
  public updateTokenStatus(tokenName: string, status: TokenStatus) {
    const info = this.tokens.get(tokenName)
    if (info) {
      this.tokens.set(tokenName, {
        ...info,
        status
      })
      
      logger.info(`Updated status of Calendly API token (${tokenName}) to ${status}`)
    }
  }
}

// Singleton instance
let keyManagerInstance: CalendlyKeyManager | null = null

/**
 * Get the Calendly key manager instance
 * 
 * @returns Calendly key manager
 */
export function getCalendlyKeyManager(): CalendlyKeyManager {
  if (!keyManagerInstance) {
    keyManagerInstance = new CalendlyKeyManager({
      primaryKeyEnvVar: 'CALENDLY_API_TOKEN',
      secondaryKeyEnvVar: 'CALENDLY_API_TOKEN_SECONDARY',
      monitoringEnabled: true
    })
  }
  
  return keyManagerInstance
}