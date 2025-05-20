/**
 * CalendlySessionTypeList Component
 * 
 * Displays session types fetched from Calendly with booking options
 * Version: 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { BookingButton } from '@/components/booking/booking-button'
import { Card, CardContent } from '@/components/ui/core/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/core/alert'
import { Button } from '@/components/ui/core/button'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { getCalendlyEventTypes } from '@/lib/scheduling/calendly/client-api'
import { logger } from '@/lib/logger'
import type { SessionType } from '@/lib/scheduling/types'
import type { CalendlyEventTypesResponse } from './calendly-model'

interface CalendlySessionTypeListProps {
  builderId: string;
  showBookingButtons?: boolean;
  className?: string;
}

/**
 * CalendlySessionTypeList component that fetches and displays session types from Calendly
 * This component replaces the temporary SessionTypeList with full Calendly integration
 */
export function CalendlySessionTypeList({ 
  builderId, 
  showBookingButtons = true,
  className = ''
}: CalendlySessionTypeListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  
  // Fetch session types from Calendly
  const fetchSessionTypes = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getCalendlyEventTypes()
      
      if (!result.success || !result.eventTypes) {
        setError(result.error || 'Failed to load session types')
        return
      }
      
      // Filter for this builder's session types
      const builderSessionTypes = result.eventTypes
        .filter(type => type.builderId === builderId && type.isActive)
        .map(type => ({
          id: type.id || '',
          builderId: type.builderId,
          title: type.title,
          description: type.description,
          durationMinutes: type.durationMinutes,
          price: type.price,
          currency: type.currency || 'USD',
          isActive: type.isActive,
          color: type.color || '#6366F1',
          maxParticipants: type.maxParticipants,
          calendlyEventTypeId: type.calendlyEventTypeId,
          calendlyEventTypeUri: type.calendlyEventTypeUri
        }))
      
      setSessionTypes(builderSessionTypes)
    } catch (error) {
      logger.error('Error fetching Calendly session types', { error, builderId })
      setError('Failed to load session types')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch session types on component mount
  useEffect(() => {
    fetchSessionTypes()
  }, [builderId])
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner className="h-8 w-8 mb-4" />
          <p>Loading available session types...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Error loading session types</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="text-center py-6">
          <p className="mb-4">Unable to load session types from Calendly</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchSessionTypes()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  
  // Empty state
  if (sessionTypes.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground border border-muted rounded-md p-6 ${className}`}>
        <p>No session types available for this builder.</p>
        <p className="text-sm mt-2">Try contacting them directly for booking options.</p>
      </div>
    )
  }
  
  // Render session types
  return (
    <div className={`space-y-4 ${className}`}>
      {sessionTypes.map((session) => (
        <Card key={session.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-6">
              <div className="flex-grow">
                <h4 className="font-medium text-base">{session.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{session.description}</p>
                
                <div className="flex mt-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {session.durationMinutes} minutes
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">
                  {session.price > 0 ? `$${session.price.toFixed(2)}` : 'Free'}
                </p>
                {showBookingButtons && (
                  <div className="mt-2">
                    <BookingButton 
                      builderId={builderId} 
                      sessionTypeId={session.id}
                      variant="outline"
                      size="sm"
                      calendlyEventTypeId={session.calendlyEventTypeId}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Looking for a custom session? Contact the builder directly.</p>
      </div>
    </div>
  )
}

export default CalendlySessionTypeList