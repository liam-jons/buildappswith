# Calendly-Stripe Integration: Architecture

This document outlines the architecture for the Calendly-to-Stripe integration, detailing the components, interactions, and data flow for the complete booking process.

## 1. System Components

### 1.1 Client-Side Components

1. **SessionTypeSelector**
   - Purpose: Allow users to browse and select session types
   - Technology: React component
   - State: Uses client-side state management for selection

2. **CalendlyEmbed**
   - Purpose: Embed Calendly scheduling interface
   - Technology: React component wrapping Calendly inline widget
   - Interactions: Communicates with Calendly API, emits events on scheduling

3. **BookingConfirmation**
   - Purpose: Display booking confirmation and initiate payment
   - Technology: React component
   - State: Displays booking details and payment options

4. **PaymentFlow**
   - Purpose: Handle Stripe payment process
   - Technology: React component using Stripe Elements
   - Interactions: Redirects to Stripe Checkout, handles return

5. **BookingManagement**
   - Purpose: Allow users to view, cancel, or reschedule bookings
   - Technology: React component
   - State: Displays booking history and status

### 1.2 Server-Side Components

1. **BookingService**
   - Purpose: Manage booking creation, updates, and retrieval
   - Operations: Create, update, cancel, and fetch bookings
   - Database: Interfaces with booking repository

2. **CalendlyIntegrationService**
   - Purpose: Interact with Calendly API
   - Operations: Fetch event types, create/cancel events, process webhooks
   - Security: Manages API keys and webhook verification

3. **StripePaymentService**
   - Purpose: Process payments through Stripe
   - Operations: Create checkout sessions, verify payments, process refunds
   - Security: Manages Stripe secret keys

4. **WebhookHandlerService**
   - Purpose: Process incoming webhooks from Calendly and Stripe
   - Operations: Verify signatures, parse payload, update booking state
   - Security: Implements signature verification and replay protection

5. **StateMachineService**
   - Purpose: Manage booking flow state transitions
   - Operations: Define valid state transitions, enforce business rules
   - State: Maintains current state and history

### 1.3 External Systems

1. **Calendly**
   - Purpose: Scheduling system for availability and booking
   - Integration: REST API, webhooks
   - Data: Event types, invitees, scheduled events

2. **Stripe**
   - Purpose: Payment processing
   - Integration: REST API, webhooks, client libraries
   - Data: Checkout sessions, payment intents, refunds

### 1.4 Data Stores

1. **Primary Database**
   - Purpose: Store booking records, session types, and user data
   - Technology: PostgreSQL with Prisma ORM
   - Schema: Includes Bookings, SessionTypes, Users tables

2. **Cache**
   - Purpose: Store session data, webhook verification, and temporary state
   - Technology: Redis
   - Data: Flow state, verification tokens, session mappings

## 2. Data Flow Diagram

```
┌─────────────┐      ┌────────────┐      ┌─────────────┐      ┌──────────────┐
│             │      │            │      │             │      │              │
│   Client    │◄────►│  Calendly  │◄────►│  Calendly   │◄────►│  Webhook     │
│   Browser   │      │  Embed     │      │  Servers    │      │  Handler     │
│             │      │            │      │             │      │              │
└─────┬───────┘      └────────────┘      └─────────────┘      └──────┬───────┘
      │                                                              │
      │                                                              │
      ▼                                                              ▼
┌─────────────┐      ┌────────────┐      ┌─────────────┐      ┌──────────────┐
│             │      │            │      │             │      │              │
│  Booking    │◄────►│  Booking   │◄────►│  Database   │◄────►│  State       │
│  Service    │      │  API       │      │             │      │  Machine     │
│             │      │            │      │             │      │              │
└─────┬───────┘      └────────────┘      └─────────────┘      └──────┬───────┘
      │                                                              │
      │                                                              │
      ▼                                                              ▼
┌─────────────┐      ┌────────────┐      ┌─────────────┐      ┌──────────────┐
│             │      │            │      │             │      │              │
│  Payment    │◄────►│  Stripe    │◄────►│  Stripe     │◄────►│  Webhook     │
│  Service    │      │  Checkout  │      │  Servers    │      │  Handler     │
│             │      │            │      │             │      │              │
└─────────────┘      └────────────┘      └─────────────┘      └──────────────┘
```

