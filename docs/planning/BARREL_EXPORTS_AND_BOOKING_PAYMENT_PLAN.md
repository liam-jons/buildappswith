# Barrel Exports and Booking-to-Payment Flow Implementation Plan

## 1. Current Status Analysis

### Barrel Exports Issues

1. **Incomplete Implementation**:
   - Most barrel files contain only commented-out examples
   - Core UI barrel exports (`components/ui/core/index.ts`) are missing actual exports
   - Domain-specific barrel exports (e.g., `components/scheduling/ui/index.ts`) are empty

2. **Component Organization**:
   - Components follow the correct structure (domain-based with UI subfolders)
   - Folder structure is correct as per the design guide
   - Import standards document (`COMPONENT_STYLE_GUIDE.md`) is clear and comprehensive

3. **Current Import Practice**:
   - Components are currently being imported directly contrary to standards
   - Example: `import { Button } from "@/components/ui/button"` instead of `import { Button } from "@/components/ui"`

### Booking-to-Payment Flow Issues

1. **Incomplete Server Actions**:
   - Server actions for scheduling (`lib/scheduling/actions.ts`) contain only comments
   - Server actions for payment (`lib/stripe/actions.ts`) contain only comments

2. **Component Implementation Status**:
   - Client-side components are well-implemented (`BookingForm`, `SessionTypeSelector`)
   - Stripe client utilities are robust (`stripe-client.ts`)
   - Payment status UI is comprehensive (`PaymentStatusIndicator`)

3. **Missing Type Definitions**:
   - Types for scheduling only contain commented examples
   - Types for Stripe payments only contain commented examples
   - Client-side is using placeholder interfaces

4. **Integration Gaps**:
   - API routes are implemented but lack server actions integration
   - `completeBookingWithPayment` function needs server-side counterpart
   - No clear state management between booking selection and payment

## 2. Barrel Exports Implementation Strategy

### Step 1: UI Components Barrel Files

Implement barrel exports for the core UI components first:

```typescript
// components/ui/core/index.ts
export * from './accordion';
export * from './alert';
export * from './avatar';
export * from './badge';
export * from './button';
export * from './card';
export * from './checkbox';
export * from './dialog';
export * from './dropdown-menu';
export * from './form';
export * from './input';
export * from './label';
export * from './loading-spinner';
export * from './popover';
export * from './radio-group';
export * from './select';
export * from './separator';
export * from './sonner';
export * from './switch';
export * from './table';
export * from './tabs';
export * from './textarea';
export * from './tooltip';
```

### Step 2: Domain-Specific Components

Implement domain-specific barrel exports:

```typescript
// components/scheduling/ui/index.ts
export { default as SessionTypeSelector } from '../client/session-type-selector';
export { default as BookingForm } from '../client/booking-form';
export { default as BookingCalendar } from '../client/booking-calendar';
export { default as TimeSlotSelector } from '../client/time-slot-selector';
export { default as TimezoneSelector } from '../shared/timezone-selector';
```

```typescript
// components/payment/ui/index.ts
export { PaymentStatusIndicator } from '../payment-status-indicator';
```

### Step 3: Update Domain Barrel Files

Ensure domain barrel files re-export domain-specific components and UI components:

```typescript
// components/scheduling/index.ts
export * from './ui';
export { default as SessionTypeEditor } from './builder/session-type-editor';
export { default as WeeklySchedule } from './builder/weekly-schedule';
```

```typescript
// components/payment/index.ts
export * from './ui';
export { PaymentStatusIndicator } from './payment-status-indicator';
```

### Step 4: Script for Automatic Barrel Generation

Create a script to auto-generate barrel exports for all component directories:

```typescript
// scripts/generate-barrel-exports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Process a directory to create or update its barrel file
function processDirectory(dir) {
  const files = glob.sync(path.join(dir, '*.{ts,tsx}'))
    .filter(file => !file.includes('index.ts'));
  
  const imports = files.map(file => {
    const basename = path.basename(file, path.extname(file));
    return `export * from './${basename}';`;
  }).join('\n');
  
  const barrelContent = `/**
 * Auto-generated barrel export file
 * Version: 1.0.0
 */

