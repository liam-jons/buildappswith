import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBookingById, updateBookingStatus, updateBookingPayment } from '@/lib/scheduling/real-data/scheduling-service';
import { auth } from '@/lib/auth/auth';

// Validation schema for updating booking status
const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'])
});

// Validation schema for updating payment status
const updatePaymentSchema = z.object({
  paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed']),
  paymentId: z.string().optional()
});

/**
 * GET handler for fetching a specific booking by ID
 * Updated to use Next.js 15 promise-based params
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const params = await context.params;
    const { id } = params;
    
    // Get session for auth check
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Fetch the booking
    const booking = await getBookingById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check - only allow access to own bookings
    // unless the user is an admin
    const isAdminUser = session.user.role === 'ADMIN';
    const isBuilder = session.user.id === booking.builderId;
    const isClient = session.user.id === booking.clientId;
    
    if (!isAdminUser && !isBuilder && !isClient) {
      return NextResponse.json(
        { error: 'Not authorized to access this booking' }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json({ booking });
  } catch (error) {
    console.error(`Error fetching booking:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a booking's status
 * Updated to use Next.js 15 promise-based params
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const params = await context.params;
    const { id } = params;
    
    // Get session for auth check
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Fetch the booking first to check permissions
    const existingBooking = await getBookingById(id);
    
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check
    const isAdminUser = session.user.role === 'ADMIN';
    const isBuilder = session.user.id === existingBooking.builderId;
    const isClient = session.user.id === existingBooking.clientId;
    
    if (!isAdminUser && !isBuilder && !isClient) {
      return NextResponse.json(
        { error: 'Not authorized to update this booking' }, 
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Determine if this is a status update or payment update
    if ('status' in body) {
      // Validate status update
      const result = updateStatusSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid status data', details: result.error.flatten() }, 
          { status: 400 }
        );
      }
      
      // Only builders can confirm bookings
      // Only the user who created the booking can cancel it
      if (result.data.status === 'confirmed' && !isBuilder && !isAdminUser) {
        return NextResponse.json(
          { error: 'Only builders can confirm bookings' }, 
          { status: 403 }
        );
      }
      
      // Update the booking status
      const updatedBooking = await updateBookingStatus(id, result.data.status);
      
      return NextResponse.json({ booking: updatedBooking });
    } else if ('paymentStatus' in body) {
      // Validate payment update
      const result = updatePaymentSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid payment data', details: result.error.flatten() }, 
          { status: 400 }
        );
      }
      
      // Only admin or builder can update payment status
      if (!isAdminUser && !isBuilder) {
        return NextResponse.json(
          { error: 'Not authorized to update payment status' }, 
          { status: 403 }
        );
      }
      
      // Update the payment status
      const updatedBooking = await updateBookingPayment(
        id, 
        result.data.paymentStatus,
        result.data.paymentId
      );
      
      return NextResponse.json({ booking: updatedBooking });
    } else {
      return NextResponse.json(
        { error: 'Invalid update data' }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`Error updating booking:`, error);
    return NextResponse.json(
      { error: 'Failed to update booking' }, 
      { status: 500 }
    );
  }
}