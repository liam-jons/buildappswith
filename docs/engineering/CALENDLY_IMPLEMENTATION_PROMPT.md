Session Context

- Session Type: Implementation
- Component Focus: Calendly Integration with Booking-to-Payment Flow
- Current Branch: feature/calendly-integration
- Related Documentation: /docs/engineering/CALENDLY_INTEGRATION.md,
/docs/engineering/CALENDLY_AUTHENTICATION.md,
/docs/engineering/CALENDLY_WEBHOOK_IMPLEMENTATION.md,
/docs/engineering/CALENDLY_SECURITY_CONSIDERATIONS.md,
/docs/engineering/CALENDLY_ERROR_HANDLING.md,
/docs/engineering/CALENDLY_PERFORMANCE_CONSIDERATIONS.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

Implementation Objectives

- Implement Calendly API integration for session type retrieval
- Create booking flow from session selection to Calendly scheduling
- Implement webhook handling for Calendly events
- Connect Calendly booking flow with existing Stripe payment processing
- Implement authentication with personal API token (with OAuth architecture for future)
- Implement security measures for API key management and webhooks
- Add error handling and performance optimizations

Implementation Plan

1. Core API Client Implementation

- Create Calendly API client with proper authentication
- Implement token management for personal API token
- Set up session type retrieval from Calendly
- Implement caching strategy for API responses
- Add error handling for API requests

2. Session Type Integration

- Create UI components for displaying Calendly session types
- Add session type fetching to builder profile page
- Implement mapping between Calendly event types and our session types
- Add pricing display for session types

3. Booking Flow Implementation

- Implement booking initiation flow
- Create preliminary booking records in database
- Generate Calendly scheduling links with metadata
- Set up redirect to Calendly scheduling interface
- Implement post-scheduling redirect handling

4. Webhook Implementation

- Create webhook endpoint for Calendly events
- Implement signature verification for webhooks
- Add handlers for different webhook event types
- Connect webhook processing to booking status updates
- Implement retry mechanism for failed webhook processing

5. Payment Integration

- Connect Calendly booking confirmation to Stripe checkout
- Implement payment flow after Calendly scheduling
- Update booking status based on payment events
- Add cancellation and refund handling
- Ensure proper metadata between systems

6. Security Implementation

- Secure token storage in environment variables
- Implement webhook signature verification
- Add rate limiting for API endpoints
- Set up secure error logging (no sensitive data)
- Implement authorization checks for booking operations

7. Error Handling

- Add centralized error handling
- Implement circuit breaker pattern for API calls
- Create fallback mechanisms for service unavailability
- Add error boundaries for UI components
- Implement transaction safety for database operations

8. Performance Optimizations

- Implement caching layer for API responses
- Add data prefetching for improved UX
- Implement connection pooling for HTTP requests
- Optimize database queries
- Add lazy loading for Calendly UI components

Technical Specifications

API Client Structure

```typescript
export class CalendlyApiClient {
  constructor(token: string) {
    this.token = token;
  }
  
  private getAuthHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  async getUserInfo(): Promise<CalendlyUser> {
    // Implementation
  }
  
  async getEventTypes(): Promise<CalendlyEventType[]> {
    // Implementation
  }
  
  // Other API methods
}
```

Webhook Handling

```typescript
export async function POST(request: NextRequest) {
  try {
    // Get raw request body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature
    const isValid = extractAndVerifySignature(
      request.headers,
      rawBody
    );
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { status: 401 }
      );
    }
    
    // Parse and process webhook payload
    // ...
  } catch (error) {
    // Error handling
  }
}
```

Database Schema Updates

```prisma
// Add to prisma/schema.prisma

model Booking {
  // Existing fields...
  
  // Calendly-specific fields
  calendlyEventId    String?
  calendlyInviteeId  String?
  calendlyData       Json?     // Stores URLs, metadata, etc.
}

// For OAuth implementation (Phase 2)
model BuilderCalendlyIntegration {
  id             String   @id @default(cuid())
  builderId      String   @unique
  builder        User     @relation(fields: [builderId], references: [id])
  accessToken    String
  refreshToken   String
  tokenExpiry    DateTime
  calendlyUserId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

Component Integration

```typescript
export function CalendlySessionTypeList({ builderId }: Props) {
  const { data, isLoading, error } = useCalendlyEventTypes(builderId);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map(sessionType => (
        <SessionTypeCard 
          key={sessionType.id}
          sessionType={sessionType}
          builderId={builderId}
          onSelect={handleSelection}
        />
      ))}
    </div>
  );
}
```

Booking Flow

1. Client selects session type on builder profile
2. System creates pending booking record
3. Client is redirected to Calendly scheduling UI
4. After scheduling, webhook updates booking details
5. Client is redirected to payment page
6. After payment, booking is confirmed

Error Handling Strategy

```typescript
export function categorizeError(error: Error): ErrorCategory {
  // Logic to categorize error type
}

export function getUserFriendlyError(error: Error): string {
  const category = categorizeError(error);
  
  // Return appropriate user-facing message based on category
}

export function handleCalendlyError(
  error: Error,
  context: Record<string, any> = {}
): { 
  message: string;
  category: ErrorCategory;
  shouldRetry: boolean;
} {
  // Log, report, and get user message
}
```

Implementation Notes

1. Start with personal API token approach for authentication but design for future OAuth
2. Ensure all API calls include proper error handling and retries
3. Implement caching to reduce API calls to Calendly
4. Secure all webhook endpoints with signature verification
5. Add comprehensive logging but ensure no sensitive data is logged
6. Test edge cases like cancellations and reschedules thoroughly
7. Ensure proper state transitions for bookings (pending → scheduled → paid → confirmed)
8. Keep Calendly-specific code isolated to make future changes easier

Expected Outputs

- Fully functional Calendly integration with end-to-end booking flow
- Webhook handling for Calendly events with proper security
- Integration with existing Stripe payment processing
- Documentation updates reflecting the implementation details
- Error handling with graceful degradation
- Performance optimizations for improved user experience
- Security implementation for API keys and webhooks
- Database schema updates for Calendly integration data

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.