${imports}
`;

  fs.writeFileSync(path.join(dir, 'index.ts'), barrelContent);
  console.log(`Generated barrel file for ${dir}`);
}

// Process all component directories
const componentDirs = glob.sync('components/**/');
componentDirs.forEach(processDirectory);
```

## 3. Booking-to-Payment Flow Implementation

### Step 1: Define Type Definitions

Start by implementing the required type definitions:

```typescript
// lib/scheduling/types.ts
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface SessionType {
  id: string;
  builderId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  color?: string;
  maxParticipants?: number;
}

export interface Booking {
  id: string;
  builderId: string;
  clientId: string;
  sessionTypeId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount?: number;
  stripeSessionId?: string;
  clientTimezone?: string;
  builderTimezone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  sessionTypeId: string;
  builderId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  clientTimezone?: string;
}

export interface BookingResponse {
  booking: Booking;
}
```

```typescript
// lib/stripe/types.ts
export enum StripeWebhookEventType {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED = 'payment_intent.payment_failed',
}

export interface StripeCheckoutMetadata {
  bookingId: string;
  builderId: string;
  clientId: string;
  sessionTypeId: string;
}

export interface CheckoutSessionRequest {
  bookingData: {
    id?: string;
    builderId: string;
    sessionTypeId: string;
    startTime: string;
    endTime: string;
    clientId?: string;
  };
  returnUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}
```

### Step 2: Implement Server Actions for Scheduling

