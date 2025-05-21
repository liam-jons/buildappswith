/**
 * Security logging utilities for authentication system
 * 
 * This module provides enhanced security logging specifically for auth events,
 * including webhooks, login attempts, and role changes.
 */

import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

/**
 * Log a security event and store it in the audit log
 */
export async function logSecurityEvent({
  action,
  userId,
  targetId,
  targetType,
  details,
  severity = 'info',
  source = 'auth-system'
}: {
  action: string;
  userId?: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, any>;
  severity?: 'info' | 'warn' | 'error';
  source?: string;
}) {
  try {
    // Get request information
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Enhanced details with context
    const enhancedDetails = {
      ...details,
      source,
      timestamp: new Date().toISOString(),
      ip: ip.split(',')[0].trim(),
      userAgent: userAgent.substring(0, 255) // Limit length
    };
    
    // Log using structured logger
    switch (severity) {
      case 'warn':
        logger.warn(`Security event: ${action}`, { 
          userId, 
          targetId, 
          action,
          ...enhancedDetails 
        });
        break;
      case 'error':
        logger.error(`Security event: ${action}`, { 
          userId, 
          targetId, 
          action,
          ...enhancedDetails 
        });
        break;
      default:
        logger.info(`Security event: ${action}`, { 
          userId, 
          targetId, 
          action,
          ...enhancedDetails 
        });
    }
    
    // Store in audit log if we have a userId
    if (userId) {
      // TODO: Implement audit log when AuditLog model is added to schema
      // await db.auditLog.create({
      //   data: {
      //     userId,
      //     action,
      //     targetId,
      //     targetType,
      //     details: enhancedDetails,
      //     ipAddress: ip.split(',')[0].trim(),
      //     userAgent: userAgent.substring(0, 255)
      //   }
      // });
    }
    
    return true;
  } catch (error) {
    // Log the error but don't fail the operation
    logger.error('Failed to log security event', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      action, 
      userId 
    });
    
    return false;
  }
}

/**
 * Log a webhook security event
 */
export async function logWebhookEvent({
  webhookId,
  eventType,
  status,
  userId,
  error,
  details
}: {
  webhookId: string;
  eventType: string;
  status: 'success' | 'failure' | 'rejected';
  userId?: string;
  error?: Error | string;
  details?: Record<string, any>;
}) {
  try {
    // Get IP and request info
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    
    // Determine severity based on status
    const severity = status === 'success' ? 'info' : 
                     status === 'rejected' ? 'warn' : 'error';
    
    // Enhanced details
    const enhancedDetails = {
      webhookId,
      eventType,
      status,
      ip: ip.split(',')[0].trim(),
      ...(error && { 
        errorMessage: error instanceof Error ? error.message : error,
        errorStack: error instanceof Error ? error.stack : undefined
      }),
      ...details
    };
    
    // Log using structured logger
    switch (severity) {
      case 'warn':
        logger.warn(`Webhook event: ${eventType}`, enhancedDetails);
        break;
      case 'error':
        logger.error(`Webhook event: ${eventType}`, enhancedDetails);
        break;
      default:
        logger.info(`Webhook event: ${eventType}`, enhancedDetails);
    }
    
    // Store in audit log if we have a userId
    if (userId) {
      // TODO: Implement audit log when AuditLog model is added to schema
      // await db.auditLog.create({
      //   data: {
      //     userId,
      //     action: `WEBHOOK_${eventType.toUpperCase()}`,
      //     targetId: webhookId,
      //     targetType: 'WebhookEvent',
      //     details: enhancedDetails,
      //     ipAddress: ip.split(',')[0].trim(),
      //     userAgent: headersList.get('user-agent') || undefined
      //   }
      // });
    }
    
    // Store webhook event in database (commented out - webhookEvent table not in schema)
    // await db.webhookEvent.upsert({
    //   where: { svixId: webhookId },
    //   update: {
    //     processed: status === 'success',
    //     processingError: error ? 
    //       (error instanceof Error ? error.message : error.toString()) : 
    //       undefined,
    //     processingCount: { increment: 1 },
    //     lastProcessed: new Date()
    //   },
    //   create: {
    //     svixId: webhookId,
    //     type: eventType,
    //     payload: details || {},
    //     processed: status === 'success',
    //     processingError: error ? 
    //       (error instanceof Error ? error.message : error.toString()) : 
    //       undefined
    //   }
    // });
    
    // Record metric (commented out - webhookMetric table not in schema)
    // await db.webhookMetric.create({
    //   data: {
    //     type: eventType,
    //     status,
    //     processingTime: details?.processingTime || 0,
    //     error: error ? 
    //       (error instanceof Error ? error.message : error.toString()) : 
    //       undefined,
    //     timestamp: new Date()
    //   }
    // });
    
    return true;
  } catch (error) {
    // Log the error but don't fail the operation
    logger.error('Failed to log webhook event', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      webhookId, 
      eventType 
    });
    
    return false;
  }
}

/**
 * Log a role change security event
 */
export async function logRoleChangeEvent({
  userId,
  performedBy,
  oldRoles,
  newRoles,
  source
}: {
  userId: string;
  performedBy?: string;
  oldRoles: string[];
  newRoles: string[];
  source: 'api' | 'webhook' | 'admin' | 'system';
}) {
  // Calculate role differences
  const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
  const removedRoles = oldRoles.filter(role => !newRoles.includes(role));
  
  return logSecurityEvent({
    action: 'ROLE_CHANGE',
    userId: performedBy || userId,
    targetId: userId,
    targetType: 'User',
    details: {
      userId,
      performedBy,
      oldRoles,
      newRoles,
      addedRoles,
      removedRoles,
      source
    },
    severity: 'info',
    source: 'auth-system'
  });
}

/**
 * Log an authentication attempt
 */
export async function logAuthAttempt({
  userId,
  success,
  email,
  authMethod,
  error
}: {
  userId?: string;
  success: boolean;
  email?: string;
  authMethod: 'password' | 'oauth' | 'magic-link' | 'webauthn';
  error?: Error | string;
}) {
  return logSecurityEvent({
    action: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
    userId,
    details: {
      email,
      authMethod,
      error: error ? 
        (error instanceof Error ? error.message : error) : 
        undefined
    },
    severity: success ? 'info' : 'warn',
    source: 'auth-system'
  });
}

/**
 * Log a profile access event
 */
export async function logProfileAccess({
  userId,
  profileId,
  profileType,
  accessType,
  allowed
}: {
  userId: string;
  profileId: string;
  profileType: 'builder' | 'client';
  accessType: 'view' | 'edit' | 'delete';
  allowed: boolean;
}) {
  return logSecurityEvent({
    action: allowed ? 'PROFILE_ACCESS' : 'PROFILE_ACCESS_DENIED',
    userId,
    targetId: profileId,
    targetType: profileType === 'builder' ? 'BuilderProfile' : 'ClientProfile',
    details: {
      profileId,
      profileType,
      accessType,
      allowed
    },
    severity: allowed ? 'info' : 'warn',
    source: 'profile-system'
  });
}