## 3. Sequence Diagrams

### 3.1 Successful Booking Flow

```
┌──────┐          ┌─────────┐          ┌────────┐          ┌───────┐          ┌────────┐
│Client│          │Booking  │          │Calendly│          │Stripe │          │Webhook │
│      │          │Service  │          │        │          │       │          │Handler │
└──┬───┘          └────┬────┘          └───┬────┘          └───┬───┘          └───┬────┘
   │                   │                    │                  │                   │
   │ 1. Select Session │                    │                  │                   │
   │ Type              │                    │                  │                   │
   │ ─────────────────>│                    │                  │                   │
   │                   │                    │                  │                   │
   │ 2. Return Calendly│                    │                  │                   │
   │ URL               │                    │                  │                   │
   │ <─────────────────│                    │                  │                   │
   │                   │                    │                  │                   │
   │ 3. Schedule via   │                    │                  │                   │
   │ Calendly          │                    │                  │                   │
   │ ─────────────────────────────────────> │                  │                   │
   │                   │                    │                  │                   │
   │ 4. Booking        │                    │                  │                   │
   │ Confirmation      │                    │                  │                   │
   │ <─────────────────────────────────────|                  │                   │
   │                   │                    │                  │                   │
   │ 5. Store Calendly │                    │                  │                   │
   │ Event             │                    │                  │                   │
   │ ─────────────────>│                    │                  │                   │
   │                   │                    │                  │                   │
   │                   │                    │ 6. Send Webhook  │                   │
   │                   │                    │ ───────────────────────────────────> │
   │                   │                    │                  │                   │
   │                   │ 7. Process         │                  │                   │
   │                   │ Webhook            │                  │                   │
   │                   │ <─────────────────────────────────────────────────────── │
   │                   │                    │                  │                   │
   │ 8. Redirect to    │                    │                  │                   │
   │ Payment           │                    │                  │                   │
   │ <─────────────────│                    │                  │                   │
   │                   │                    │                  │                   │
   │ 9. Process        │                    │                  │                   │
   │ Payment           │                    │                  │                   │
   │ ─────────────────────────────────────────────────────────>                   │
   │                   │                    │                  │                   │
   │ 10. Payment       │                    │                  │                   │
   │ Confirmation      │                    │                  │                   │
   │ <─────────────────────────────────────────────────────────                   │
   │                   │                    │                  │                   │
   │                   │                    │                  │ 11. Send Payment  │
   │                   │                    │                  │ Webhook           │
   │                   │                    │                  │ ───────────────> │
   │                   │                    │                  │                   │
   │                   │ 12. Process        │                  │                   │
   │                   │ Payment Webhook    │                  │                   │
   │                   │ <─────────────────────────────────────────────────────── │
   │                   │                    │                  │                   │
   │ 13. Get Final     │                    │                  │                   │
   │ Booking Status    │                    │                  │                   │
   │ ─────────────────>│                    │                  │                   │
   │                   │                    │                  │                   │
   │ 14. Return        │                    │                  │                   │
   │ Confirmed Booking │                    │                  │                   │
   │ <─────────────────│                    │                  │                   │
   │                   │                    │                  │                   │
```

### 3.2 Cancellation Flow

