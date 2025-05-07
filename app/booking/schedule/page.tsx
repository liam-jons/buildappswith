'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/core/card'
import { CalendlyEmbed } from '@/components/scheduling/calendly'
import { CalendlySessionTypeSelector } from '@/components/scheduling'
import { startBookingFlow, storeBookingFlowState, BookingFlowState } from '@/lib/scheduling/calendly'
import { SessionType } from '@/lib/scheduling/types'

export default function BookingSchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const [flowState, setFlowState] = useState<BookingFlowState>({ step: 'SELECT_SESSION_TYPE' })
  
  // Get builder ID from query parameters
  const builderId = searchParams.get('builderId')
  
  // Set flow state from session storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('calendly_booking_flow')
      
      if (stored) {
        try {
          const state = JSON.parse(stored)
          setFlowState(state)
        } catch (error) {
          console.error('Error parsing booking flow state:', error)
        }
      }
    }
  }, [])
  
  // Handle session type selection
  const handleSelectSessionType = async (sessionType: SessionType) => {
    if (!user || !isLoaded) return
    
    // Start the booking flow
    const state = await startBookingFlow(
      sessionType,
      {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      `${window.location.origin}/booking/confirmation`
    )
    
    // Store the state in session storage
    storeBookingFlowState(state)
    
    // Update local state
    setFlowState(state)
  }
  
  // If not loaded, show loading state
  if (!isLoaded) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // If no builder ID, show error
  if (!builderId) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No builder specified</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4">
              Please select a builder from the marketplace to book a session.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Show different content based on the flow state
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Book a Session</h1>
        <p className="text-muted-foreground mt-2">
          Schedule a session with one of our expert builders
        </p>
      </div>
      
      {flowState.step === 'SELECT_SESSION_TYPE' && (
        <CalendlySessionTypeSelector 
          builderId={builderId}
          onSelectSessionType={handleSelectSessionType}
        />
      )}
      
      {flowState.step === 'SCHEDULE_TIME' && flowState.schedulingUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Time</CardTitle>
            <CardDescription>
              Choose an available time slot for your {flowState.sessionType?.title} session
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CalendlyEmbed 
              url={flowState.schedulingUrl}
              prefill={{
                name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                email: user?.primaryEmailAddress?.emailAddress || '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }}
              utm={{
                utmSource: 'buildappswith',
                utmMedium: 'scheduling',
                utmCampaign: 'booking'
              }}
              className="w-full"
              onEventScheduled={(event) => {
                console.log('Event scheduled:', event)
                router.push('/booking/confirmation')
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {flowState.error && (
        <Card className="mt-4 border-red-300">
          <CardContent className="pt-6">
            <p className="text-red-600">{flowState.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}