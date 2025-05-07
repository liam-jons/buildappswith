/**
 * Calendly Scheduling Link API
 * Version: 1.0.0
 * 
 * API for generating Calendly scheduling links
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { getCalendlyService } from '@/lib/scheduling/calendly'
import { calendlySchedulingLinkRequestSchema } from '@/lib/scheduling/schemas'
import { logger } from '@/lib/logger'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * POST handler for creating Calendly scheduling links
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get request body
    const requestData = await req.json()
    
    // Validate request body
    const validationResult = calendlySchedulingLinkRequestSchema.safeParse(requestData)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, name: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if requesting for self (as client) or verifying client exists
    if (data.clientId !== user.id) {
      const client = await prisma.user.findUnique({
        where: { id: data.clientId }
      })
      
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
    }
    
    // Verify session type exists
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: data.sessionTypeId }
    })
    
    if (!sessionType) {
      return NextResponse.json(
        { error: 'Session type not found' },
        { status: 404 }
      )
    }
    
    // Get Calendly service
    const calendlyService = getCalendlyService()
    
    // Create scheduling link
    const schedulingLink = await calendlyService.createSchedulingLink({
      eventTypeId: data.eventTypeId,
      name: data.name,
      email: data.email,
      timezone: data.timezone,
      sessionTypeId: data.sessionTypeId,
      clientId: data.clientId,
      returnUrl: data.returnUrl
    })
    
    return NextResponse.json(schedulingLink)
  } catch (error: any) {
    logger.error('Error creating Calendly scheduling link', { error })
    
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}