```
┌──────┐          ┌─────────┐          ┌────────┐          ┌───────┐          ┌────────┐
│Client│          │Booking  │          │Calendly│          │Stripe │          │Webhook │
│      │          │Service  │          │        │          │       │          │Handler │
└──┬───┘          └────┬────┘          └───┬────┘          └───┬───┘          └───┬────┘
   │                   │                    │                  │                   │
   │ 1. Request        │                    │                  │                   │
   │ Cancellation      │                    │                  │                   │
   │ ─────────────────>│                    │                  │                   │
   │                   │                    │                  │                   │
   │                   │ 2. Cancel Event    │                  │                   │
   │                   │ in Calendly        │                  │                   │
   │                   │ ─────────────────> │                  │                   │
   │                   │                    │                  │                   │
   │                   │ 3. Cancellation    │                  │                   │
   │                   │ Confirmed          │                  │                   │
   │                   │ <───────────────── │                  │                   │
   │                   │                    │                  │                   │
   │                   │                    │ 4. Send Cancel   │                   │
   │                   │                    │ Webhook          │                   │
   │                   │                    │ ───────────────────────────────────> │
   │                   │                    │                  │                   │
   │                   │ 5. Process Cancel  │                  │                   │
   │                   │ Webhook            │                  │                   │
   │                   │ <─────────────────────────────────────────────────────── │
   │                   │                    │                  │                   │
   │                   │ 6. Issue Refund    │                  │                   │
   │                   │ ─────────────────────────────────────>                   │
   │                   │                    │                  │                   │
   │                   │ 7. Refund          │                  │                   │
   │                   │ Processed          │                  │                   │
   │                   │ <─────────────────────────────────────                   │
   │                   │                    │                  │                   │
   │                   │                    │                  │ 8. Send Refund    │
   │                   │                    │                  │ Webhook           │
   │                   │                    │                  │ ───────────────> │
   │                   │                    │                  │                   │
   │                   │ 9. Process Refund  │                  │                   │
   │                   │ Webhook            │                  │                   │
   │                   │ <─────────────────────────────────────────────────────── │
   │                   │                    │                  │                   │
   │ 10. Get           │                    │                  │                   │
   │ Cancellation      │                    │                  │                   │
   │ Status            │                    │                  │                   │
   │ ─────────────────>│                    │                  │                   │
   │                   │                    │                  │                   │
   │ 11. Return        │                    │                  │                   │
   │ Cancelled Status  │                    │                  │                   │
   │ <─────────────────│                    │                  │                   │
   │                   │                    │                  │                   │
```

## 4. Component Architecture

### 4.1 Client-Side Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Booking Flow Context                     │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Booking     │ │  Payment     │ │  Error       │        │
│  │  State       │ │  State       │ │  State       │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  Booking Flow Components                    │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Session     │ │  Calendly    │ │  Booking     │        │
│  │  Selector    │ │  Embed       │ │  Summary     │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Payment     │ │  Confirmation│ │  Error       │        │
│  │  Interface   │ │  Display     │ │  Handler     │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    API Integration Layer                    │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Booking     │ │  Calendly    │ │  Stripe      │        │
│  │  API Client  │ │  API Client  │ │  API Client  │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Server-Side Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                               │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Booking     │ │  Payment     │ │  Webhook     │        │
│  │  Endpoints   │ │  Endpoints   │ │  Endpoints   │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Booking     │ │  Calendly    │ │  Stripe      │        │
│  │  Service     │ │  Service     │ │  Service     │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  State       │ │  Webhook     │ │  Refund      │        │
│  │  Machine     │ │  Handler     │ │  Service     │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  Integration Layer                          │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Calendly    │ │  Stripe      │ │  Security    │        │
│  │  Client      │ │  Client      │ │  Utils       │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   Data Access Layer                         │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │              │ │              │ │              │        │
│  │  Booking     │ │  Session     │ │  Payment     │        │
│  │  Repository  │ │  Repository  │ │  Repository  │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 5. State Management

### 5.1 Client-Side State Management

**React Context + useReducer Pattern**

