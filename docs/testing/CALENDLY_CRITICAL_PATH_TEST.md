# Calendly Integration Critical Path Test

This document provides a streamlined test script for quickly verifying the critical functionality of the Calendly integration before launch. Use this for final verification that essential features are working.

## Prerequisites

1. Test builder account with session types configured in Calendly
2. Test client account for booking
3. Test payment method (Stripe test card)
4. Access to application logs and database for verification

## Critical Path Tests

### 1. Session Type Availability

**Test Steps:**
1. Log in as the test client
2. Navigate to the test builder's profile page
3. Verify session types are displayed correctly

**Verification Points:**
- Session types load without errors
- Pricing displays correctly
- Duration information is accurate
- "Book" buttons are functional

**Pass/Fail Criteria:**
- PASS: All verification points confirmed
- FAIL: Any errors loading session types or inaccurate information

### 2. Booking Creation

**Test Steps:**
1. Click "Book" on a session type
2. Complete scheduling in Calendly interface
3. Verify redirect back to booking confirmation

**Verification Points:**
- Calendly interface loads properly
- Scheduling completes without errors
- Redirects correctly back to application
- Booking details match selected session

**Pass/Fail Criteria:**
- PASS: Booking created successfully with correct information
- FAIL: Any errors during scheduling or incorrect booking details

### 3. Payment Processing

**Test Steps:**
1. Click "Proceed to Payment" on booking confirmation
2. Enter test card details (use Stripe test card: 4242 4242 4242 4242)
3. Complete payment
4. Check confirmation screen

**Verification Points:**
- Payment form loads with correct amount
- Payment processes successfully
- Confirmation screen shows booking is confirmed
- Database records payment status correctly

**Pass/Fail Criteria:**
- PASS: Payment completes and booking status updates
- FAIL: Payment errors or booking status doesn't update

### 4. Webhook Processing

**Test Steps:**
1. Check logs for webhook events received
2. Verify booking status in database

**Verification Points:**
- Webhooks received and processed
- Signature verification succeeds
- Booking records updated based on webhook events

**Pass/Fail Criteria:**
- PASS: Webhooks processed correctly and booking data updated
- FAIL: Webhook processing errors or incorrect booking updates

### 5. Booking Management

**Test Steps:**
1. Log in as the test client
2. Navigate to bookings dashboard
3. Verify the booking appears correctly
4. Log in as the test builder
5. Check builder's bookings dashboard

**Verification Points:**
- Booking visible to both client and builder
- All booking details are correct
- Status shows as confirmed

**Pass/Fail Criteria:**
- PASS: Booking correctly displayed for both users
- FAIL: Missing or incorrect booking information

### 6. Cancellation Flow

**Test Steps:**
1. As client, initiate cancellation of booking
2. Confirm cancellation
3. Check status updates

**Verification Points:**
- Cancellation flow completes
- Booking status updates to cancelled
- Refund initiated if applicable

**Pass/Fail Criteria:**
- PASS: Cancellation completes and status updates
- FAIL: Errors during cancellation or incorrect status

## Quick Verification Checklist

Use this checklist for rapid verification:

- [ ] Session types load correctly
- [ ] Can successfully schedule a session
- [ ] Payment process completes
- [ ] Booking confirmation received
- [ ] Webhooks processed correctly
- [ ] Booking visible in dashboards
- [ ] Cancellation flow works

## Test Results Log

| Test | Date | Tester | Result | Notes |
|------|------|--------|--------|-------|
|      |      |        |        |       |
|      |      |        |        |       |
|      |      |        |        |       |

## Launch Approval

All critical path tests must pass for launch approval. If any test fails, document the issue and fix it before proceeding with launch.

**Launch Decision:**
- [ ] APPROVED: All critical path tests pass
- [ ] REJECTED: Critical issues identified (see notes)

Decision By: __________________ Date: __________________

Notes:
________________________________________________________________
________________________________________________________________
________________________________________________________________