```typescript
// lib/scheduling/actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { logger } from '../logger'
import type { 
  SessionType, 
  TimeSlot, 
  Booking, 
  BookingRequest, 
  BookingStatus 
} from './types'

const prisma = new PrismaClient()

/**
 * Get all session types for a builder
 * @param builderId ID of the builder
 * @returns Array of session types
 */
export async function getSessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId,
        isActive: true
      },
      orderBy: {
        durationMinutes: 'asc'
      }
    })

    return sessionTypes.map(st => ({
      id: st.id,
      builderId: st.builderId,
      title: st.title,
      description: st.description,
      durationMinutes: st.durationMinutes,
      price: st.price.toNumber(),
      currency: st.currency,
      isActive: st.isActive,
      color: st.color || undefined,
      maxParticipants: st.maxParticipants || undefined
    }))
  } catch (error) {
    logger.error('Error getting session types', { error, builderId })
    throw new Error('Failed to get session types')
  }
}

/**
 * Get available time slots for a builder
 * @param builderId ID of the builder
 * @param date Date to check availability for
 * @param sessionTypeId Optional session type ID to filter by duration
 * @returns Array of available time slots
 */
export async function getAvailableTimeSlots(
  builderId: string,
  date: string,
  sessionTypeId?: string
): Promise<TimeSlot[]> {
  try {
    // This would typically involve complex logic with availability rules,
    // exceptions, and existing bookings. For now, we're returning mock data.
    // In a real implementation, this would query the database for availability rules,
    // check for exceptions, and filter out booked slots.
    
    const startDate = new Date(date)
    startDate.setHours(9, 0, 0, 0)
    
    const endDate = new Date(date)
    endDate.setHours(17, 0, 0, 0)
    
    const timeSlots: TimeSlot[] = []
    let currentTime = new Date(startDate)
    
    // Get session duration from sessionTypeId if provided
    let slotDuration = 60 // Default 60 minutes
    if (sessionTypeId) {
      const sessionType = await prisma.sessionType.findUnique({
        where: { id: sessionTypeId }
      })
      
      if (sessionType) {
        slotDuration = sessionType.durationMinutes
      }
    }
    
    // Generate time slots for the day
    while (currentTime < endDate) {
      const slotStart = new Date(currentTime)
      const slotEnd = new Date(currentTime)
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)
      
      if (slotEnd <= endDate) {
        timeSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true
        })
      }
      
      // Move to next slot (30-minute increments)
      currentTime.setMinutes(currentTime.getMinutes() + 30)
    }
    
    return timeSlots
  } catch (error) {
    logger.error('Error getting available time slots', { error, builderId, date })
    throw new Error('Failed to get available time slots')
  }
}

/**
 * Create a new booking
 * @param bookingData Booking request data
 * @returns Created booking
 */
export async function createBooking(bookingData: BookingRequest): Promise<Booking> {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Not authenticated')
    }
    
    // Verify this is the correct client
    if (bookingData.clientId !== userId) {
      throw new Error('Not authorized to create this booking')
    }
    
    // Get session type
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: bookingData.sessionTypeId }
    })
    
    if (!sessionType) {
      throw new Error('Session type not found')
    }
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        builderId: bookingData.builderId,
        clientId: bookingData.clientId,
        sessionTypeId: bookingData.sessionTypeId,
        title: sessionType.title,
        description: sessionType.description,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        amount: sessionType.price,
        clientTimezone: bookingData.clientTimezone,
        notes: bookingData.notes
      }
    })
    
    // Return booking data
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount?.toNumber(),
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined,
      notes: booking.notes || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }
  } catch (error) {
    logger.error('Error creating booking', { error, bookingData })
    throw new Error('Failed to create booking')
  }
}

/**
 * Update a booking's status
 * @param bookingId ID of the booking to update
 * @param status New booking status
 * @param paymentStatus New payment status
 * @returns Updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  paymentStatus?: string
): Promise<Booking> {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Not authenticated')
    }
    
    // Get booking to verify ownership
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!existingBooking) {
      throw new Error('Booking not found')
    }
    
    // Only allow clients to update their own bookings or builders to update bookings they're involved in
    if (existingBooking.clientId !== userId && existingBooking.builderId !== userId) {
      throw new Error('Not authorized to update this booking')
    }
    
    // Update booking status
    const updateData: any = { status }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }
    
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    })
    
    // Revalidate paths that might display this booking
    revalidatePath(`/booking/${bookingId}`)
    
    // Return updated booking
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount?.toNumber(),
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined,
      notes: booking.notes || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }
  } catch (error) {
    logger.error('Error updating booking status', { error, bookingId, status })
    throw new Error('Failed to update booking status')
  }
}
```

### Step 3: Implement Server Actions for Payments

