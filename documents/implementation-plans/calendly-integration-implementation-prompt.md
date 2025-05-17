# Calendly Integration Implementation Session Prompt

## Session Context

- **Session Type**: Implementation (Development)
- **Component Focus**: Calendly Integration with Booking-to-Payment Flow
- **Current Branch**: feature/calendly-integration
- **Related Documentation**: 
  - docs/engineering/BOOKING_SYSTEM.md
  - docs/engineering/PAYMENT_PROCESSING.md
  - docs/implementation-plans/calendly-integration-implementation-plan.md
  - docs/implementation-plans/calendly-integration-supplementary.md
- **Linear Project**: CALENDAR
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

## Component Background

This implementation session focuses on building the Phase 1 core components of our Calendly integration. We're integrating Calendly with our booking-to-payment flow to leverage Liam's existing Calendly setup (connected to Outlook calendar and Zoom) while connecting it to our Stripe payment processing.

The comprehensive planning documentation has been completed, and we now have a clear implementation roadmap. This session will focus on implementing the foundation and core integration components as outlined in Phase 1 of our implementation plan.

During the planning phase, we designed the complete architecture, API contracts, state management approach, webhook handling, and security considerations. Now we'll implement these designs starting with the core API client, database schema updates, and basic UI components.

## Implementation Objectives

For this initial implementation session, we will focus on these key Phase 1 objectives:

1. Implement the Calendly API client utility with personal access token authentication
2. Update database schema with Calendly-related fields
3. Create the API endpoints for fetching Calendly event types
4. Build the UI components for the Calendly embed integration
5. Implement the session type selection and mapping between systems
6. Connect the first part of the booking flow (session type selection to Calendly scheduling)

## Code Implementation Focus

The implementation will focus on these specific code components:

1. **Calendly API Client**
   - Create `lib/scheduling/calendly/api-client.ts` for Calendly API interactions
   - Implement authentication with personal access token
   - Add methods for fetching event types and event details

2. **Database Schema Updates**
   - Update Prisma schema with new Calendly-related fields
   - Create and run migration scripts
   - Update TypeScript types and interfaces

3. **API Endpoints**
   - Implement `app/api/scheduling/calendly/event-types/route.ts` for fetching event types
   - Implement `app/api/scheduling/calendly/scheduling-link/route.ts` for generating booking links

4. **UI Components**
   - Create `components/scheduling/calendly-embed.tsx` for the Calendly widget
   - Update `components/scheduling/client/session-type-selector.tsx` to work with Calendly data
   - Implement a booking confirmation component that bridges Calendly and our system

5. **State Management**
   - Begin implementing the booking state context for managing the flow
   - Create session storage for maintaining state during redirects

## Technical Requirements

1. **Calendly API Integration**
   - Use environment variables for storing the Calendly personal access token
   - Implement proper error handling for API calls
   - Add logging for API interactions
   - Follow Calendly API best practices for rate limiting

2. **Database Requirements**
   - Add the following fields to relevant tables:
     - `SessionType`: `calendlyEventTypeId`, `calendlyEventTypeUri`
     - `Booking`: `calendlyEventId`, `calendlyEventUri`, `calendlyInviteeUri`
   - Ensure migrations are reversible
   - Update type definitions to match schema changes

3. **UI Requirements**
   - Embed Calendly widget should maintain consistent styling with our app
   - Provide proper loading states during API calls
   - Implement error handling and retry mechanisms
   - Ensure responsive design for all new components

4. **Security Requirements**
   - Implement CSRF protection for API endpoints
   - Validate all input data with Zod schemas
   - Ensure API token is properly secured
   - Add authentication checks to all API routes

## Implementation Steps

1. **Setup Calendly API Client**
   - Create the API client structure
   - Implement authentication with personal access token
   - Add methods for interacting with Calendly endpoints
   - Implement error handling and logging

2. **Update Database Schema**
   - Add Calendly fields to the Prisma schema
   - Create migration script
   - Apply migration to development database
   - Update TypeScript type definitions

3. **Implement API Endpoints**
   - Create API route for fetching event types
   - Implement validation with Zod schemas
   - Add authentication and authorization checks
   - Create API for generating scheduling links

4. **Build UI Components**
   - Create Calendly embed component
   - Update session type selector to display Calendly data
   - Implement handlers for Calendly callbacks
   - Build confirmation screen for selected time slots

5. **Implement Initial State Management**
   - Create booking context for state management
   - Implement initial states and transitions
   - Add persistence for cross-redirect state

6. **Test the Implementation**
   - Test API endpoints with Postman or similar tool
   - Verify UI components in development environment
   - Test the flow from session type selection to Calendly scheduling
   - Document any issues or edge cases for future improvements

## Testing Approach

1. **API Testing**
   - Test each API endpoint individually
   - Verify proper error handling
   - Test with valid and invalid input
   - Check authentication and authorization

2. **UI Testing**
   - Test UI components in isolation
   - Verify proper rendering of Calendly data
   - Test user interactions and state transitions
   - Ensure responsive design at various breakpoints

3. **Integration Testing**
   - Test the complete flow from session type selection to Calendly scheduling
   - Verify data consistency between systems
   - Test with different user roles and permissions
   - Check error handling and recovery mechanisms

## Available Resources

- Calendly Personal Access Token (to be configured in environment variables)
- Planning documentation:
  - docs/implementation-plans/calendly-integration-implementation-plan.md
  - docs/implementation-plans/calendly-integration-supplementary.md
- Calendly API documentation (https://developer.calendly.com/api-docs/)
- Existing project components:
  - lib/scheduling/ - Current scheduling implementation
  - components/scheduling/ - Current booking UI components
  - lib/stripe/ - Stripe payment processing implementation

## Expected Deliverables

1. Functional Calendly API client with proper authentication
2. Updated database schema with migration scripts
3. Working API endpoints for Calendly integration
4. UI components for session type selection and Calendly embed
5. Initial implementation of booking state management
6. Functional flow from session type selection to Calendly scheduling

## Future Work (For Reference)

After completing Phase 1, these are the key components planned for future phases:

1. **Phase 2**: Integration with Stripe and complete state management
2. **Phase 3**: Security enhancements and edge case handling
3. **Phase 4**: Production deployment and monitoring

## Implementation Notes

- Follow the project's code style guidelines
- Add comprehensive comments for complex logic
- Ensure new code is well-tested
- Document any issues or edge cases encountered
- Keep the implementation modular to support future enhancements
- Consider performance implications of API calls
- Implement proper error handling throughout

This implementation session focuses on building the foundation for our Calendly integration. Future sessions will build upon this work to complete the entire booking-to-payment flow.