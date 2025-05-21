/**
 * Calendly Webhook Security Utilities
 * Version: 1.0.0
 * 
 * Secure validation and processing of Calendly webhooks
 */

import { logger } from '@/lib/logger'
import crypto from 'crypto'

// Constants
const WEBHOOK_SIGNATURE_HEADER = 'calendly-webhook-signature'
const REPLAY_PROTECTION_WINDOW_SECONDS = 300 // 5 minutes replay protection

// Store for processed webhook signatures to prevent replay attacks
// This would ideally be in Redis or similar for distributed environments
const processedSignatures = new Map<string, number>()

// Clean up old signatures every hour to prevent memory leaks
setInterval(() => {
  const now = Math.floor(Date.now() / 1000)
  
  // Remove signatures older than the replay protection window
  for (const [signature, timestamp] of processedSignatures.entries()) {
    if (now - timestamp > REPLAY_PROTECTION_WINDOW_SECONDS) {
      processedSignatures.delete(signature)
    }
  }
}, 3600000) // 1 hour

/**
 * Webhook signature verification error
 */
export class WebhookSignatureError extends Error {
  code: 'invalid_signature' | 'expired_signature' | 'replay_attack' | 'missing_signature' | 'configuration_error'
  
  constructor(message: string, code: WebhookSignatureError['code']) {
    super(message)
    this.name = 'WebhookSignatureError'
    this.code = code
  }
}

/**
 * Webhook signature verification options
 */
export interface WebhookVerificationOptions {
  /**
   * Whether to skip verification in development mode
   * Default: true
   */
  skipVerificationInDev?: boolean
  
  /**
   * Whether to enable replay protection
   * Default: true
   */
  replayProtection?: boolean
  
  /**
   * Window in seconds for replay protection
   * Default: 300 (5 minutes)
   */
  replayProtectionWindowSeconds?: number
  
  /**
   * Environment variable name for webhook signing key
   * Default: 'CALENDLY_WEBHOOK_SIGNING_KEY'
   */
  signingKeyEnvVar?: string
  
  /**
   * Environment variable name for secondary webhook signing key (for rotation)
   * Default: 'CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY'
   */
  secondarySigningKeyEnvVar?: string
}

/**
 * Verify Calendly webhook signature
 * 
 * @param body Request body as string
 * @param signature Signature from headers
 * @param options Verification options
 * @returns Whether signature is valid
 * @throws WebhookSignatureError if signature is invalid
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  options: WebhookVerificationOptions = {}
): boolean {
  const {
    skipVerificationInDev = true,
    replayProtection = true,
    replayProtectionWindowSeconds = REPLAY_PROTECTION_WINDOW_SECONDS,
    signingKeyEnvVar = 'CALENDLY_WEBHOOK_SIGNING_KEY',
    secondarySigningKeyEnvVar = 'CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY'
  } = options
  
  // Skip verification in development if configured and no signing key
  if (
    process.env.NODE_ENV === 'development' &&
    skipVerificationInDev && 
    !process.env[signingKeyEnvVar]
  ) {
    logger.warn('Skipping Calendly webhook signature verification in development')
    return true
  }
  
  // Check for signature
  if (!signature) {
    throw new WebhookSignatureError(
      'Missing Calendly webhook signature',
      'missing_signature'
    )
  }
  
  // Check for primary signing key
  const signingKey = process.env[signingKeyEnvVar]
  
  if (!signingKey) {
    logger.error('Calendly webhook signing key not configured')
    throw new WebhookSignatureError(
      'Webhook signing key not configured',
      'configuration_error'
    )
  }
  
  // Check for secondary signing key (optional)
  const secondarySigningKey = process.env[secondarySigningKeyEnvVar]
  
  // Check for replay attacks if protection is enabled
  if (replayProtection && processedSignatures.has(signature)) {
    logger.warn('Potential webhook replay attack detected', { signature })
    throw new WebhookSignatureError(
      'Webhook signature has already been processed (potential replay attack)',
      'replay_attack'
    )
  }
  
  try {
    // Try with primary key first
    const primaryHmac = crypto.createHmac('sha256', signingKey)
    const primaryDigest = primaryHmac.update(body).digest('hex')
    
    let isValid = false
    
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(primaryDigest, 'hex'),
        Buffer.from(signature, 'hex')
      )
    } catch (e) {
      // If buffers are different lengths, timingSafeEqual throws, meaning invalid signature
      isValid = false
    }
    
    // If primary key fails and secondary key exists, try secondary
    if (!isValid && secondarySigningKey) {
      const secondaryHmac = crypto.createHmac('sha256', secondarySigningKey)
      const secondaryDigest = secondaryHmac.update(body).digest('hex')
      
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(secondaryDigest, 'hex'),
          Buffer.from(signature, 'hex')
        )
      } catch (e) {
        // If buffers are different lengths, timingSafeEqual throws, meaning invalid signature
        isValid = false
      }
      
      if (isValid) {
        logger.info('Validated webhook signature using secondary signing key')
      }
    }
    
    if (!isValid) {
      logger.warn('Invalid Calendly webhook signature', { 
        signatureLength: signature.length
      })
      throw new WebhookSignatureError(
        'Invalid webhook signature',
        'invalid_signature'
      )
    }
    
    // Store signature to prevent replay attacks
    if (replayProtection) {
      processedSignatures.set(signature, Math.floor(Date.now() / 1000))
    }
    
    return true
  } catch (error) {
    // Rethrow WebhookSignatureError instances
    if (error instanceof WebhookSignatureError) {
      throw error
    }
    
    // Log unexpected errors
    logger.error('Error verifying Calendly webhook signature', { error })
    throw new WebhookSignatureError(
      'Error verifying webhook signature',
      'invalid_signature'
    )
  }
}

/**
 * Extract and verify Calendly webhook signature from request headers
 * 
 * @param headers Request headers
 * @param body Request body as string
 * @param options Verification options
 * @returns Whether signature is valid
 * @throws WebhookSignatureError if signature is invalid
 */
export function verifyWebhookRequest(
  headers: Headers | Record<string, string | string[] | undefined>,
  body: string,
  options: WebhookVerificationOptions = {}
): boolean {
  let signature: string | null = null
  
  // Extract signature from headers
  if (headers instanceof Headers) {
    signature = headers.get(WEBHOOK_SIGNATURE_HEADER)
  } else {
    const headerValue = headers[WEBHOOK_SIGNATURE_HEADER] || headers[WEBHOOK_SIGNATURE_HEADER.toLowerCase()]
    
    if (headerValue) {
      signature = Array.isArray(headerValue) ? headerValue[0] : headerValue
    }
  }
  
  if (!signature) {
    throw new WebhookSignatureError(
      'Missing Calendly webhook signature header',
      'missing_signature'
    )
  }
  
  return verifyWebhookSignature(body, signature, options)
}

/**
 * Calendly webhook payload interface for type safety
 */
interface CalendlyWebhookPayload {
  event_type?: {
    name?: string;
  };
  invitee?: {
    email?: string;
    uuid?: string;
    name?: string;
  };
  event?: {
    uuid?: string;
  };
  [key: string]: unknown;
}

/**
 * Log webhook event details for monitoring and analytics
 * 
 * @param event Webhook event name
 * @param payload Webhook payload
 */
export function logWebhookEvent(event: string, payload: CalendlyWebhookPayload): void {
  logger.info('Calendly webhook received', {
    event,
    eventType: payload.event_type?.name,
    inviteeEmail: payload.invitee?.email,
    eventId: payload.event?.uuid,
    inviteeId: payload.invitee?.uuid,
    timestamp: new Date().toISOString()
  })
}