```typescript
// lib/stripe/actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { z } from 'zod'
import { logger } from '../logger'
import type { CheckoutSessionRequest, CheckoutSessionResponse } from './types'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-02-15',
})

/**
 * Create a Stripe checkout session for a booking
 * @param request Checkout session request data
 * @returns Checkout session response with URL and session ID
 */
export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Not authenticated')
    }
    
    // Verify this is the correct client
    if (request.bookingData.clientId && request.bookingData.clientId !== userId) {
      throw new Error('Not authorized to create this checkout session')
    }
    
    // Get or create booking
    let booking
    if (request.bookingData.id) {
      // Get existing booking
      booking = await prisma.booking.findUnique({
        where: { id: request.bookingData.id },
        include: {
          sessionType: true,
        }
      })
      
      if (!booking) {
        throw new Error('Booking not found')
      }
      
      // Verify ownership
      if (booking.clientId !== userId) {
        throw new Error('Not authorized to access this booking')
      }
    } else {
      // For the implementation plan, we'll assume the booking is created separately
      // and we're just processing an existing booking here
      throw new Error('Booking ID is required')
    }
    
    // Get session type
    const sessionType = booking.sessionType
    
    if (!sessionType) {
      throw new Error('Session type not found')
    }
    
    // Find the client's Stripe customer ID or create a new one
    let stripeCustomerId = booking.client?.stripeCustomerId
    
    if (!stripeCustomerId) {
      // Get client details
      const user = await prisma.user.findUnique({
        where: { id: booking.clientId }
      })
      
      if (!user) {
        throw new Error('Client not found')
      }
      
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id
        }
      })
      
      stripeCustomerId = customer.id
      
      // Save the Stripe customer ID to the user
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      })
    }
    
    // Calculate amount in cents
    const amount = Math.round(sessionType.price.toNumber() * 100)
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: sessionType.currency.toLowerCase(),
            product_data: {
              name: sessionType.title,
              description: `${sessionType.description} (${booking.startTime.toISOString().slice(0, 10)})`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${request.returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=cancelled`,
      metadata: {
        bookingId: booking.id,
        builderId: booking.builderId,
        clientId: booking.clientId,
        sessionTypeId: booking.sessionTypeId,
      },
    })
    
    // Update booking with Stripe session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id }
    })
    
    // Return checkout session details
    return {
      sessionId: session.id,
      url: session.url || '',
    }
  } catch (error) {
    logger.error('Error creating checkout session', { error, request })
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Update booking after successful payment
 * @param sessionId Stripe checkout session ID
 * @returns Success status
 */
export async function handleSuccessfulPayment(sessionId: string): Promise<boolean> {
  try {
    // Find booking with this Stripe session ID
    const booking = await prisma.booking.findFirst({
      where: { stripeSessionId: sessionId }
    })
    
    if (!booking) {
      throw new Error('Booking not found for this session')
    }
    
    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      }
    })
    
    // Revalidate paths
    revalidatePath(`/booking/${booking.id}`)
    revalidatePath(`/dashboard/bookings`)
    
    return true
  } catch (error) {
    logger.error('Error handling successful payment', { error, sessionId })
    throw new Error('Failed to process successful payment')
  }
}
```

### Step 4: Update API Routes

The booking API route needs to call the server actions:

```typescript
// app/api/scheduling/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/api-auth'
import { createBooking } from '@/lib/scheduling/actions'
import { BookingRequest } from '@/lib/scheduling/types'
import { logger } from '@/lib/logger'

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Parse request body
    const bookingData: BookingRequest = await request.json()
    
    // Create booking using server action
    const booking = await createBooking(bookingData)
    
    // Return booking data
    return NextResponse.json({ booking })
  } catch (error: any) {
    logger.error('Error creating booking', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
})
```

### Step 5: Create Integration Between Components

Create a top-level booking page component that handles the state between session selection, time slot selection, and payment:

```tsx
// app/(platform)/booking/[builderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { 
  SessionTypeSelector,
  BookingCalendar, 
  TimeSlotSelector,
  BookingForm 
} from '@/components/scheduling'
import { PaymentStatusIndicator } from '@/components/payment'
import { getSessionTypes, getAvailableTimeSlots } from '@/lib/scheduling/actions'
import { SessionType, TimeSlot } from '@/lib/scheduling/types'

