import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  bookingStateMachine,
  executeTransition,
  getAllowedTransitions,
  getInitialState,
  getInitialStateData,
  getNextState,
  isValidTransition
} from '@/lib/scheduling/state-machine';
import {
  BookingStateEnum,
  BookingEventEnum,
  BookingContext
} from '@/lib/scheduling/state-machine/types';

// Mock dependencies
// Mock Datadog config
vi.mock('@/lib/datadog/config', () => ({
  getDatadogConfig: vi.fn().mockReturnValue({
    enabled: false,
    service: 'test-service',
    env: 'test',
    version: '1.0.0',
    site: 'us1.datadoghq.com',
    logSampleRate: 1.0
  })
}));

// Mock Datadog
vi.mock('dd-trace', () => ({
  tracer: {
    scope: () => ({
      active: () => ({
        context: () => ({
          toTraceId: () => 'test-trace-id',
          toSpanId: () => 'test-span-id'
        })
      })
    })
  }
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn(),
    setExtra: vi.fn(),
    setLevel: vi.fn()
  }))
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    booking: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback({
        booking: {
          update: vi.fn(),
          create: vi.fn(),
        },
        stateTransitionLog: {
          create: vi.fn(),
        }
      });
    }),
  },
  prisma: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  },
  // For backward compatibility
  enhancedLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  },
  createDomainLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}));