```tsx
// BookingFlowContext.tsx
interface BookingFlowState {
  step: BookingStep;
  sessionType?: SessionType;
  bookingId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  stripeSessionId?: string;
  paymentStatus?: PaymentStatus;
  error?: ErrorInfo;
}

type BookingAction = 
  | { type: 'SELECT_SESSION_TYPE', payload: SessionType }
  | { type: 'CALENDLY_SCHEDULED', payload: { calendlyEventUri: string, calendlyInviteeUri: string } }
  | { type: 'BOOKING_CREATED', payload: { bookingId: string } }
  | { type: 'PAYMENT_INITIATED', payload: { stripeSessionId: string } }
  | { type: 'PAYMENT_COMPLETED', payload: { paymentStatus: PaymentStatus } }
  | { type: 'SET_ERROR', payload: ErrorInfo }
  | { type: 'RESET_ERROR' }
  | { type: 'RESET_FLOW' };

const bookingReducer = (state: BookingFlowState, action: BookingAction): BookingFlowState => {
  switch (action.type) {
    case 'SELECT_SESSION_TYPE':
      return {
        ...state,
        step: 'CALENDLY_SCHEDULING',
        sessionType: action.payload,
      };
    case 'CALENDLY_SCHEDULED':
      return {
        ...state,
        step: 'BOOKING_CREATION',
        calendlyEventUri: action.payload.calendlyEventUri,
        calendlyInviteeUri: action.payload.calendlyInviteeUri,
      };
    // Additional cases for other actions
    default:
      return state;
  }
};

// Persistence utilities
const storeBookingState = (state: BookingFlowState) => {
  sessionStorage.setItem('bookingFlowState', JSON.stringify(state));
};

const loadBookingState = (): BookingFlowState | null => {
  const stored = sessionStorage.getItem('bookingFlowState');
  return stored ? JSON.parse(stored) : null;
};
```

### 5.2 Server-Side State Management

**State Machine Implementation**

```typescript
// booking-state-machine.ts
interface BookingStateMachine {
  initialState: string;
  states: {
    [key: string]: {
      transitions: {
        [event: string]: string;
      };
      onEntry?: (context: BookingContext) => Promise<void>;
      onExit?: (context: BookingContext) => Promise<void>;
    };
  };
}

interface BookingContext {
  bookingId: string;
  sessionTypeId: string;
  clientId: string;
  builderProfileId: string;
  calendlyEventUri?: string;
  stripeSessionId?: string;
  paymentStatus?: string;
  currentState: string;
  stateHistory: Array<{
    state: string;
    timestamp: Date;
    trigger: string;
  }>;
}

const bookingStateMachine: BookingStateMachine = {
  initialState: 'PENDING',
  states: {
    'PENDING': {
      transitions: {
        'CALENDLY_WEBHOOK_RECEIVED': 'AWAITING_PAYMENT',
        'CANCEL': 'CANCELLED',
      },
      onEntry: async (context) => {
        // Log entry to pending state
        await logStateTransition(context, 'PENDING');
      },
    },
    'AWAITING_PAYMENT': {
      transitions: {
        'PAYMENT_SUCCEEDED': 'CONFIRMED',
        'PAYMENT_FAILED': 'PAYMENT_FAILED',
        'CANCEL': 'CANCELLED',
      },
      onEntry: async (context) => {
        // Create Stripe checkout session
        await createStripeCheckoutSession(context);
      },
    },
    // Additional states defined here
  },
};

// State transition function
async function transition(
  context: BookingContext,
  event: string,
  payload?: any
): Promise<BookingContext> {
  const currentState = context.currentState;
  const stateDefinition = bookingStateMachine.states[currentState];
  
  if (!stateDefinition) {
    throw new Error(`Invalid state: ${currentState}`);
  }
  
  const nextState = stateDefinition.transitions[event];
  
  if (!nextState) {
    throw new Error(`Invalid transition from ${currentState} with event ${event}`);
  }
  
  // Call exit handler for current state
  if (stateDefinition.onExit) {
    await stateDefinition.onExit(context);
  }
  
  // Update context with new state
  const updatedContext = {
    ...context,
    currentState: nextState,
    stateHistory: [
      ...context.stateHistory,
      {
        state: nextState,
        timestamp: new Date(),
        trigger: event,
      },
    ],
    ...(payload || {}),
  };
  
  // Call entry handler for new state
  const nextStateDefinition = bookingStateMachine.states[nextState];
  if (nextStateDefinition.onEntry) {
    await nextStateDefinition.onEntry(updatedContext);
  }
  
  // Persist updated context
  await saveBookingContext(updatedContext);
  
  return updatedContext;
}
```

## 6. Error Handling and Recovery

### 6.1 Error Classification