export default function BookingPage() {
  const { builderId } = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  
  const [step, setStep] = useState(1)
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch session types
  useEffect(() => {
    async function fetchSessionTypes() {
      try {
        if (!builderId) return
        
        const types = await getSessionTypes(builderId as string)
        setSessionTypes(types)
        setIsLoading(false)
      } catch (error: any) {
        setError(error.message || 'Failed to load session types')
        setIsLoading(false)
      }
    }
    
    fetchSessionTypes()
  }, [builderId])
  
  // Fetch available time slots when date or session type changes
  useEffect(() => {
    async function fetchTimeSlots() {
      try {
        if (!builderId || !selectedDate) return
        
        setIsLoading(true)
        const timeSlots = await getAvailableTimeSlots(
          builderId as string,
          selectedDate.toISOString().split('T')[0],
          selectedSessionType?.id
        )
        
        setAvailableTimeSlots(timeSlots)
        setIsLoading(false)
      } catch (error: any) {
        setError(error.message || 'Failed to load time slots')
        setIsLoading(false)
      }
    }
    
    if (selectedSessionType && selectedDate) {
      fetchTimeSlots()
    }
  }, [builderId, selectedSessionType, selectedDate])
  
  // Handle session type selection
  const handleSessionTypeSelect = (sessionType: SessionType) => {
    setSelectedSessionType(sessionType)
    setStep(2)
  }
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setStep(3)
  }
  
  // Handle booking completion
  const handleBookingComplete = () => {
    // This will be handled by the Stripe redirect
    // The confirmation will happen when returning from Stripe
  }
  
  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }
  
  if (!isLoaded) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <div>Please log in to book a session</div>
  }
  
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Book a Session</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <Tabs value={`step-${step}`} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger 
              value="step-1" 
              disabled={step !== 1}
              onClick={() => setStep(1)}
            >
              1. Select Session Type
            </TabsTrigger>
            <TabsTrigger 
              value="step-2" 
              disabled={step !== 2}
              onClick={() => selectedSessionType && setStep(2)}
            >
              2. Select Date & Time
            </TabsTrigger>
            <TabsTrigger 
              value="step-3" 
              disabled={step !== 3}
              onClick={() => selectedTimeSlot && setStep(3)}
            >
              3. Confirm & Pay
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="step-1" className="mt-6">
            {isLoading ? (
              <div>Loading session types...</div>
            ) : (
              <SessionTypeSelector 
                sessionTypes={sessionTypes}
                onSelect={handleSessionTypeSelect}
              />
            )}
          </TabsContent>
          
          <TabsContent value="step-2" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select a Date</h3>
                <BookingCalendar 
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
                {isLoading ? (
                  <div>Loading time slots...</div>
                ) : (
                  <TimeSlotSelector 
                    timeSlots={availableTimeSlots}
                    onSelect={handleTimeSlotSelect}
                  />
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button 
                onClick={handleBack}
                className="text-primary hover:underline"
              >
                Back to Session Types
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="step-3" className="mt-6">
            {selectedSessionType && selectedTimeSlot ? (
              <BookingForm 
                sessionType={selectedSessionType}
                timeSlot={selectedTimeSlot}
                builderId={builderId as string}
                onComplete={handleBookingComplete}
                onBack={handleBack}
              />
            ) : (
              <div>Please select a session type and time slot first</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
```

## 4. Implementation Plan

### Phase 1: Barrel Exports Standardization (1-2 days)

1. **Create Script to Analyze Current Files**:
   - Build a script to scan component directories
   - Create inventory of files needing barrel exports
   - Generate report of missing exports

2. **Implement Core UI Barrel Exports**:
   - Add exports to `components/ui/core/index.ts`
   - Validate exports work correctly
   - Update UI component documentation

3. **Implement Domain Barrel Exports**:
   - Add exports to each domain's UI folder
   - Implement domain-level re-exports
   - Test component imports using new barrel files

4. **Create Script for Automatic Updates**:
   - Build `generate-barrel-exports.js` script
   - Test on development environment
   - Document usage for future components

### Phase 2: Type and Schema Implementation (1 day)

1. **Define Scheduling Types**:
   - Implement core types in `lib/scheduling/types.ts`
   - Add Zod validation schemas
   - Document type structures

2. **Define Payment Types**:
   - Implement core types in `lib/stripe/types.ts`
   - Define Stripe-specific interfaces
   - Document webhook and event structures

3. **Create Tests for Type Validation**:
   - Write unit tests for type structures
   - Validate schema transformations
   - Document edge cases and constraints

### Phase 3: Server Actions Implementation (2-3 days)

1. **Scheduling Server Actions**:
   - Implement in `lib/scheduling/actions.ts`
   - Add session type management
   - Add booking CRUD operations
   - Add time slot generation

2. **Payment Server Actions**:
   - Implement in `lib/stripe/actions.ts`
   - Add checkout session creation
   - Add webhook handling
   - Add payment status updates

3. **Unit Test Server Actions**:
   - Create tests for scheduling actions
   - Create tests for payment actions
   - Test error handling and edge cases

### Phase 4: API Integration (1-2 days)

1. **Update Scheduling API Routes**:
   - Update `app/api/scheduling/bookings/route.ts`
   - Update `app/api/scheduling/session-types/route.ts`
   - Test API routes with Postman or similar tool

2. **Update Stripe API Routes**:
   - Update `app/api/stripe/checkout/route.ts`
   - Update `app/api/stripe/webhook/route.ts`
   - Test with Stripe CLI webhook forwarding

### Phase 5: UI Integration and Testing (1-2 days)

1. **Build Booking Page Flow**:
   - Implement `app/(platform)/booking/[builderId]/page.tsx`
   - Build state management between steps
   - Connect to server actions

2. **Create Confirmation Page**:
   - Implement `app/(platform)/booking/confirmation/page.tsx`
   - Add payment status checking
   - Handle redirect from Stripe

3. **End-to-End Testing**:
   - Create test scenarios for complete flow
   - Test with Stripe test cards
   - Validate booking database records

## 5. Testing Plan

### Unit Tests

1. **Barrel Export Tests**:
   - Verify all components are exportable from barrel files
   - Check for circular dependencies
   - Test importing patterns

2. **Server Action Tests**:
   - Test `getSessionTypes()` with various builder IDs
   - Test `createBooking()` with valid and invalid data
   - Test `createCheckoutSession()` with mock Stripe

3. **Type Validation Tests**:
   - Test Zod schema validation for all request types
   - Test transformation functions for database models

### Integration Tests

1. **API Route + Server Action Tests**:
   - Test booking API with authenticated requests
   - Test Stripe checkout API with mock payments
   - Test webhook handling with Stripe webhook events

2. **Component + Server Action Tests**:
   - Test `SessionTypeSelector` with real data
   - Test `BookingForm` with form submissions
   - Test payment status updates

### End-to-End Tests

1. **Complete Booking Flow Tests**:
   - Test selecting session type, date/time, and confirming booking
   - Test Stripe checkout session creation and redirect
   - Test payment confirmation and booking status update

2. **Error Handling Tests**:
   - Test network failures during checkout
   - Test Stripe payment failures
   - Test session expiry handling

## 6. Performance Considerations

1. **Server Actions Optimization**:
   - Use caching for session types
   - Implement debouncing for time slot generation
   - Add pagination for booking lists

2. **Database Queries**:
   - Use selective includes to reduce data transfer
   - Create appropriate indexes for booking lookups
   - Add query timeout handling

3. **Client-Side Performance**:
   - Implement optimistic UI updates
   - Add suspense boundaries for data loading
   - Use skeleton loading states

## 7. Security Considerations

1. **Authentication & Authorization**:
   - Ensure all server actions check authentication
   - Implement ownership verification for bookings
   - Add rate limiting for checkout creation

2. **Payment Data Handling**:
   - Never store full credit card information
   - Use Stripe's hosted checkout for PCI compliance
   - Implement webhook signature verification

3. **Input Validation**:
   - Use Zod schemas for all input validation
   - Sanitize all user inputs
   - Implement request size limits

## 8. Recommendations

1. **Short-term Recommendations**:
   - Implement barrel export script to automate the process
   - Add comprehensive logging for payment processes
   - Create dashboard for builders to view bookings

2. **Long-term Recommendations**:
   - Consider subscriptions for recurring sessions
   - Add cancellation and refund functionality
   - Implement calendar integration (Google, Outlook)
   - Create email notifications for bookings

## 9. Conclusion

The implementation of standardized barrel exports and completing the booking-to-payment flow will significantly improve the platform's maintainability and core functionality. By following the structured approach outlined in this plan, we can ensure consistent implementations that adhere to best practices and deliver a robust, user-friendly booking experience.

The plan addresses both immediate needs (fixing barrel exports, implementing server actions) and lays the groundwork for future enhancements. By focusing on type safety, proper error handling, and comprehensive testing, the implementation will result in a reliable system that forms a critical revenue-generating component of the platform.