describe('Booking State Machine', () => {
  let mockBookingContext: BookingContext;
  
  beforeEach(() => {
    // Reset mock context before each test
    mockBookingContext = {
      bookingId: 'test-booking-id',
      state: BookingStateEnum.IDLE,
      stateData: {
        bookingId: 'test-booking-id',
        builderId: 'test-builder-id',
        clientId: 'test-client-id',
        sessionTypeId: 'test-session-type-id',
        timestamp: new Date().toISOString()
      }
    };
  });
  
  describe('Core functionality', () => {
    it('should have a valid initial state', () => {
      const initialState = getInitialState();
      expect(initialState).toBe(BookingStateEnum.IDLE);
      expect(Object.values(BookingStateEnum)).toContain(initialState);
    });
    
    it('should provide initial state data', () => {
      const initialStateData = getInitialStateData();
      expect(initialStateData).toBeDefined();
      expect(initialStateData.timestamp).toBeDefined();
    });
    
    it('should define transitions for all states', () => {
      // Every state should have defined transitions (or be a terminal state)
      Object.values(BookingStateEnum).forEach(state => {
        const stateDefinition = bookingStateMachine.states[state];
        expect(stateDefinition).toBeDefined();
        
        // Terminal states may not have transitions
        if (
          state !== BookingStateEnum.BOOKING_COMPLETED &&
          state !== BookingStateEnum.CANCELLATION_COMPLETED &&
          state !== BookingStateEnum.REFUND_COMPLETED
        ) {
          expect(stateDefinition.transitions).toBeDefined();
          expect(Object.keys(stateDefinition.transitions || {}).length).toBeGreaterThan(0);
        }
      });
    });
    
    it('should return allowed transitions for a state', () => {
      const allowedTransitions = getAllowedTransitions(BookingStateEnum.IDLE);
      expect(allowedTransitions).toContain(BookingEventEnum.SELECT_SESSION_TYPE);
      expect(allowedTransitions).toContain(BookingEventEnum.ERROR_OCCURRED);
    });
    
    it('should validate transitions correctly', () => {
      // Valid transition
      expect(isValidTransition(
        BookingStateEnum.IDLE,
        BookingEventEnum.SELECT_SESSION_TYPE
      )).toBe(true);
      
      // Invalid transition
      expect(isValidTransition(
        BookingStateEnum.IDLE,
        BookingEventEnum.PAYMENT_SUCCEEDED
      )).toBe(false);
    });
    
    it('should get next state for a valid transition', () => {
      const nextState = getNextState(
        BookingStateEnum.IDLE,
        BookingEventEnum.SELECT_SESSION_TYPE
      );
      expect(nextState).toBe(BookingStateEnum.SESSION_TYPE_SELECTED);
    });
    
    it('should return null for invalid transitions', () => {
      const nextState = getNextState(
        BookingStateEnum.IDLE,
        BookingEventEnum.PAYMENT_SUCCEEDED
      );
      expect(nextState).toBeNull();
    });
  });
  
  describe('State transitions', () => {
    it('should execute a valid state transition', async () => {
      const result = await executeTransition(
        mockBookingContext,
        { 
          event: BookingEventEnum.SELECT_SESSION_TYPE,
          data: { sessionTypeId: 'test-session-type-id' }
        }
      );
      
      expect(result.success).toBe(true);
      expect(result.previousState).toBe(BookingStateEnum.IDLE);
      expect(result.currentState).toBe(BookingStateEnum.SESSION_TYPE_SELECTED);
      expect(result.stateData.sessionTypeId).toBe('test-session-type-id');
      expect(result.timestamp).toBeDefined();
    });
    
    it('should fail for invalid state transitions', async () => {
      const result = await executeTransition(
        mockBookingContext,
        { 
          event: BookingEventEnum.PAYMENT_SUCCEEDED,
          data: {}
        }
      );
      
      expect(result.success).toBe(false);
      expect(result.previousState).toBe(BookingStateEnum.IDLE);
      expect(result.currentState).toBe(BookingStateEnum.IDLE);
      expect(result.error).toBeDefined();
    });
    
    it('should handle the error state transition', async () => {
      const result = await executeTransition(
        mockBookingContext,
        { 
          event: BookingEventEnum.ERROR_OCCURRED,
          data: { 
            error: { 
              message: 'Test error', 
              code: 'TEST_ERROR',
              timestamp: new Date().toISOString()
            }
          }
        }
      );
      
      expect(result.success).toBe(true);
      expect(result.previousState).toBe(BookingStateEnum.IDLE);
      expect(result.currentState).toBe(BookingStateEnum.ERROR);
      expect(result.stateData.error).toBeDefined();
      expect(result.stateData.error?.message).toBe('Test error');
    });
    
    it('should handle recovery from error state', async () => {
      // First, transition to error state
      const errorContext = {
        ...mockBookingContext,
        state: BookingStateEnum.ERROR,
        stateData: {
          ...mockBookingContext.stateData,
          error: {
            message: 'Test error',
            timestamp: new Date().toISOString()
          }
        }
      };
      
      const result = await executeTransition(
        errorContext,
        { 
          event: BookingEventEnum.RECOVER,
          data: { error: undefined }
        }
      );
      
      expect(result.success).toBe(true);
      expect(result.previousState).toBe(BookingStateEnum.ERROR);
      expect(result.currentState).toBe(BookingStateEnum.IDLE);
      expect(result.stateData.error).toBeUndefined();
    });
  });
  
  describe('Complete flows', () => {
    it('should handle a complete successful booking flow', async () => {
      // 1. Initial state
      let context = mockBookingContext;
      
      // 2. Select session type
      let result = await executeTransition(
        context,
        { 
          event: BookingEventEnum.SELECT_SESSION_TYPE,
          data: { sessionTypeId: 'test-session-type-id' }
        }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.SESSION_TYPE_SELECTED);
      
      // 3. Update context for next transition
      context = {
        ...context,
        state: result.currentState,
        stateData: result.stateData
      };
      
      // 4. Initiate Calendly scheduling
      result = await executeTransition(
        context,
        { event: BookingEventEnum.INITIATE_CALENDLY_SCHEDULING }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.CALENDLY_SCHEDULING_INITIATED);
      
      // 5. Update context for next transition
      context = {
        ...context,
        state: result.currentState,
        stateData: result.stateData
      };
      
      // 6. Schedule Calendly event
      result = await executeTransition(
        context,
        { 
          event: BookingEventEnum.SCHEDULE_EVENT,
          data: { 
            calendlyEventId: 'test-calendly-event-id',
            calendlyEventUri: 'test-calendly-event-uri',
            calendlyInviteeUri: 'test-calendly-invitee-uri',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString()
          }
        }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.CALENDLY_EVENT_SCHEDULED);
      
      // 7. Update context for next transition
      context = {
        ...context,
        state: result.currentState,
        stateData: result.stateData
      };
      
      // 8. Initiate payment
      result = await executeTransition(
        context,
        { event: BookingEventEnum.INITIATE_PAYMENT }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.PAYMENT_REQUIRED);
      
      // 9. Update context for next transition
      context = {
        ...context,
        state: result.currentState,
        stateData: result.stateData
      };
      
      // 10. Start payment
      result = await executeTransition(
        context,
        { 
          event: BookingEventEnum.INITIATE_PAYMENT,
          data: { stripeSessionId: 'test-stripe-session-id' }
        }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.PAYMENT_PENDING);
      
      // 11. Update context for next transition
      context = {
        ...context,
        state: result.currentState,
        stateData: result.stateData
      };
      
      // 12. Payment succeeds
      result = await executeTransition(
        context,
        { 
          event: BookingEventEnum.PAYMENT_SUCCEEDED,
          data: { stripePaymentIntentId: 'test-payment-intent-id' }
        }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.PAYMENT_SUCCEEDED);
      
      // 13. Update context for next transition
      context = {
        ...context,
        state: result.currentState,
        stateData: result.stateData
      };
      
      // 14. Booking confirmed
      result = await executeTransition(
        context,
        { event: BookingEventEnum.STRIPE_WEBHOOK_RECEIVED }
      );
      
      expect(result.currentState).toBe(BookingStateEnum.BOOKING_CONFIRMED);
      
      // Final state should be confirmed
      expect(result.stateData.bookingStatus).toBeDefined();
      expect(result.stateData.paymentStatus).toBeDefined();
    });
    
    it('should handle cancellation flow', async () => {
      // Start from BOOKING_CONFIRMED state
      const confirmedContext = {
        ...mockBookingContext,
        state: BookingStateEnum.BOOKING_CONFIRMED,
        stateData: {
          ...mockBookingContext.stateData,
          calendlyEventId: 'test-calendly-event-id',
          stripeSessionId: 'test-stripe-session-id',
          stripePaymentIntentId: 'test-payment-intent-id',
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID'
        }
      };
      
      // Request cancellation
      const result = await executeTransition(
        confirmedContext,
        { 
          event: BookingEventEnum.REQUEST_CANCELLATION,
          data: { 
            cancelReason: 'Test cancellation',
            cancelledAt: new Date().toISOString()
          }
        }
      );
      
      expect(result.success).toBe(true);
      expect(result.previousState).toBe(BookingStateEnum.BOOKING_CONFIRMED);
      expect(result.currentState).toBe(BookingStateEnum.CANCELLATION_REQUESTED);
      expect(result.stateData.cancelReason).toBe('Test cancellation');
      expect(result.stateData.cancelledAt).toBeDefined();
    });
  });
});