/**
 * Calendly Health Check API
 * Version: 1.0.0
 * 
 * Endpoint for monitoring the health of Calendly integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCalendlyApiClient, verifyCalendlyApiToken } from '@/lib/scheduling/calendly'
import { getCacheStats } from '@/lib/scheduling/calendly/caching'
import { getCalendlyConfig } from '@/lib/scheduling/calendly/config'
import { logger } from '@/lib/logger'

/**
 * GET handler for Calendly health check
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication if token is provided
    const authHeader = req.headers.get('authorization')
    const isAuthorized = checkAuthorization(authHeader)
    
    // Basic health check
    const isHealthy = true
    const timestamp = new Date().toISOString()
    
    // Basic response for unauthorized requests
    if (!isAuthorized) {
      return NextResponse.json({
        status: 'ok',
        timestamp
      })
    }
    
    // Detailed health check for authorized requests
    const config = getCalendlyConfig()
    
    // Check API token validity
    let apiStatus = 'unknown'
    let apiTokenValid = false
    
    try {
      apiTokenValid = await verifyCalendlyApiToken()
      apiStatus = apiTokenValid ? 'valid' : 'invalid'
    } catch (error) {
      apiStatus = 'error'
      logger.error('Error checking Calendly API token', { error })
    }
    
    // Get cache stats
    const cacheStats = config.enableCaching ? getCacheStats() : null
    
    // Prepare health check details
    const details = {
      apiTokenValid,
      apiStatus,
      webhookSigningKeyConfigured: Boolean(config.webhookSigningKey),
      webhookSigningKeySecondaryConfigured: Boolean(config.webhookSigningKeySecondary),
      caching: config.enableCaching ? {
        enabled: true,
        ...cacheStats
      } : {
        enabled: false
      },
      keyRotation: {
        enabled: config.keyRotationMonitoring,
        checkInterval: `${config.keyRotationCheckInterval / 1000} seconds`,
        maxUsagePerKey: config.maxUsagePerKey
      },
      environment: process.env.NODE_ENV
    }
    
    // Return detailed health check
    return NextResponse.json({
      status: apiTokenValid ? 'ok' : 'degraded',
      timestamp,
      details
    })
  } catch (error) {
    logger.error('Error in Calendly health check', { error })
    
    // Return error response
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Check if request is authorized to view detailed health information
 * 
 * @param authHeader Authorization header value
 * @returns Whether request is authorized
 */
function checkAuthorization(authHeader: string | null): boolean {
  if (!authHeader) {
    return false
  }
  
  // Check for API key in format "Bearer <api-key>"
  const [authType, apiKey] = authHeader.split(' ')
  
  if (authType.toLowerCase() !== 'bearer' || !apiKey) {
    return false
  }
  
  // In production, you would check against a configured API key
  // For simplicity, we'll use an environment variable
  const healthCheckApiKey = process.env.HEALTH_CHECK_API_KEY
  
  if (!healthCheckApiKey) {
    return false
  }
  
  return apiKey === healthCheckApiKey
}