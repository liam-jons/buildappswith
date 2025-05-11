/**
 * Webhook Security Utilities
 * 
 * This module provides common security utilities for webhook handling
 */

import crypto from 'crypto';
import { logger } from '../logger';

/**
 * Maximum age for webhook signatures in seconds
 */
const SIGNATURE_MAX_AGE = 5 * 60; // 5 minutes

/**
 * Webhook signature verification error
 */
export class WebhookSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookSignatureError';
  }
}

/**
 * Structure of a parsed signature
 */
interface ParsedSignature {
  timestamp: number;
  signatures: string[];
}

/**
 * Verify webhook signature
 * 
 * Generic webhook signature verification that works for multiple providers
 */
export function verifyWebhookSignature(
  signatureHeader: string,
  payload: string,
  signingSecret: string,
  options?: {
    timestampFormat?: 'seconds' | 'milliseconds';
    tolerance?: number; // In seconds
    separator?: string;
    scheme?: string;
  }
): boolean {
  try {
    if (!signatureHeader) {
      throw new WebhookSignatureError('Missing signature header');
    }
    
    if (!signingSecret) {
      logger.warn('No signing secret provided for webhook verification');
      return process.env.NODE_ENV === 'development';
    }
    
    // Default options
    const {
      timestampFormat = 'seconds',
      tolerance = SIGNATURE_MAX_AGE,
      separator = ',',
      scheme = 'v1'
    } = options || {};
    
    // Parse signature header
    const parsedSignature = parseSignatureHeader(signatureHeader, separator, scheme);
    
    // Check timestamp freshness
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampInSeconds = timestampFormat === 'seconds' 
      ? parsedSignature.timestamp 
      : Math.floor(parsedSignature.timestamp / 1000);
    
    if (Math.abs(currentTimestamp - timestampInSeconds) > tolerance) {
      throw new WebhookSignatureError('Signature timestamp is too old');
    }
    
    // Create expected signature
    const timestampString = parsedSignature.timestamp.toString();
    const signedPayload = `${timestampString}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', signingSecret)
      .update(signedPayload)
      .digest('hex');
    
    // Check if any of the provided signatures match the expected signature
    const isValid = parsedSignature.signatures.some(sig => 
      crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expectedSignature)
      )
    );
    
    if (!isValid) {
      throw new WebhookSignatureError('Signature verification failed');
    }
    
    return true;
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      throw error;
    }
    
    logger.error('Error verifying webhook signature', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new WebhookSignatureError('Invalid signature');
  }
}

/**
 * Parse signature header
 */
function parseSignatureHeader(
  header: string, 
  separator: string,
  scheme: string
): ParsedSignature {
  try {
    // Split the header into parts
    const parts = header.split(separator);
    
    if (parts.length < 2) {
      throw new WebhookSignatureError('Invalid signature format');
    }
    
    const timestamp = parts.find(part => part.startsWith('t='));
    const signatures = parts
      .filter(part => part.startsWith(`${scheme}=`))
      .map(part => part.substring(scheme.length + 1));
    
    if (!timestamp || signatures.length === 0) {
      throw new WebhookSignatureError('Invalid signature format');
    }
    
    return {
      timestamp: parseInt(timestamp.substring(2), 10),
      signatures
    };
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      throw error;
    }
    
    logger.error('Error parsing signature header', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new WebhookSignatureError('Invalid signature format');
  }
}

/**
 * Verify webhook request
 * 
 * Verifies the signature of a webhook request and returns the payload
 */
export async function verifyWebhookRequest(
  request: Request,
  signingSecret: string,
  options?: {
    signatureHeaderName?: string;
    timestampFormat?: 'seconds' | 'milliseconds';
    tolerance?: number;
    separator?: string;
    scheme?: string;
  }
): Promise<string> {
  // Default options
  const {
    signatureHeaderName = 'stripe-signature'
  } = options || {};
  
  // Get the signature from headers
  const signature = request.headers.get(signatureHeaderName);
  if (!signature) {
    throw new WebhookSignatureError('Missing signature header');
  }
  
  // Get the raw body
  const payload = await request.text();
  
  // Verify the signature
  verifyWebhookSignature(signature, payload, signingSecret, options);
  
  return payload;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhookSignature(
  signatureHeader: string,
  payload: string,
  signingSecret: string
): boolean {
  return verifyWebhookSignature(signatureHeader, payload, signingSecret, {
    scheme: 'v1',
    separator: ',',
    timestampFormat: 'seconds'
  });
}

/**
 * Verify Calendly webhook signature
 * 
 * Calendly uses a different signature format
 */
export function verifyCalendlyWebhookSignature(
  signatureHeader: string,
  payload: string,
  signingSecret: string
): boolean {
  try {
    if (!signatureHeader) {
      throw new WebhookSignatureError('Missing signature header');
    }
    
    if (!signingSecret) {
      logger.warn('No signing secret provided for Calendly webhook verification');
      return process.env.NODE_ENV === 'development';
    }
    
    // Calculate HMAC
    const hmac = crypto.createHmac('sha256', signingSecret);
    hmac.update(payload);
    const digest = hmac.digest('hex');
    
    // Compare signatures
    const isValid = signatureHeader === digest;
    
    if (!isValid) {
      throw new WebhookSignatureError('Signature verification failed');
    }
    
    return true;
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      throw error;
    }
    
    logger.error('Error verifying Calendly webhook signature', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new WebhookSignatureError('Invalid Calendly signature');
  }
}