/**
 * Booking State Machine Security
 * 
 * This module provides security utilities for the booking state machine
 */

import crypto from 'crypto';
import { logger } from '../../logger';
import { BookingStateData } from './types';

// Secret key for data encryption
const ENCRYPTION_KEY = process.env.STATE_MACHINE_ENCRYPTION_KEY || '';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt sensitive data in booking state
 * 
 * This function selectively encrypts sensitive fields in the booking state data
 */
export function encryptSensitiveData(stateData: BookingStateData): BookingStateData {
  try {
    if (!ENCRYPTION_KEY) {
      logger.warn('Encryption key not set, skipping encryption');
      return stateData;
    }
    
    // Create a copy of the state data
    const secureStateData = { ...stateData };
    
    // List of sensitive fields to encrypt
    const sensitiveFields: (keyof BookingStateData)[] = [
      'stripeSessionId',
      'stripePaymentIntentId',
      'stripeRefundId'
    ];
    
    // Encrypt each sensitive field if it exists
    for (const field of sensitiveFields) {
      if (secureStateData[field]) {
        secureStateData[field] = encrypt(String(secureStateData[field]));
      }
    }
    
    return secureStateData;
  } catch (error) {
    logger.error('Error encrypting sensitive data', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return stateData;
  }
}

/**
 * Decrypt sensitive data in booking state
 * 
 * This function decrypts sensitive fields in the booking state data
 */
export function decryptSensitiveData(stateData: BookingStateData): BookingStateData {
  try {
    if (!ENCRYPTION_KEY) {
      logger.warn('Encryption key not set, skipping decryption');
      return stateData;
    }
    
    // Create a copy of the state data
    const decryptedStateData = { ...stateData };
    
    // List of sensitive fields to decrypt
    const sensitiveFields: (keyof BookingStateData)[] = [
      'stripeSessionId',
      'stripePaymentIntentId',
      'stripeRefundId'
    ];
    
    // Decrypt each sensitive field if it exists and is encrypted
    for (const field of sensitiveFields) {
      if (decryptedStateData[field] && isEncrypted(String(decryptedStateData[field]))) {
        try {
          decryptedStateData[field] = decrypt(String(decryptedStateData[field]));
        } catch (decryptError) {
          logger.error(`Error decrypting field ${field}`, { 
            error: decryptError instanceof Error ? decryptError.message : String(decryptError),
            bookingId: stateData.bookingId
          });
        }
      }
    }
    
    return decryptedStateData;
  } catch (error) {
    logger.error('Error decrypting sensitive data', { 
      error: error instanceof Error ? error.message : String(error),
      bookingId: stateData.bookingId
    });
    return stateData;
  }
}

/**
 * Sanitize state data for logging
 * 
 * This function removes or masks sensitive data for logging
 */
export function sanitizeForLogging(stateData: BookingStateData): Partial<BookingStateData> {
  try {
    // Create a copy with only non-sensitive fields
    const sanitizedData: Partial<BookingStateData> = {
      bookingId: stateData.bookingId,
      builderId: stateData.builderId,
      clientId: stateData.clientId,
      sessionTypeId: stateData.sessionTypeId,
      startTime: stateData.startTime,
      endTime: stateData.endTime,
      bookingStatus: stateData.bookingStatus,
      paymentStatus: stateData.paymentStatus,
      lastEventType: stateData.lastEventType,
      timestamp: stateData.timestamp
    };
    
    // Mask sensitive fields if they exist
    if (stateData.stripeSessionId) sanitizedData.stripeSessionId = maskSensitiveData(stateData.stripeSessionId);
    if (stateData.stripePaymentIntentId) sanitizedData.stripePaymentIntentId = maskSensitiveData(stateData.stripePaymentIntentId);
    if (stateData.stripeRefundId) sanitizedData.stripeRefundId = maskSensitiveData(stateData.stripeRefundId);
    
    return sanitizedData;
  } catch (error) {
    logger.error('Error sanitizing data for logging', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    // Return minimal data if an error occurs
    return {
      bookingId: stateData.bookingId,
      timestamp: stateData.timestamp
    };
  }
}

/**
 * Generate a secure state token for recovery
 */
export function generateStateToken(bookingId: string, state: string): string {
  try {
    const timestamp = Date.now();
    const payload = `${bookingId}:${state}:${timestamp}`;
    
    // Create HMAC
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    
    // Combine payload and signature
    return Buffer.from(`${payload}:${signature}`).toString('base64');
  } catch (error) {
    logger.error('Error generating state token', { 
      error: error instanceof Error ? error.message : String(error),
      bookingId
    });
    
    // Return a fallback token in case of error
    return Buffer.from(`${bookingId}:error:${Date.now()}`).toString('base64');
  }
}

/**
 * Verify a state token
 */
export function verifyStateToken(token: string): { 
  isValid: boolean; 
  bookingId?: string; 
  state?: string; 
  timestamp?: number; 
} {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString();
    const parts = decoded.split(':');
    
    if (parts.length !== 4) {
      logger.warn('Invalid token format');
      return { isValid: false };
    }
    
    const [bookingId, state, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    
    // Check if token has expired (24 hours)
    const now = Date.now();
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      logger.warn('Token expired', { bookingId });
      return { isValid: false };
    }
    
    // Verify signature
    const payload = `${bookingId}:${state}:${timestampStr}`;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      logger.warn('Invalid token signature', { bookingId });
      return { isValid: false };
    }
    
    return {
      isValid: true,
      bookingId,
      state,
      timestamp
    };
  } catch (error) {
    logger.error('Error verifying state token', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    return { isValid: false };
  }
}

/**
 * Encrypt a string value
 */
function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend the IV to the encrypted text (IV is needed for decryption)
    return `v1:${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption error', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    throw error;
  }
}

/**
 * Decrypt an encrypted string value
 */
function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    
    // Check if the text is in the expected format
    if (parts.length !== 3 || parts[0] !== 'v1') {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    throw error;
  }
}

/**
 * Check if a string is encrypted
 */
function isEncrypted(text: string): boolean {
  return text.startsWith('v1:') && text.split(':').length === 3;
}

/**
 * Mask sensitive data for logging
 */
function maskSensitiveData(data: string): string {
  if (!data) return '';
  
  // If data is encrypted, don't mask it further
  if (isEncrypted(data)) return `[ENCRYPTED:${data.substring(0, 10)}...]`;
  
  // Otherwise mask all but first and last 4 characters
  const length = data.length;
  if (length <= 8) return '[MASKED]';
  
  return `${data.substring(0, 4)}****${data.substring(length - 4)}`;
}