| Error Type | Description | Recovery Strategy |
|------------|-------------|-------------------|
| `TRANSIENT_ERROR` | Temporary issue that may resolve | Automatic retry with exponential backoff |
| `VALIDATION_ERROR` | Data format or validation issues | User notification and correction |
| `PAYMENT_ERROR` | Issues with payment processing | Redirect to payment retry page |
| `INTEGRATION_ERROR` | Problems with external APIs | Automatic retry, then fallback |
| `SYSTEM_ERROR` | Internal system issues | Alert, log, and manual intervention |

### 6.2 Recovery Mechanisms

1. **Automatic Retries**
   - Implement retry strategies with exponential backoff
   - Track retry attempts and set appropriate limits
   - Log each retry with context for debugging

2. **Session Recovery**
   - Store recovery tokens in database and browser storage
   - Generate recovery links in emails for cross-device recovery
   - Implement bookmark-friendly URLs with state parameters

3. **Parallel Processing**
   - Use optimistic updates with confirmation
   - Implement compensating transactions for rollback
   - Track operation idempotency keys

4. **Manual Intervention**
   - Create admin interface for managing stuck bookings
   - Implement notification system for critical errors
   - Provide override capabilities for admins

## 7. Security Considerations

### 7.1 API Key Management

1. **Calendly API Keys**
   - Store encrypted in secure environment variables
   - Implement key rotation every 90 days
   - Use read-only keys when possible

2. **Stripe API Keys**
   - Use separate test/production keys
   - Restrict key permissions to necessary operations
   - Monitor key usage for anomalies

### 7.2 Webhook Security

1. **Signature Verification**
   - Verify all webhook payloads with HMAC signatures
   - Implement timestamp validation to prevent replay attacks
   - Reject requests with invalid signatures

2. **IP Allowlisting**
   - Restrict webhook endpoints to known IP ranges
   - Log and alert on requests from unauthorized IPs
   - Implement rate limiting per source IP

3. **Payload Sanitization**
   - Validate all incoming webhook data against schemas
   - Sanitize data before storage
   - Implement payload size limits

### 7.3 Payment Data Security

1. **PCI Compliance**
   - Never store credit card data
   - Use Stripe's hosted checkout for payment collection
   - Implement HTTPS for all communications

2. **Data Minimization**
   - Only store necessary payment references
   - Mask sensitive data in logs
   - Implement data retention policies

## 8. Monitoring and Observability

### 8.1 Key Metrics

1. **Business Metrics**
   - Booking conversion rate
   - Payment success rate
   - Cancellation/refund rate
   - Average booking value

2. **Technical Metrics**
   - API response times
   - Webhook processing latency
   - Error rates by category
   - State transition timing

### 8.2 Logging Strategy

1. **Structured Logging**
   - Use JSON format for all logs
   - Include correlation IDs across systems
   - Log state transitions and key events

2. **Sensitive Data Handling**
   - Mask PII and sensitive data in logs
   - Use secure log storage and transmission
   - Implement log retention policies

### 8.3 Alerts

1. **Critical Alerts**
   - Failed webhook processing
   - Payment processing errors
   - Database connectivity issues
   - High error rates

2. **Warning Alerts**
   - Elevated latency
   - Retry threshold reached
   - Unusual booking patterns
   - API rate limit approaching

## 9. Deployment and Testing

### 9.1 Testing Strategy

1. **Unit Testing**
   - Test state machine transitions
   - Validate schema validations
   - Test error handling

2. **Integration Testing**
   - Test API endpoints with mocked external services
   - Verify webhook handling with sample payloads
   - Test recovery mechanisms

3. **End-to-End Testing**
   - Use Calendly and Stripe test modes
   - Simulate full booking flow
   - Test cancellation and refund processes

### 9.2 Deployment Approach

1. **Feature Flagging**
   - Deploy behind feature flags
   - Enable gradually by user segment
   - Support easy rollback

2. **Database Migrations**
   - Use backwards-compatible migrations
   - Test migrations on production-like data
   - Include rollback procedures

3. **API Versioning**
   - Maintain compatibility with existing clients
   - Use explicit API versions
   - Implement deprecation notices