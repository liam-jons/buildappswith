# Calendly Integration Manual Testing Plan

This document outlines the manual testing steps required to verify the Calendly integration functionality before launch. It covers key user flows and edge cases that should be tested to ensure a smooth experience.

## Prerequisites

1. Verified Calendly account with API access
2. Valid Calendly API token set in environment variables
3. Webhook signing key configured
4. Test builder account with session types configured
5. Test client account for booking

## Core Functionality Testing

### 1. Session Type Display

**Test Steps:**
- Log in as a client
- Navigate to a builder's profile
- Verify session types from Calendly are displayed correctly
- Verify pricing and duration information is accurate

**Expected Results:**
- Session types should load without errors
- Each session type should display name, description, duration, and price
- "Book" button should be present for each session type

**Edge Cases:**
- Test with a builder that has no session types configured
- Test with Calendly API unavailable (should show graceful error message)

### 2. Booking Flow

**Test Steps:**
- Log in as a client
- Navigate to a builder's profile
- Select a session type and click "Book"
- Complete scheduling in Calendly interface
- Verify redirect back to the application
- Verify booking confirmation screen displays correct information
- Click "Proceed to Payment"

**Expected Results:**
- Should redirect to Calendly scheduling interface
- After scheduling, should return to booking confirmation page
- Booking details should match the selected session and time
- Countdown timer should be active
- "Proceed to Payment" button should work

**Edge Cases:**
- Test cancellation during Calendly scheduling
- Test session expiry (15-minute countdown)
- Test browser refresh/navigation during flow

### 3. Payment Processing

**Test Steps:**
- Complete booking steps above
- On payment page, enter test card details
- Complete payment
- Verify booking confirmation
- Check booking status in dashboard

**Expected Results:**
- Stripe checkout should display correct session information and price
- After payment, booking should be confirmed
- Client and builder dashboards should show the booking
- Email notifications should be sent (if configured)

**Edge Cases:**
- Test payment decline
- Test cancellation during payment
- Test expired booking payment attempt

### 4. Webhook Processing

**Test Steps:**
- Create a test webhook event for each event type (use tools like Postman)
  - invitee.created
  - invitee.canceled
  - invitee.rescheduled
- Verify proper system response to each event

**Expected Results:**
- System should process webhooks and update booking records accordingly
- Created events should create/update bookings
- Canceled events should mark bookings as canceled
- Should verify webhook signatures and reject invalid ones

**Edge Cases:**
- Test with invalid signatures
- Test with missing payload fields
- Test with duplicate event IDs

### 5. Builder Experience

**Test Steps:**
- Log in as a builder
- Check dashboard for booked sessions
- Verify session details are correct
- Test cancellation of a session

**Expected Results:**
- Builder should see all booked sessions
- Session details should match Calendly data
- Cancellation should update booking status and notify client

**Edge Cases:**
- Test with multiple overlapping bookings
- Test with sessions in different timezones

## Performance Testing

**Areas to Test:**
- Loading time for session types
- Response time for booking creation
- Webhook processing time
- Calendly embed loading time

**Expected Results:**
- Session types should load in under 2 seconds
- Booking creation should complete in under 5 seconds
- Webhook processing should complete in under 3 seconds
- Calendly embed should initialize in under 3 seconds

## Security Testing

**Areas to Test:**
- API token security
- Webhook signature verification
- Authorization checks
- Data validation

**Expected Results:**
- API requests should require proper authentication
- Webhooks should fail with invalid signatures
- Only authorized users can access booking data
- Input validation should reject malformed data

## Test Scenarios for Launch Readiness

1. **Complete End-to-End Flow**
   - New client registers
   - Finds a builder
   - Books a session
   - Completes payment
   - Receives confirmation
   - Attends session
   - Builder marks session as completed

2. **Cancellation Flows**
   - Client cancels booking
   - Builder cancels booking
   - System handles refunds properly

3. **Rescheduling Flows**
   - Client reschedules via Calendly
   - Booking updates correctly
   - Payment status remains valid

4. **Error Recovery**
   - Connection interruption during booking
   - API timeout during session type loading
   - Webhook delivery failure
   - Payment processing error

## Testing Checklist

Use this checklist to mark off completed tests:

- [ ] Session type display works correctly
- [ ] Booking flow completes successfully
- [ ] Payment processing works correctly
- [ ] Webhooks are processed properly
- [ ] Builder experience is functional
- [ ] Client dashboards show bookings correctly
- [ ] Performance meets or exceeds targets
- [ ] Security measures are effective
- [ ] Cancellation flows work correctly
- [ ] Rescheduling flows work correctly
- [ ] Error recovery is graceful
- [ ] Email notifications are sent correctly (if configured)

## Issue Tracking

Document any issues found during testing with the following information:
1. Test scenario
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots/videos if applicable
6. Environment details (browser, OS, etc.)

Record all issues in the project issue tracker with the label "calendly-integration".

## Launch Approval Criteria

The following criteria must be met for approval to launch:

1. All critical user flows complete successfully
2. No high-severity bugs in core functionality
3. Performance meets or exceeds targets
4. Security measures validated
5. Payment processing verified with test transactions
6. Webhook handling confirmed for all event types

Upon completion of testing, prepare a report with results and recommendations for launch.