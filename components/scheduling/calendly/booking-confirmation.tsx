'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/core/card'
import { Button } from '@/components/ui/core/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/core/alert'
import { CalendarClock, Clock, User, Check, AlertTriangle, X } from 'lucide-react'
import { Booking, SessionType } from '@/lib/scheduling/types'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'
import { formatDate, formatTime } from '@/lib/utils'

interface BookingConfirmationProps {
  booking: Booking;
  sessionType?: SessionType;
  isPending?: boolean;
  error?: string;
  onProceedToPayment?: () => void;
  onCancel?: () => void;
}

/**
 * Booking confirmation component for displaying booking details
 * and allowing the user to proceed to payment
 */
const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  sessionType,
  isPending = false,
  error,
  onProceedToPayment,
  onCancel
}) => {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<number>(0)
  
  // Setup countdown timer for booking expiration (15 minutes)
  useEffect(() => {
    if (isPending) return
    
    const expiryTime = 15 * 60 // 15 minutes in seconds
    setTimeLeft(expiryTime)
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isPending])
  
  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' + secs : secs}`
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Booking Confirmation</CardTitle>
        <CardDescription>
          {isPending ? (
            'Loading your booking details...'
          ) : error ? (
            'There was an issue with your booking'
          ) : (
            'Please confirm your booking details'
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isPending ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <LoadingSpinner className="h-8 w-8 mb-4" />
            <p>Retrieving your booking information...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {timeLeft === 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertTitle>Booking Expired</AlertTitle>
                <AlertDescription>
                  Your booking reservation has expired. Please try booking again.
                </AlertDescription>
              </Alert>
            )}
            
            {timeLeft > 0 && (
              <Alert className="mb-4">
                <Clock className="h-4 w-4 mr-2" />
                <AlertTitle>Time Remaining</AlertTitle>
                <AlertDescription>
                  Please complete your booking within {formatCountdown(timeLeft)}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Session Details
                </h3>
                <p className="text-sm mt-1">{booking.title}</p>
                {booking.description && (
                  <p className="text-sm text-gray-500 mt-1">{booking.description}</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-medium">
                    {formatDate(new Date(booking.startTime))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="text-sm font-medium">
                    {formatTime(new Date(booking.startTime))} - {formatTime(new Date(booking.endTime))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium">
                    {sessionType?.durationMinutes || 
                      Math.round(
                        (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000
                      )
                    } minutes
                  </span>
                </div>
                
                {sessionType && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="text-sm font-medium">
                      {sessionType.price} {sessionType.currency}
                    </span>
                  </div>
                )}
                
                {booking.clientTimezone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Timezone</span>
                    <span className="text-sm font-medium">{booking.clientTimezone}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button 
          onClick={onProceedToPayment}
          disabled={isPending || !!error || timeLeft === 0}
        >
          <Check className="h-4 w-4 mr-2" />
          Proceed to Payment
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BookingConfirmation