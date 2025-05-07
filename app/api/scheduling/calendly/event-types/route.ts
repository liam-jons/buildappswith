/**
 * Calendly Event Types API
 * Version: 1.0.0
 * 
 * API for fetching Calendly event types
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { getCalendlyService } from '@/lib/scheduling/calendly'
import { calendlyEventTypesRequestSchema } from '@/lib/scheduling/schemas'
import { logger } from '@/lib/logger'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * GET handler for Calendly event types
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user roles
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { roles: true, id: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    
    // Validate query parameters
    const queryParams = {
      userId: searchParams.get('userId') || undefined,
      organizationId: searchParams.get('organizationId') || undefined
    }
    
    const validationResult = calendlyEventTypesRequestSchema.safeParse(queryParams)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    // Get Calendly service
    const calendlyService = getCalendlyService()
    
    // Fetch event types from Calendly
    const eventTypes = await calendlyService.getEventTypes()
    
    // Fetch existing session types to map Calendly event types
    const builderProfile = await prisma.builderProfile.findFirst({
      where: { userId: user.id }
    })
    
    if (!builderProfile) {
      return NextResponse.json(
        { error: 'Builder profile not found' },
        { status: 404 }
      )
    }
    
    const sessionTypes = await prisma.sessionType.findMany({
      where: { builderId: builderProfile.id }
    })
    
    // Map Calendly event types to include our system's session type IDs if matched
    const mappedEventTypes = eventTypes.map(eventType => {
      // Find matching session type
      const matchingSessionType = sessionTypes.find(st => 
        st.calendlyEventTypeId === eventType.calendlyEventTypeId
      )
      
      return {
        ...eventType,
        id: matchingSessionType?.id || '', // Use our session type ID if exists
        builderId: builderProfile.id
      }
    })
    
    return NextResponse.json({
      eventTypes: mappedEventTypes
    })
  } catch (error: any) {
    logger.error('Error fetching Calendly event types', { error })
    
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}