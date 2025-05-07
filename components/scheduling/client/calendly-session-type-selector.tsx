'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/core/card'
import { SessionTypeSelector } from '@/components/scheduling'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/core/alert'
import { AlertTriangle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getCalendlyEventTypes } from '@/lib/scheduling/calendly/client-api'
import type { MappedCalendlyEventType } from '@/lib/scheduling/calendly/types'
import type { SessionType } from '@/lib/scheduling/types'

interface CalendlySessionTypeSelectorProps {
  builderId: string;
  onSelectSessionType?: (sessionType: SessionType) => void;
}

/**
 * Session type selector for Calendly integrated bookings
 */
const CalendlySessionTypeSelector: React.FC<CalendlySessionTypeSelectorProps> = ({
  builderId,
  onSelectSessionType
}) => {
  const router = useRouter()
  const { user, isLoaded: isUserLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  
  // Fetch available session types from Calendly
  useEffect(() => {
    const fetchSessionTypes = async () => {
      if (!isUserLoaded) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const result = await getCalendlyEventTypes()
        
        if (!result.success || !result.eventTypes) {
          setError(result.error || 'Failed to load session types')
          return
        }
        
        // Filter for active session types
        const filteredTypes = result.eventTypes.filter(type => type.isActive)
        
        // Convert to session types format
        const mappedTypes: SessionType[] = filteredTypes.map(type => ({
          id: type.id || '',
          builderId,
          title: type.title,
          description: type.description,
          durationMinutes: type.durationMinutes,
          price: type.price,
          currency: type.currency,
          isActive: type.isActive,
          color: type.color || '#6366F1',
          maxParticipants: type.maxParticipants,
          calendlyEventTypeId: type.calendlyEventTypeId,
          calendlyEventTypeUri: type.calendlyEventTypeUri
        }))
        
        setSessionTypes(mappedTypes)
      } catch (error) {
        setError('Failed to load session types')
        console.error('Error fetching Calendly session types:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSessionTypes()
  }, [builderId, isUserLoaded])
  
  // Handle session type selection
  const handleSelectSessionType = (sessionType: SessionType) => {
    if (onSelectSessionType) {
      onSelectSessionType(sessionType)
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a Session Type</CardTitle>
          <CardDescription>
            Choose the type of session you'd like to book
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner className="h-8 w-8 mb-4" />
            <p>Loading available session types...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a Session Type</CardTitle>
          <CardDescription>
            Choose the type of session you'd like to book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <p className="text-center py-4">
            Please try again later or contact support if the problem persists.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Render session type selector
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Session Type</CardTitle>
        <CardDescription>
          Choose the type of session you'd like to book
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SessionTypeSelector 
          sessionTypes={sessionTypes}
          onSelect={handleSelectSessionType}
        />
      </CardContent>
    </Card>
  )
}

export default CalendlySessionTypeSelector